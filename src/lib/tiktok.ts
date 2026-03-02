import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { TikTokTokens } from '@/types';

const TOKENS_FILE = join(process.cwd(), '.tiktok-tokens.json');

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY || '';
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI || 'http://localhost:3000/auth/callback';

export function getAuthUrl(): string {
  const csrfState = Math.random().toString(36).substring(2);
  const params = new URLSearchParams({
    client_key: CLIENT_KEY,
    scope: 'user.info.basic,video.publish',
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    state: csrfState,
  });
  return `https://www.tiktok.com/v2/auth/authorize/?${params}`;
}

export async function exchangeCode(code: string): Promise<TikTokTokens> {
  const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: CLIENT_KEY,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
    }),
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(`TikTok auth error: ${data.error_description || data.error}`);
  }

  const tokens: TikTokTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
    open_id: data.open_id,
  };

  await saveTokens(tokens);
  return tokens;
}

export async function refreshTokens(): Promise<TikTokTokens> {
  const current = await getTokens();
  if (!current) throw new Error('No tokens to refresh');

  const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: CLIENT_KEY,
      client_secret: CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: current.refresh_token,
    }),
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(`TikTok refresh error: ${data.error_description || data.error}`);
  }

  const tokens: TikTokTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
    open_id: data.open_id,
  };

  await saveTokens(tokens);
  return tokens;
}

export async function getValidTokens(): Promise<TikTokTokens | null> {
  const tokens = await getTokens();
  if (!tokens) return null;

  // Refresh if expiring within 5 minutes
  if (tokens.expires_at < Date.now() + 5 * 60 * 1000) {
    try {
      return await refreshTokens();
    } catch {
      return null;
    }
  }

  return tokens;
}

export async function getTokens(): Promise<TikTokTokens | null> {
  try {
    const content = await readFile(TOKENS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function saveTokens(tokens: TikTokTokens): Promise<void> {
  await writeFile(TOKENS_FILE, JSON.stringify(tokens, null, 2));
}

export async function deleteTokens(): Promise<void> {
  try {
    const { unlink } = await import('fs/promises');
    await unlink(TOKENS_FILE);
  } catch {
    // File doesn't exist, that's fine
  }
}

// TikTok Content Posting API — Photo carousel
export async function publishCarousel(
  accessToken: string,
  imageUrls: string[],
  caption: string
): Promise<{ publish_id: string }> {
  // Step 1: Initialize photo publish
  const initResponse = await fetch(
    'https://open.tiktokapis.com/v2/post/publish/content/init/',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
        post_info: {
          title: caption.slice(0, 150),
          description: caption,
          disable_comment: false,
          privacy_level: 'SELF_ONLY', // Start as private, change after app audit
          auto_add_music: true,
        },
        source_info: {
          source: 'PULL_FROM_URL',
          photo_cover_index: 0,
          photo_images: imageUrls,
        },
        post_mode: 'DIRECT_POST',
        media_type: 'PHOTO',
      }),
    }
  );

  const initData = await initResponse.json();

  if (initData.error?.code !== 'ok' && initData.error?.code) {
    throw new Error(
      `TikTok publish error: ${initData.error.message || initData.error.code}`
    );
  }

  return { publish_id: initData.data?.publish_id || 'unknown' };
}
