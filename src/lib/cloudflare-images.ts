import crypto from 'crypto';

const ACCOUNT_HASH = process.env.CLOUDFLARE_ACCOUNT_HASH || '';
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '';
const CF_API_TOKEN = process.env.CF_API_TOKEN || '';
const IMAGES_SIGNING_KEY = process.env.CLOUDFLARE_IMAGES_SIGNING_KEY || '';

// Generate a signed Cloudflare Images delivery URL
// See: https://developers.cloudflare.com/images/manage-images/serve-images/serve-private-images/
function signImageUrl(imageId: string, variant = 'public', expiry?: number): string {
  const url = `https://imagedelivery.net/${ACCOUNT_HASH}/${imageId}/${variant}`;

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

export async function uploadImageToCloudflare(imageBuffer: Buffer, filename: string): Promise<string> {
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

  const data = await response.json();
  return signImageUrl(data.result.id);
}
