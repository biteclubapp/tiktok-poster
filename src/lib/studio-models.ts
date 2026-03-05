export interface StudioImageCreatorOption {
  id: string;
  label: string;
  description: string;
  costLabel: string;
  model: string;
  enabled: boolean;
}

export interface StudioVideoCreatorOption {
  id: string;
  label: string;
  description: string;
  costLabel?: string;
  model: string;
  enabled: boolean;
}

export const MIN_STUDIO_VIDEO_DURATION_SECONDS = 1;
export const MAX_STUDIO_VIDEO_DURATION_SECONDS = 30;
export const DEFAULT_STUDIO_VIDEO_DURATION_SECONDS = 8;

export const STUDIO_IMAGE_CREATORS: readonly StudioImageCreatorOption[] = [
  {
    id: 'gemini-3-1-flash-image',
    label: 'Nano Banana (3.1 Flash Image)',
    description: 'Fast, strong image generation.',
    costLabel: 'Est. $0.01-$0.05 per image',
    model: 'google/gemini-3.1-flash-image-preview',
    enabled: true,
  },
  {
    id: 'gpt-5-image-mini',
    label: 'GPT-5 Image Mini',
    description: 'Fast image generation alternative.',
    costLabel: 'Est. $0.02-$0.08 per image',
    model: 'openai/gpt-5-image-mini',
    enabled: true,
  },
] as const;

export const STUDIO_VIDEO_CREATORS: readonly StudioVideoCreatorOption[] = [
  {
    id: 'veo-3.1-fast',
    label: 'Veo 3.1 Fast',
    description: 'Vertical video generation with configurable duration.',
    costLabel: 'Est. $1.20 per 8-second video (varies by length)',
    model: 'veo-3.1-fast-generate-preview',
    enabled: true,
  },
] as const;

export const DEFAULT_STUDIO_IMAGE_CREATOR_ID =
  STUDIO_IMAGE_CREATORS.find((creator) => creator.enabled)?.id ?? STUDIO_IMAGE_CREATORS[0]?.id ?? '';

export const DEFAULT_STUDIO_VIDEO_CREATOR_ID =
  STUDIO_VIDEO_CREATORS.find((creator) => creator.enabled)?.id ?? STUDIO_VIDEO_CREATORS[0]?.id ?? '';

export function getStudioImageCreatorById(id: string | null | undefined): StudioImageCreatorOption | null {
  if (!id) return null;
  return STUDIO_IMAGE_CREATORS.find((creator) => creator.id === id) ?? null;
}

export function getStudioVideoCreatorById(id: string | null | undefined): StudioVideoCreatorOption | null {
  if (!id) return null;
  return STUDIO_VIDEO_CREATORS.find((creator) => creator.id === id) ?? null;
}

export function clampStudioVideoDurationSeconds(value: number): number {
  return Math.min(MAX_STUDIO_VIDEO_DURATION_SECONDS, Math.max(MIN_STUDIO_VIDEO_DURATION_SECONDS, Math.round(value)));
}

export function parseStudioVideoDurationSeconds(value: unknown): number | null {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(numeric)) return null;
  if (numeric < MIN_STUDIO_VIDEO_DURATION_SECONDS || numeric > MAX_STUDIO_VIDEO_DURATION_SECONDS) return null;
  return numeric;
}
