import {
  GoogleGenAI,
  GenerateVideosOperation,
  type GenerateContentResponse,
  type Video,
} from '@google/genai';
import { randomUUID } from 'crypto';
import { constants as fsConstants } from 'fs';
import { access, mkdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import {
  DEFAULT_STUDIO_VIDEO_DURATION_SECONDS,
  DEFAULT_STUDIO_IMAGE_CREATOR_ID,
  getStudioImageCreatorById,
  type StudioImageCreatorOption,
} from './studio-models';

const OPENROUTER_CHAT_COMPLETIONS_URL =
  process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
const VIDEO_MODEL = 'veo-3.1-fast-generate-preview';
const METADATA_MODEL = 'google/gemini-3.1-flash-lite-preview';

const TMP_ROOT = join(process.cwd(), 'tmp', 'studio');
const IMAGE_DIR = join(TMP_ROOT, 'images');
const VIDEO_DIR = join(TMP_ROOT, 'videos');
const JOB_DIR = join(TMP_ROOT, 'jobs');

const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.webp'] as const;
const IMAGE_MIME_BY_EXT: Record<(typeof IMAGE_EXTS)[number], string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

const UUID_LIKE_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

type StudioJobStatus = 'processing' | 'completed' | 'failed';
type StudioOperationPayload = Pick<GenerateVideosOperation, 'name' | 'metadata' | 'done' | 'error' | 'response'>;

export interface StudioVideoJob {
  jobId: string;
  status: StudioJobStatus;
  operationPayload: StudioOperationPayload | null;
  imageId: string;
  imagePath: string;
  motionPrompt: string;
  durationSeconds?: number;
  videoId?: string;
  videoPath?: string;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

interface GeneratedImageResult {
  imageBytes: Buffer;
  mimeType: string;
  promptUsed: string;
}

interface StudioMetadataResult {
  caption: string;
  hashtags: string[];
}

export interface StudioApiKeyHelp {
  provider: 'google-ai-studio' | 'openrouter';
  envVar: 'GEMINI_API_KEY' | 'OPENROUTER_API_KEY';
  setupUrl: string;
  label: string;
}

export function getApiKeyHelp(error: unknown): StudioApiKeyHelp | null {
  const message = typeof error === 'string'
    ? error
    : error instanceof Error
      ? error.message
      : '';

  if (!message) return null;

  if (message.includes('OPENROUTER_API_KEY')) {
    return {
      provider: 'openrouter',
      envVar: 'OPENROUTER_API_KEY',
      setupUrl: 'https://openrouter.ai/keys',
      label: 'Get an OpenRouter API key',
    };
  }

  if (message.includes('GEMINI_API_KEY') || message.includes('GOOGLE_API_KEY')) {
    return {
      provider: 'google-ai-studio',
      envVar: 'GEMINI_API_KEY',
      setupUrl: 'https://aistudio.google.com/app/apikey',
      label: 'Get a Google AI Studio API key',
    };
  }

  return null;
}

function getGeminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  if (!key) {
    throw new Error('Missing GEMINI_API_KEY in environment. Add GEMINI_API_KEY to .env.local.');
  }
  return key;
}

function getOpenRouterApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY || '';
  if (!key) {
    throw new Error('Missing OPENROUTER_API_KEY in environment. Add OPENROUTER_API_KEY to .env.local.');
  }
  return key;
}

function getAiClient(): GoogleGenAI {
  return new GoogleGenAI({ apiKey: getGeminiApiKey() });
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path, fsConstants.R_OK);
    return true;
  } catch {
    return false;
  }
}

function extractTextFromResponse(response: GenerateContentResponse): string {
  if (response.text && response.text.trim()) {
    return response.text.trim();
  }

  const parts = response.candidates?.[0]?.content?.parts || [];
  const texts = parts
    .map((part) => {
      const text = (part as { text?: string }).text;
      return typeof text === 'string' ? text : '';
    })
    .filter(Boolean);

  return texts.join('\n').trim();
}

function parseJsonObject(text: string): Record<string, unknown> | null {
  if (!text) return null;

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    // continue
  }

  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1].trim()) as Record<string, unknown>;
    } catch {
      // continue
    }
  }

  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (objectMatch?.[0]) {
    try {
      return JSON.parse(objectMatch[0]) as Record<string, unknown>;
    } catch {
      // continue
    }
  }

  return null;
}

function normalizePrompt(prompt: unknown): string {
  if (typeof prompt !== 'string') return '';
  return prompt.trim();
}

function normalizeHashtag(tag: string): string {
  const cleaned = tag
    .toLowerCase()
    .replace(/[^a-z0-9#]/g, '')
    .replace(/^#+/, '');

  return cleaned ? `#${cleaned}` : '';
}

function keywordHashtags(text: string): string[] {
  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'this', 'that', 'from', 'into', 'your', 'just', 'make', 'made',
    'video', 'shot', 'scene', 'show', 'over', 'under', 'onto', 'about', 'have',
    'will', 'when', 'then', 'than', 'slow', 'fast', 'very', 'more', 'most', 'some', 'there',
    'their', 'they', 'them', 'our', 'out', 'are', 'was', 'were', 'you', 'yours', 'his', 'her',
  ]);

  const words = (text.toLowerCase().match(/[a-z0-9]+/g) || [])
    .filter((w) => w.length >= 4 && w.length <= 20)
    .filter((w) => !stopWords.has(w));

  const unique = Array.from(new Set(words));
  return unique.slice(0, 6).map((w) => `#${w}`);
}

function fallbackMetadata(imagePrompt: string, motionPrompt: string, trendingTags: string[]): StudioMetadataResult {
  const baseTags = [
    '#tiktok',
    '#fyp',
    '#viral',
    '#contentcreator',
    '#video',
    '#creator',
    '#trend',
  ];

  const promptTags = keywordHashtags(`${imagePrompt} ${motionPrompt}`);
  const hashtags = Array.from(
    new Set([...promptTags, ...trendingTags, ...baseTags].map(normalizeHashtag).filter(Boolean))
  ).slice(0, 10);

  while (hashtags.length < 6) {
    const extra = baseTags[hashtags.length % baseTags.length];
    if (!hashtags.includes(extra)) hashtags.push(extra);
    else break;
  }

  const hook = imagePrompt.split(/[.!?]/)[0]?.trim() || 'You need to try this next';
  const caption = `${hook}\n\n${motionPrompt}\n\nSave this for later.`.slice(0, 350);

  return { caption, hashtags };
}

function inferImageExtension(mimeType: string): (typeof IMAGE_EXTS)[number] {
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') return '.jpg';
  if (mimeType === 'image/webp') return '.webp';
  return '.png';
}

function normalizeImageMimeType(mimeType: string): string {
  const normalized = mimeType.toLowerCase().split(';')[0].trim();
  if (normalized === 'image/jpg') return 'image/jpeg';
  return normalized;
}

function toDataUrl(image: { imageBytes: Buffer; mimeType: string }): string {
  return `data:${normalizeImageMimeType(image.mimeType)};base64,${image.imageBytes.toString('base64')}`;
}

function extractDataUrl(text: string): string | null {
  const match = text.match(/data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=\s]+/);
  return match?.[0] || null;
}

function readImageUrlFromObject(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null;

  const objectValue = value as Record<string, unknown>;
  if (typeof objectValue.url === 'string' && objectValue.url.trim()) {
    return objectValue.url.trim();
  }

  const imageUrlObject = objectValue.image_url;
  if (imageUrlObject && typeof imageUrlObject === 'object') {
    const url = (imageUrlObject as Record<string, unknown>).url;
    if (typeof url === 'string' && url.trim()) return url.trim();
  }

  const camelImageUrlObject = objectValue.imageUrl;
  if (camelImageUrlObject && typeof camelImageUrlObject === 'object') {
    const url = (camelImageUrlObject as Record<string, unknown>).url;
    if (typeof url === 'string' && url.trim()) return url.trim();
  }

  return null;
}

function extractImageUrlFromContent(content: unknown): string | null {
  if (typeof content === 'string') {
    return extractDataUrl(content);
  }

  if (!Array.isArray(content)) return null;

  for (const part of content) {
    if (typeof part === 'string') {
      const dataUrl = extractDataUrl(part);
      if (dataUrl) return dataUrl;
      continue;
    }

    const directUrl = readImageUrlFromObject(part);
    if (directUrl) return directUrl;

    if (!part || typeof part !== 'object') continue;
    const objectPart = part as Record<string, unknown>;

    if (typeof objectPart.b64_json === 'string' && objectPart.b64_json.trim()) {
      return `data:image/png;base64,${objectPart.b64_json.trim()}`;
    }

    const inlineData = objectPart.inline_data ?? objectPart.inlineData;
    if (inlineData && typeof inlineData === 'object') {
      const data = (inlineData as Record<string, unknown>).data;
      const mimeType = (inlineData as Record<string, unknown>).mimeType
        ?? (inlineData as Record<string, unknown>).mime_type;
      if (typeof data === 'string' && data.trim()) {
        const normalizedMimeType = typeof mimeType === 'string' && mimeType.trim()
          ? normalizeImageMimeType(mimeType)
          : 'image/png';
        return `data:${normalizedMimeType};base64,${data.trim()}`;
      }
    }
  }

  return null;
}

function extractImageUrlFromOpenRouterResponse(responseJson: unknown): string | null {
  if (!responseJson || typeof responseJson !== 'object') return null;
  const root = responseJson as Record<string, unknown>;
  const choices = Array.isArray(root.choices) ? root.choices : [];

  for (const choice of choices) {
    if (!choice || typeof choice !== 'object') continue;
    const choiceObject = choice as Record<string, unknown>;

    const choiceImages = choiceObject.images;
    if (Array.isArray(choiceImages)) {
      for (const imageEntry of choiceImages) {
        const url = readImageUrlFromObject(imageEntry);
        if (url) return url;
      }
    }

    const message = choiceObject.message;
    if (!message || typeof message !== 'object') continue;
    const messageObject = message as Record<string, unknown>;

    const messageImages = messageObject.images;
    if (Array.isArray(messageImages)) {
      for (const imageEntry of messageImages) {
        const url = readImageUrlFromObject(imageEntry);
        if (url) return url;
      }
    }

    const fromContent = extractImageUrlFromContent(messageObject.content);
    if (fromContent) return fromContent;
  }

  return null;
}

function decodeDataUrlImage(dataUrl: string): { imageBytes: Buffer; mimeType: string } | null {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/i);
  if (!match?.[1] || !match[2]) return null;

  const mimeType = normalizeImageMimeType(match[1]);
  const base64Data = match[2].replace(/\s+/g, '');

  return {
    imageBytes: Buffer.from(base64Data, 'base64'),
    mimeType,
  };
}

function openRouterErrorMessage(responseJson: unknown, statusText: string): string {
  if (!responseJson || typeof responseJson !== 'object') return statusText || 'Request failed';
  const root = responseJson as Record<string, unknown>;
  const error = root.error;

  if (typeof error === 'string' && error.trim()) {
    return error.trim();
  }

  if (error && typeof error === 'object') {
    const message = (error as Record<string, unknown>).message;
    if (typeof message === 'string' && message.trim()) {
      return message.trim();
    }
  }

  const message = root.message;
  if (typeof message === 'string' && message.trim()) {
    return message.trim();
  }

  return statusText || 'Request failed';
}

async function parseGeneratedImage(imageUrl: string): Promise<{ imageBytes: Buffer; mimeType: string }> {
  const decodedDataUrl = decodeDataUrlImage(imageUrl);
  if (decodedDataUrl) {
    return decodedDataUrl;
  }

  if (!/^https?:\/\//i.test(imageUrl)) {
    throw new Error('The selected image model returned an unsupported image format.');
  }

  const response = await fetch(imageUrl, { method: 'GET' });
  if (!response.ok) {
    throw new Error(`Failed to download generated image (${response.status}).`);
  }

  const imageBytes = Buffer.from(await response.arrayBuffer());
  const contentTypeHeader = response.headers.get('content-type') || 'image/png';
  const mimeType = normalizeImageMimeType(contentTypeHeader);

  return {
    imageBytes,
    mimeType: mimeType.startsWith('image/') ? mimeType : 'image/png',
  };
}

function operationErrorMessage(operation: GenerateVideosOperation): string {
  if (!operation.error) return 'Video generation failed without an explicit error message.';

  const maybeMessage = (operation.error as { message?: unknown }).message;
  if (typeof maybeMessage === 'string' && maybeMessage.trim()) return maybeMessage;

  try {
    return JSON.stringify(operation.error);
  } catch {
    return 'Video generation failed.';
  }
}

function toOperationPayload(operation: GenerateVideosOperation): StudioOperationPayload {
  return {
    name: operation.name,
    metadata: operation.metadata,
    done: operation.done,
    error: operation.error,
    response: operation.response,
  };
}

function toSdkOperation(operation: StudioOperationPayload): GenerateVideosOperation {
  const sdkOperation = new GenerateVideosOperation();
  sdkOperation.name = operation.name;
  sdkOperation.metadata = operation.metadata;
  sdkOperation.done = operation.done;
  sdkOperation.error = operation.error;
  sdkOperation.response = operation.response;
  return sdkOperation;
}

export function isValidStudioId(id: unknown): id is string {
  return typeof id === 'string' && UUID_LIKE_RE.test(id);
}

export function validatePromptLength(prompt: string): string | null {
  if (!prompt) return 'Prompt is required.';
  if (prompt.length < 8) return 'Prompt must be at least 8 characters.';
  if (prompt.length > 800) return 'Prompt must be at most 800 characters.';
  return null;
}

export async function ensureStudioDirs(): Promise<void> {
  await Promise.all([
    mkdir(IMAGE_DIR, { recursive: true }),
    mkdir(VIDEO_DIR, { recursive: true }),
    mkdir(JOB_DIR, { recursive: true }),
  ]);
}

async function generateStudioImageWithOpenRouter(
  model: string,
  prompt: string,
  referenceImage?: { imageBytes: Buffer; mimeType: string }
): Promise<GeneratedImageResult> {
  const requestBody: Record<string, unknown> = {
    model,
    modalities: ['image', 'text'],
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          ...(referenceImage
            ? [{ type: 'image_url', image_url: { url: toDataUrl(referenceImage) } }]
            : []),
        ],
      },
    ],
    image_config: {
      aspect_ratio: '9:16',
    },
  };

  const headers: Record<string, string> = {
    Authorization: `Bearer ${getOpenRouterApiKey()}`,
    'Content-Type': 'application/json',
  };

  if (process.env.OPENROUTER_HTTP_REFERER) {
    headers['HTTP-Referer'] = process.env.OPENROUTER_HTTP_REFERER;
  }
  if (process.env.OPENROUTER_APP_TITLE) {
    headers['X-Title'] = process.env.OPENROUTER_APP_TITLE;
  }

  const response = await fetch(OPENROUTER_CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  });

  const responseJson = (await response.json().catch(() => null)) as unknown;
  if (!response.ok) {
    throw new Error(`Image generation failed: ${openRouterErrorMessage(responseJson, response.statusText)}`);
  }

  const imageUrl = extractImageUrlFromOpenRouterResponse(responseJson);
  if (!imageUrl) {
    throw new Error('The selected image model did not return an image. Try a more concrete prompt.');
  }

  const generatedImage = await parseGeneratedImage(imageUrl);
  return {
    imageBytes: generatedImage.imageBytes,
    mimeType: generatedImage.mimeType,
    promptUsed: prompt,
  };
}

function resolveImageCreatorOrThrow(imageCreatorId?: string): StudioImageCreatorOption {
  const imageCreator =
    getStudioImageCreatorById(imageCreatorId) || getStudioImageCreatorById(DEFAULT_STUDIO_IMAGE_CREATOR_ID);

  if (!imageCreator || !imageCreator.enabled) {
    throw new Error('Invalid image creator selected.');
  }

  return imageCreator;
}

async function generateStudioImageInternal(
  promptInput: string,
  imageCreator: StudioImageCreatorOption,
  referenceImage?: { imageBytes: Buffer; mimeType: string }
): Promise<GeneratedImageResult> {
  const prompt = normalizePrompt(promptInput);
  return generateStudioImageWithOpenRouter(imageCreator.model, prompt, referenceImage);
}

export async function generateStudioImage(promptInput: string): Promise<GeneratedImageResult> {
  const imageCreator = resolveImageCreatorOrThrow();
  return generateStudioImageInternal(promptInput, imageCreator);
}

export async function generateStudioImageFromOptionalReference(
  promptInput: string,
  referenceImage?: { imageBytes: Buffer; mimeType: string },
  imageCreatorId?: string
): Promise<GeneratedImageResult> {
  const imageCreator = resolveImageCreatorOrThrow(imageCreatorId);
  return generateStudioImageInternal(promptInput, imageCreator, referenceImage);
}

export async function saveGeneratedImage(image: GeneratedImageResult): Promise<{ imageId: string; imagePath: string }> {
  await ensureStudioDirs();

  const imageId = randomUUID();
  const ext = inferImageExtension(image.mimeType);
  const imagePath = join(IMAGE_DIR, `${imageId}${ext}`);

  await writeFile(imagePath, image.imageBytes);

  return { imageId, imagePath };
}

export async function resolveImagePath(imageId: string): Promise<{ imagePath: string; mimeType: string } | null> {
  for (const ext of IMAGE_EXTS) {
    const path = join(IMAGE_DIR, `${imageId}${ext}`);
    if (await fileExists(path)) {
      return { imagePath: path, mimeType: IMAGE_MIME_BY_EXT[ext] };
    }
  }
  return null;
}

export async function resolveVideoPath(videoId: string): Promise<string | null> {
  const path = join(VIDEO_DIR, `${videoId}.mp4`);
  if (await fileExists(path)) {
    return path;
  }
  return null;
}

export async function startStudioVideoFromImage(args: {
  prompt: string;
  imageBytes: Buffer;
  mimeType: string;
  durationSeconds?: number;
}): Promise<GenerateVideosOperation> {
  const ai = getAiClient();

  return ai.models.generateVideos({
    model: VIDEO_MODEL,
    prompt: normalizePrompt(args.prompt),
    image: {
      imageBytes: args.imageBytes.toString('base64'),
      mimeType: args.mimeType,
    },
    config: {
      aspectRatio: '9:16',
      durationSeconds: args.durationSeconds ?? DEFAULT_STUDIO_VIDEO_DURATION_SECONDS,
    },
  });
}

export async function pollVideoOperation(operation: StudioOperationPayload): Promise<GenerateVideosOperation> {
  if (!operation?.name) {
    throw new Error('Missing operation name for video polling.');
  }

  const ai = getAiClient();
  return ai.operations.getVideosOperation({ operation: toSdkOperation(operation) });
}

export async function downloadVideoFile(video: Video, outputPath: string): Promise<void> {
  const ai = getAiClient();
  await ai.files.download({ file: video, downloadPath: outputPath });
}

function jobFilePath(jobId: string): string {
  return join(JOB_DIR, `${jobId}.json`);
}

export async function createVideoJob(args: {
  imageId: string;
  imagePath: string;
  motionPrompt: string;
  durationSeconds: number;
  operation: GenerateVideosOperation;
}): Promise<StudioVideoJob> {
  await ensureStudioDirs();

  const now = Date.now();
  const job: StudioVideoJob = {
    jobId: randomUUID(),
    status: 'processing',
    operationPayload: toOperationPayload(args.operation),
    imageId: args.imageId,
    imagePath: args.imagePath,
    motionPrompt: normalizePrompt(args.motionPrompt),
    durationSeconds: args.durationSeconds,
    createdAt: now,
    updatedAt: now,
  };

  await writeFile(jobFilePath(job.jobId), JSON.stringify(job, null, 2));
  return job;
}

export async function loadVideoJob(jobId: string): Promise<StudioVideoJob | null> {
  try {
    const content = await readFile(jobFilePath(jobId), 'utf-8');
    const parsed = JSON.parse(content) as StudioVideoJob;
    return parsed;
  } catch {
    return null;
  }
}

export async function saveVideoJob(job: StudioVideoJob): Promise<void> {
  job.updatedAt = Date.now();
  await writeFile(jobFilePath(job.jobId), JSON.stringify(job, null, 2));
}

export function newVideoPath(videoId: string): string {
  return join(VIDEO_DIR, `${videoId}.mp4`);
}

export async function finalizeVideoJob(job: StudioVideoJob, operation: GenerateVideosOperation): Promise<StudioVideoJob> {
  job.operationPayload = toOperationPayload(operation);

  if (!operation.done) {
    job.status = 'processing';
    await saveVideoJob(job);
    return job;
  }

  if (operation.error) {
    job.status = 'failed';
    job.error = operationErrorMessage(operation);
    await saveVideoJob(job);
    return job;
  }

  const generatedVideo = operation.response?.generatedVideos?.[0]?.video;
  if (!generatedVideo) {
    job.status = 'failed';
    job.error = 'Veo did not return a video output.';
    await saveVideoJob(job);
    return job;
  }

  const videoId = job.videoId || randomUUID();
  const videoPath = job.videoPath || newVideoPath(videoId);

  if (!(await fileExists(videoPath))) {
    await downloadVideoFile(generatedVideo, videoPath);
  }

  job.status = 'completed';
  job.videoId = videoId;
  job.videoPath = videoPath;
  job.error = undefined;

  await saveVideoJob(job);
  return job;
}

export async function generateTiktokMetadata(imagePromptInput: string, motionPromptInput: string): Promise<StudioMetadataResult> {
  const imagePrompt = normalizePrompt(imagePromptInput);
  const motionPrompt = normalizePrompt(motionPromptInput);

  const trendingTags: string[] = [];

  const fallback = fallbackMetadata(imagePrompt, motionPrompt, trendingTags);

  const ai = getAiClient();

  try {
    const response = await ai.models.generateContent({
      model: METADATA_MODEL,
      contents: [
        'You write TikTok post copy.',
        `Image prompt: ${imagePrompt}`,
        `Motion prompt: ${motionPrompt}`,
        'Return strict JSON only with this exact shape:',
        '{"caption":"string","hashtags":["#tag1"]}',
        'Rules: caption under 220 characters, one short hook, and 6 to 10 relevant hashtags, each starting with #.',
      ].join('\n'),
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = extractTextFromResponse(response);
    const parsed = parseJsonObject(rawText);

    const caption = typeof parsed?.caption === 'string' ? parsed.caption.trim() : '';
    const parsedHashtags = Array.isArray(parsed?.hashtags)
      ? parsed.hashtags
        .filter((tag): tag is string => typeof tag === 'string')
        .map(normalizeHashtag)
        .filter(Boolean)
      : [];

    if (!caption) return fallback;

    const hashtags = Array.from(new Set([...parsedHashtags, ...fallback.hashtags])).slice(0, 10);
    while (hashtags.length < 6 && fallback.hashtags.length > hashtags.length) {
      const candidate = fallback.hashtags[hashtags.length];
      if (candidate && !hashtags.includes(candidate)) hashtags.push(candidate);
    }

    return {
      caption: caption.slice(0, 350),
      hashtags,
    };
  } catch {
    return fallback;
  }
}
