import { readFile, writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { RedditTokens } from '@/types';

const TOKENS_FILE = join(process.cwd(), '.reddit-tokens.json');
const STATE_FILE = join(process.cwd(), '.reddit-state.json');

function getClientId() { return process.env.REDDIT_CLIENT_ID || ''; }
function getClientSecret() { return process.env.REDDIT_CLIENT_SECRET || ''; }
function getRedirectUri() { return process.env.REDDIT_REDIRECT_URI || 'http://localhost:3000/auth/reddit/callback'; }
function getUserAgent() { return process.env.REDDIT_USER_AGENT || 'web:biteclub-poster:v1.0 (by /u/biteclub)'; }

function basicAuth(): string {
  return Buffer.from(`${getClientId()}:${getClientSecret()}`).toString('base64');
}

export async function getAuthUrl(): Promise<string> {
  const state = Math.random().toString(36).substring(2);
  await writeFile(STATE_FILE, JSON.stringify({ state }));

  const params = new URLSearchParams({
    client_id: getClientId(),
    response_type: 'code',
    state,
    redirect_uri: getRedirectUri(),
    duration: 'permanent',
    scope: 'submit read identity',
  });
  return `https://www.reddit.com/api/v1/authorize?${params}`;
}

export async function exchangeCode(code: string): Promise<RedditTokens> {
  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': getUserAgent(),
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: getRedirectUri(),
    }),
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(`Reddit auth error: ${data.error}`);
  }

  // Fetch username
  const meRes = await fetch('https://oauth.reddit.com/api/v1/me', {
    headers: {
      Authorization: `Bearer ${data.access_token}`,
      'User-Agent': getUserAgent(),
    },
  });
  const me = await meRes.json();

  const tokens: RedditTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
    username: me.name || 'unknown',
  };

  await saveTokens(tokens);

  // Clean up state file
  try { await unlink(STATE_FILE); } catch {}

  return tokens;
}

export async function refreshTokens(): Promise<RedditTokens> {
  const current = await getTokens();
  if (!current) throw new Error('No tokens to refresh');

  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': getUserAgent(),
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: current.refresh_token,
    }),
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(`Reddit refresh error: ${data.error}`);
  }

  const tokens: RedditTokens = {
    access_token: data.access_token,
    refresh_token: current.refresh_token, // Reddit doesn't return a new refresh token
    expires_at: Date.now() + data.expires_in * 1000,
    username: current.username,
  };

  await saveTokens(tokens);
  return tokens;
}

export async function getValidTokens(): Promise<RedditTokens | null> {
  const tokens = await getTokens();
  if (!tokens) return null;

  if (tokens.expires_at < Date.now() + 5 * 60 * 1000) {
    try {
      return await refreshTokens();
    } catch {
      return null;
    }
  }

  return tokens;
}

export async function getTokens(): Promise<RedditTokens | null> {
  try {
    const content = await readFile(TOKENS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function saveTokens(tokens: RedditTokens): Promise<void> {
  await writeFile(TOKENS_FILE, JSON.stringify(tokens, null, 2));
}

export async function deleteTokens(): Promise<void> {
  try {
    await unlink(TOKENS_FILE);
  } catch {
    // File doesn't exist, that's fine
  }
}

// Upload image to Reddit's media asset endpoint
async function uploadImage(
  accessToken: string,
  imageBuffer: Buffer,
  filename: string
): Promise<{ mediaId: string; websocketUrl: string }> {
  // Step 1: Request upload lease
  const leaseRes = await fetch('https://oauth.reddit.com/api/media/asset.json', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': getUserAgent(),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      filepath: filename,
      mimetype: 'image/jpeg',
    }),
  });

  const leaseData = await leaseRes.json();
  if (!leaseData.args) {
    throw new Error(`Failed to get upload lease: ${JSON.stringify(leaseData)}`);
  }

  const { action, fields } = leaseData.args;
  const uploadUrl = `https:${action}`;

  // Step 2: Upload to S3
  const formData = new FormData();
  for (const field of fields) {
    formData.append(field.name, field.value);
  }
  formData.append('file', new Blob([new Uint8Array(imageBuffer)], { type: 'image/jpeg' }), filename);

  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });

  if (!uploadRes.ok && uploadRes.status !== 201) {
    throw new Error(`S3 upload failed: ${uploadRes.status}`);
  }

  return {
    mediaId: leaseData.asset.asset_id,
    websocketUrl: leaseData.asset.websocket_url,
  };
}

// Publish a gallery post to Reddit
export async function publishGallery(
  accessToken: string,
  imageBuffers: Buffer[],
  title: string,
  subreddit: string
): Promise<{ url: string }> {
  // Upload all images
  const galleryItems: { media_id: string; caption: string }[] = [];

  for (let i = 0; i < imageBuffers.length; i++) {
    const { mediaId } = await uploadImage(
      accessToken,
      imageBuffers[i],
      `slide-${i}.jpg`
    );
    galleryItems.push({ media_id: mediaId, caption: '' });
  }

  // Submit gallery post
  const submitRes = await fetch('https://oauth.reddit.com/api/submit', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': getUserAgent(),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      sr: subreddit,
      kind: 'gallery',
      title,
      api_type: 'json',
      items: JSON.stringify(galleryItems),
    }),
  });

  const submitData = await submitRes.json();

  if (submitData.json?.errors?.length > 0) {
    throw new Error(`Reddit submit error: ${submitData.json.errors.map((e: string[]) => e.join(': ')).join(', ')}`);
  }

  const postUrl = submitData.json?.data?.url || '';
  return { url: postUrl };
}
