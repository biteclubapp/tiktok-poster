import { randomUUID } from 'crypto';
import { mkdir, readFile, readdir, stat, unlink, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  buildCloudflareImageProxyUrl,
  extractCloudflareImageId,
  isCloudflareImagesConfigured,
  signImageUrl,
  uploadImageToCloudflare,
  uploadImageToCloudflareAsset,
} from './cloudflare-images';

const PRIMARY_LOCAL_TMP_DIR = join(tmpdir(), 'biteclub', 'carousel');
const LEGACY_LOCAL_TMP_DIR = join(process.cwd(), 'tmp', 'carousel');
const LOCAL_TMP_DIRS = [PRIMARY_LOCAL_TMP_DIR, LEGACY_LOCAL_TMP_DIR];
const MAX_FILENAME_PREFIX_LENGTH = 80;

export type PersistedGeneratedSlide = {
  filename: string;
  previewUrl: string;
  publicUrl: string | null;
  imageId: string | null;
};

export type PersistedGeneratedSlides = {
  batchId: string;
  slides: PersistedGeneratedSlide[];
};

function slugifyFilenameSegment(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function buildDescriptiveSlidePrefix(...parts: Array<string | null | undefined>): string {
  const prefix = parts
    .map((part) => (part ? slugifyFilenameSegment(part) : ''))
    .filter(Boolean)
    .join('-')
    .slice(0, MAX_FILENAME_PREFIX_LENGTH)
    .replace(/^-+|-+$/g, '');

  return prefix || 'carousel';
}

function parseUrl(value: string): URL | null {
  try {
    return new URL(value, 'http://local');
  } catch {
    return null;
  }
}

async function ensurePrimaryLocalTmpDir() {
  await mkdir(PRIMARY_LOCAL_TMP_DIR, { recursive: true });
}

async function cleanupOldLocalFilesInDir(dir: string) {
  try {
    const files = await readdir(dir);
    const cutoff = Date.now() - 2 * 60 * 60 * 1000;

    await Promise.all(
      files.map(async (file) => {
        if (!file.endsWith('.jpg')) return;

        try {
          const filePath = join(dir, file);
          const fileStat = await stat(filePath);
          if (fileStat.mtimeMs < cutoff) {
            await unlink(filePath);
          }
        } catch {
          // File already removed or unreadable.
        }
      })
    );
  } catch {
    // Directory may not exist yet.
  }
}

async function cleanupOldLocalFiles() {
  await Promise.all(LOCAL_TMP_DIRS.map((dir) => cleanupOldLocalFilesInDir(dir)));
}

async function readLocalSlideBuffer(filename: string): Promise<Buffer> {
  for (const dir of LOCAL_TMP_DIRS) {
    try {
      return await readFile(join(dir, filename));
    } catch {
      // Try next location.
    }
  }

  throw new Error(`Slide not found: ${filename}`);
}

async function downloadBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download slide (${response.status}).`);
  }

  return Buffer.from(await response.arrayBuffer());
}

export function extractLegacyCarouselFilename(slideUrl: string): string | null {
  const parsed = parseUrl(slideUrl);
  if (!parsed) return null;

  if (!/^\/api\/images\/[^/]+$/.test(parsed.pathname)) {
    return null;
  }

  const filename = parsed.pathname.split('/').pop() || '';
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '');
  if (!sanitized.endsWith('.jpg')) {
    return null;
  }

  return sanitized;
}

export function resolveSlideToPublicUrl(slideUrl: string): string | null {
  const imageId = extractCloudflareImageId(slideUrl);
  if (imageId) {
    return signImageUrl(imageId);
  }

  const legacyFilename = extractLegacyCarouselFilename(slideUrl);
  if (legacyFilename) {
    return null;
  }

  if (/^https?:\/\//i.test(slideUrl)) {
    return slideUrl;
  }

  return null;
}

export async function ensureSlidePublicUrl(slideUrl: string): Promise<string> {
  const existingPublicUrl = resolveSlideToPublicUrl(slideUrl);
  if (existingPublicUrl) {
    return existingPublicUrl;
  }

  const buffer = await readSlideBuffer(slideUrl);
  const filename = extractLegacyCarouselFilename(slideUrl) || `${randomUUID()}.jpg`;
  return uploadImageToCloudflare(buffer, filename);
}

export async function readSlideBuffer(slideUrl: string): Promise<Buffer> {
  const imageId = extractCloudflareImageId(slideUrl);
  if (imageId) {
    return downloadBuffer(signImageUrl(imageId));
  }

  const legacyFilename = extractLegacyCarouselFilename(slideUrl);
  if (legacyFilename) {
    return readLocalSlideBuffer(legacyFilename);
  }

  if (/^https?:\/\//i.test(slideUrl)) {
    return downloadBuffer(slideUrl);
  }

  throw new Error(`Unsupported slide URL: ${slideUrl}`);
}

export async function loadCloudflareSlide(imageId: string): Promise<{ buffer: Buffer; contentType: string }> {
  const response = await fetch(signImageUrl(imageId));
  if (!response.ok) {
    throw new Error(`Failed to load Cloudflare image (${response.status}).`);
  }

  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get('content-type') || 'image/jpeg',
  };
}

export async function persistGeneratedSlides(
  jpegBuffers: Buffer[],
  batchId = randomUUID(),
  filenamePrefix = 'carousel'
): Promise<PersistedGeneratedSlides> {
  const safePrefix = buildDescriptiveSlidePrefix(filenamePrefix);
  const shortBatchId = batchId.split('-')[0] || batchId;

  if (isCloudflareImagesConfigured()) {
    const slides = await Promise.all(
      jpegBuffers.map(async (buffer, index) => {
        const filename = `${safePrefix}-slide-${index + 1}-${shortBatchId}.jpg`;
        const asset = await uploadImageToCloudflareAsset(buffer, filename);

        return {
          filename,
          previewUrl: buildCloudflareImageProxyUrl(asset.id),
          publicUrl: asset.url,
          imageId: asset.id,
        };
      })
    );

    return { batchId, slides };
  }

  await ensurePrimaryLocalTmpDir();
  void cleanupOldLocalFiles();

  const slides: PersistedGeneratedSlide[] = [];
  for (let index = 0; index < jpegBuffers.length; index++) {
    const filename = `${safePrefix}-slide-${index + 1}-${shortBatchId}.jpg`;
    await writeFile(join(PRIMARY_LOCAL_TMP_DIR, filename), jpegBuffers[index]);
    slides.push({
      filename,
      previewUrl: `/api/images/${filename}`,
      publicUrl: null,
      imageId: null,
    });
  }

  return { batchId, slides };
}
