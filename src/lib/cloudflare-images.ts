import crypto from 'crypto';

const ACCOUNT_HASH = process.env.CLOUDFLARE_ACCOUNT_HASH || '';
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '';
const CF_API_TOKEN = process.env.CF_API_TOKEN || '';
const IMAGES_SIGNING_KEY = process.env.CLOUDFLARE_IMAGES_SIGNING_KEY || '';
const CLOUDFLARE_PROXY_PREFIX = '/api/images/cloudflare';
const CLOUDFLARE_IMAGE_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

function getDeliveryUrl(imageId: string, variant = 'public'): string {
  return `https://imagedelivery.net/${ACCOUNT_HASH}/${imageId}/${variant}`;
}

function parseUrl(value: string): URL | null {
  try {
    return new URL(value, 'http://local');
  } catch {
    return null;
  }
}

export function isCloudflareImagesConfigured(): boolean {
  return Boolean(ACCOUNT_HASH && ACCOUNT_ID && CF_API_TOKEN);
}

export function isValidCloudflareImageId(imageId: string): boolean {
  return CLOUDFLARE_IMAGE_ID_PATTERN.test(imageId);
}

export function buildCloudflareImageProxyUrl(imageId: string): string {
  return `${CLOUDFLARE_PROXY_PREFIX}/${imageId}`;
}

export function extractCloudflareImageId(value: string): string | null {
  if (isValidCloudflareImageId(value)) {
    return value;
  }

  const parsed = parseUrl(value);
  if (!parsed) return null;

  const proxyMatch = parsed.pathname.match(/^\/api\/images\/cloudflare\/([A-Za-z0-9_-]+)$/);
  if (proxyMatch) {
    return proxyMatch[1];
  }

  if (parsed.hostname === 'imagedelivery.net') {
    const segments = parsed.pathname.split('/').filter(Boolean);
    if (segments.length >= 2 && isValidCloudflareImageId(segments[1])) {
      return segments[1];
    }
  }

  return null;
}

// Generate a signed Cloudflare Images delivery URL
// See: https://developers.cloudflare.com/images/manage-images/serve-images/serve-private-images/
export function signImageUrl(imageId: string, variant = 'public', expiry?: number): string {
  const url = getDeliveryUrl(imageId, variant);

  if (!IMAGES_SIGNING_KEY) {
    // Fallback: return unsigned URL (will 403 if requireSignedURLs is true)
    return url;
  }

  // Default expiry: 1 hour from now
  const exp = expiry || Math.floor(Date.now() / 1000) + 3600;
  const urlWithExpiry = `${url}?exp=${exp}`;

  // HMAC-SHA256 sign — path must include account hash
  const pathToSign = `/${ACCOUNT_HASH}/${imageId}/${variant}?exp=${exp}`;
  const mac = crypto
    .createHmac('sha256', IMAGES_SIGNING_KEY)
    .update(pathToSign)
    .digest('hex');

  return `${urlWithExpiry}&sig=${mac}`;
}

// Sign multiple image IDs
export async function signImageUrls(imageIds: string[]): Promise<Record<string, string>> {
  if (imageIds.length === 0) return {};

  return Object.fromEntries(
    imageIds.map((id) => [id, signImageUrl(id)])
  );
}

export async function uploadImageToCloudflareAsset(
  imageBuffer: Buffer,
  filename: string
): Promise<{ id: string; url: string }> {
  const formData = new FormData();
  formData.append('file', new Blob([new Uint8Array(imageBuffer)], { type: 'image/jpeg' }), filename);

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/images/v1`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`Cloudflare upload failed: ${response.status}`);
  }

  const data = await response.json() as { result?: { id?: string } };
  const imageId = data.result?.id;
  if (!imageId) {
    throw new Error('Cloudflare upload succeeded but no image id was returned.');
  }

  return {
    id: imageId,
    url: signImageUrl(imageId),
  };
}

export async function uploadImageToCloudflare(imageBuffer: Buffer, filename: string): Promise<string> {
  const asset = await uploadImageToCloudflareAsset(imageBuffer, filename);
  return asset.url;
}
