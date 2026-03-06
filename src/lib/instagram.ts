import { readFile, writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { InstagramTokens } from '@/types';

const TOKENS_FILE = join(process.cwd(), '.instagram-tokens.json');
const STATE_FILE = join(process.cwd(), '.instagram-state.json');

function getAppId() { return process.env.INSTAGRAM_APP_ID || ''; }
function getAppSecret() { return process.env.INSTAGRAM_APP_SECRET || ''; }
function getRedirectUri() { return process.env.INSTAGRAM_REDIRECT_URI || 'http://localhost:3000/auth/instagram/callback'; }

export async function getAuthUrl(): Promise<string> {
  const state = Math.random().toString(36).substring(2);
  await writeFile(STATE_FILE, JSON.stringify({ state }));

  const params = new URLSearchParams({
    client_id: getAppId(),
    redirect_uri: getRedirectUri(),
    scope: 'instagram_basic,instagram_content_publish,pages_show_list',
    response_type: 'code',
    state,
  });
  return `https://www.facebook.com/v21.0/dialog/oauth?${params}`;
}

export async function exchangeCode(code: string): Promise<InstagramTokens> {
  // Step 1: Exchange code for short-lived token
  const tokenUrl = new URL('https://graph.facebook.com/v21.0/oauth/access_token');
  tokenUrl.searchParams.set('client_id', getAppId());
  tokenUrl.searchParams.set('redirect_uri', getRedirectUri());
  tokenUrl.searchParams.set('client_secret', getAppSecret());
  tokenUrl.searchParams.set('code', code);

  const shortRes = await fetch(tokenUrl.toString());
  const shortData = await shortRes.json();
  if (shortData.error) {
    throw new Error(`Facebook auth error: ${shortData.error.message || shortData.error}`);
  }

  const shortToken = shortData.access_token;

  // Step 2: Exchange for long-lived token (60 days)
  const longUrl = new URL('https://graph.facebook.com/v21.0/oauth/access_token');
  longUrl.searchParams.set('grant_type', 'fb_exchange_token');
  longUrl.searchParams.set('client_id', getAppId());
  longUrl.searchParams.set('client_secret', getAppSecret());
  longUrl.searchParams.set('fb_exchange_token', shortToken);

  const longRes = await fetch(longUrl.toString());
  const longData = await longRes.json();
  if (longData.error) {
    throw new Error(`Token exchange error: ${longData.error.message || longData.error}`);
  }

  const longToken = longData.access_token;
  const expiresIn = longData.expires_in || 5184000; // 60 days default

  // Step 3: Find Facebook Page
  const pagesRes = await fetch(
    `https://graph.facebook.com/v21.0/me/accounts?access_token=${longToken}`
  );
  const pagesData = await pagesRes.json();
  if (!pagesData.data?.length) {
    throw new Error('No Facebook Pages found. Instagram Business accounts require a linked Facebook Page.');
  }

  const page = pagesData.data[0];
  const pageId = page.id;
  const pageToken = page.access_token;

  // Step 4: Find linked Instagram Business account
  const igRes = await fetch(
    `https://graph.facebook.com/v21.0/${pageId}?fields=instagram_business_account&access_token=${pageToken}`
  );
  const igData = await igRes.json();
  if (!igData.instagram_business_account?.id) {
    throw new Error('No Instagram Business account linked to this Facebook Page.');
  }

  const igUserId = igData.instagram_business_account.id;

  // Step 5: Fetch Instagram username
  const profileRes = await fetch(
    `https://graph.facebook.com/v21.0/${igUserId}?fields=username&access_token=${pageToken}`
  );
  const profileData = await profileRes.json();

  const tokens: InstagramTokens = {
    access_token: pageToken,
    user_id: igUserId,
    expires_at: Date.now() + expiresIn * 1000,
    username: profileData.username || 'unknown',
    page_id: pageId,
  };

  await saveTokens(tokens);

  // Clean up state file
  try { await unlink(STATE_FILE); } catch {}

  return tokens;
}

export async function refreshTokens(): Promise<InstagramTokens> {
  const current = await getTokens();
  if (!current) throw new Error('No tokens to refresh');

  const url = new URL('https://graph.facebook.com/v21.0/oauth/access_token');
  url.searchParams.set('grant_type', 'fb_exchange_token');
  url.searchParams.set('client_id', getAppId());
  url.searchParams.set('client_secret', getAppSecret());
  url.searchParams.set('fb_exchange_token', current.access_token);

  const res = await fetch(url.toString());
  const data = await res.json();
  if (data.error) {
    throw new Error(`Token refresh error: ${data.error.message || data.error}`);
  }

  const tokens: InstagramTokens = {
    ...current,
    access_token: data.access_token,
    expires_at: Date.now() + (data.expires_in || 5184000) * 1000,
  };

  await saveTokens(tokens);
  return tokens;
}

export async function getValidTokens(): Promise<InstagramTokens | null> {
  const tokens = await getTokens();
  if (!tokens) return null;

  // Refresh 7 days before expiry
  if (tokens.expires_at < Date.now() + 7 * 24 * 60 * 60 * 1000) {
    try {
      return await refreshTokens();
    } catch {
      return null;
    }
  }

  return tokens;
}

export async function getTokens(): Promise<InstagramTokens | null> {
  try {
    const content = await readFile(TOKENS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function saveTokens(tokens: InstagramTokens): Promise<void> {
  await writeFile(TOKENS_FILE, JSON.stringify(tokens, null, 2));
}

export async function deleteTokens(): Promise<void> {
  try {
    await unlink(TOKENS_FILE);
  } catch {
    // File doesn't exist, that's fine
  }
}

// Poll a media container until it's finished or fails
async function pollContainerStatus(
  containerId: string,
  accessToken: string,
  maxAttempts = 30,
  intervalMs = 2000
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${containerId}?fields=status_code&access_token=${accessToken}`
    );
    const data = await res.json();

    if (data.status_code === 'FINISHED') return;
    if (data.status_code === 'ERROR') {
      throw new Error(`Instagram container ${containerId} failed processing`);
    }

    await new Promise(r => setTimeout(r, intervalMs));
  }

  throw new Error(`Instagram container ${containerId} timed out after ${maxAttempts} attempts`);
}

export async function publishCarousel(
  accessToken: string,
  igUserId: string,
  imageUrls: string[],
  caption: string
): Promise<{ id: string }> {
  // Step 1: Create child containers for each image
  const childIds: string[] = [];
  for (const imageUrl of imageUrls) {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${igUserId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageUrl,
          is_carousel_item: true,
          access_token: accessToken,
        }),
      }
    );
    const data = await res.json();
    if (data.error) {
      throw new Error(`Failed to create child container: ${data.error.message}`);
    }
    childIds.push(data.id);
  }

  // Step 2: Poll each child until FINISHED
  for (const childId of childIds) {
    await pollContainerStatus(childId, accessToken);
  }

  // Step 3: Create parent carousel container
  const carouselRes = await fetch(
    `https://graph.facebook.com/v21.0/${igUserId}/media`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'CAROUSEL',
        children: childIds.join(','),
        caption,
        access_token: accessToken,
      }),
    }
  );
  const carouselData = await carouselRes.json();
  if (carouselData.error) {
    throw new Error(`Failed to create carousel container: ${carouselData.error.message}`);
  }

  const carouselId = carouselData.id;

  // Step 4: Poll parent container
  await pollContainerStatus(carouselId, accessToken);

  // Step 5: Publish
  const publishRes = await fetch(
    `https://graph.facebook.com/v21.0/${igUserId}/media_publish`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: carouselId,
        access_token: accessToken,
      }),
    }
  );
  const publishData = await publishRes.json();
  if (publishData.error) {
    throw new Error(`Failed to publish carousel: ${publishData.error.message}`);
  }

  return { id: publishData.id };
}
