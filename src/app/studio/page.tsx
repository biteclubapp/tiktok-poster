'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  clampStudioVideoDurationSeconds,
  DEFAULT_STUDIO_VIDEO_DURATION_SECONDS,
  DEFAULT_STUDIO_IMAGE_CREATOR_ID,
  DEFAULT_STUDIO_VIDEO_CREATOR_ID,
  MAX_STUDIO_VIDEO_DURATION_SECONDS,
  MIN_STUDIO_VIDEO_DURATION_SECONDS,
  STUDIO_IMAGE_CREATORS,
  STUDIO_VIDEO_CREATORS,
} from '@/lib/studio-models';

type VideoStatus = 'idle' | 'processing' | 'completed' | 'failed';

interface SavedCharacter {
  id: string;
  name: string;
  prompt: string;
  imageUrl: string;
  imageId: string;
  attributes?: CharacterAttributes;
  createdAt: number;
}

const SAVED_CHARACTERS_KEY = 'biteclub-studio-saved-characters';

function loadSavedCharacters(): SavedCharacter[] {
  try {
    const raw = localStorage.getItem(SAVED_CHARACTERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistSavedCharacters(characters: SavedCharacter[]) {
  localStorage.setItem(SAVED_CHARACTERS_KEY, JSON.stringify(characters));
}

interface MetadataResponse {
  caption: string;
  hashtags: string[];
}

interface ApiKeyHelpResponse {
  provider: string;
  envVar: string;
  setupUrl: string;
  label: string;
}

// Character attribute fields — all free-text with placeholder hints
const CHARACTER_FIELDS: { key: keyof CharacterAttributes; label: string; placeholder: string }[] = [
  { key: 'artStyle', label: 'Art style', placeholder: 'e.g. Photorealistic, 3D Pixar, Anime, Cinematic film still, Watercolor' },
  { key: 'cameraAngle', label: 'Camera angle', placeholder: 'e.g. Close-up portrait, Medium shot, Full body, Low angle heroic' },
  { key: 'age', label: 'Age', placeholder: 'e.g. Young adult, 20s, Mid-30s, Senior' },
  { key: 'sex', label: 'Sex', placeholder: 'e.g. Male, Female, Non-binary, Androgynous' },
  { key: 'ethnicity', label: 'Ethnicity', placeholder: 'e.g. East Asian, Black, Latino, Middle Eastern, Mixed' },
  { key: 'bodyType', label: 'Body type', placeholder: 'e.g. Slim, Athletic, Average, Curvy, Muscular' },
  { key: 'clothing', label: 'Clothing', placeholder: 'e.g. Chef uniform, Apron & t-shirt, Streetwear, Traditional' },
  { key: 'mood', label: 'Mood / tone', placeholder: 'e.g. Happy & warm, Confident, Mysterious, Playful, Serious' },
  { key: 'setting', label: 'Location / setting', placeholder: 'e.g. Modern kitchen, Outdoor market, Cozy cafe, Rooftop' },
  { key: 'props', label: 'Props', placeholder: 'e.g. Wooden cutting board, copper pots, fresh herbs, neon sign' },
  { key: 'sceneDescription', label: 'Extra details', placeholder: 'Anything else — lighting, colors, composition, food on table, etc.' },
];

type CharacterAttributes = {
  age: string;
  sex: string;
  ethnicity: string;
  bodyType: string;
  clothing: string;
  mood: string;
  setting: string;
  artStyle: string;
  cameraAngle: string;
  props: string;
  sceneDescription: string;
};

const EMPTY_ATTRIBUTES: CharacterAttributes = {
  age: '', sex: '', ethnicity: '', bodyType: '', clothing: '',
  mood: '', setting: '', artStyle: '', cameraAngle: '', props: '', sceneDescription: '',
};

function buildPromptFromAttributes(attrs: CharacterAttributes): string {
  const parts: string[] = [];

  if (attrs.artStyle.trim()) parts.push(`${attrs.artStyle.trim()} style`);
  if (attrs.cameraAngle.trim()) parts.push(attrs.cameraAngle.trim());

  const charParts: string[] = [];
  if (attrs.age.trim()) charParts.push(attrs.age.trim().toLowerCase());
  if (attrs.sex.trim()) charParts.push(attrs.sex.trim().toLowerCase());
  if (attrs.ethnicity.trim()) charParts.push(attrs.ethnicity.trim().toLowerCase());
  if (attrs.bodyType.trim()) charParts.push(`${attrs.bodyType.trim().toLowerCase()} build`);
  if (charParts.length > 0) parts.push(`of a ${charParts.join(', ')} person`);

  if (attrs.clothing.trim()) parts.push(`wearing ${attrs.clothing.trim().toLowerCase()}`);
  if (attrs.mood.trim()) parts.push(`with a ${attrs.mood.trim().toLowerCase()} expression`);
  if (attrs.setting.trim()) parts.push(`in a ${attrs.setting.trim().toLowerCase()}`);
  if (attrs.props.trim()) parts.push(`with ${attrs.props.trim().toLowerCase()}`);
  if (attrs.sceneDescription.trim()) parts.push(attrs.sceneDescription.trim());

  if (parts.length > 0) {
    parts.push('9:16 vertical format, high quality, detailed lighting');
  }

  return parts.join(', ');
}

const ALLOWED_REFERENCE_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp']);
const MAX_REFERENCE_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB

function normalizeImageMimeType(mimeType: string): string {
  const normalized = mimeType.toLowerCase().split(';')[0].trim();
  if (normalized === 'image/jpg') return 'image/jpeg';
  return normalized;
}

function extensionFromMimeType(mimeType: string): string {
  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/webp') return 'webp';
  return 'png';
}

export default function StudioPage() {
  const [imagePrompt, setImagePrompt] = useState('');
  const [editImagePrompt, setEditImagePrompt] = useState('');
  const [motionPrompt, setMotionPrompt] = useState('');
  const [imageCreatorId, setImageCreatorId] = useState(DEFAULT_STUDIO_IMAGE_CREATOR_ID);
  const [videoCreatorId, setVideoCreatorId] = useState(DEFAULT_STUDIO_VIDEO_CREATOR_ID);
  const [referenceImageFile, setReferenceImageFile] = useState<File | null>(null);
  const [referenceImagePreviewUrl, setReferenceImagePreviewUrl] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const [imageId, setImageId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [videoJobId, setVideoJobId] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<VideoStatus>('idle');
  const [videoDurationSeconds, setVideoDurationSeconds] = useState(DEFAULT_STUDIO_VIDEO_DURATION_SECONDS);
  const [generatedVideoDurationSeconds, setGeneratedVideoDurationSeconds] = useState(DEFAULT_STUDIO_VIDEO_DURATION_SECONDS);

  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);

  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageGenerationMode, setImageGenerationMode] = useState<'generate' | 'edit' | null>(null);
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [generatingMetadata, setGeneratingMetadata] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorApiKeyHelp, setErrorApiKeyHelp] = useState<ApiKeyHelpResponse | null>(null);

  const [savedCharacters, setSavedCharacters] = useState<SavedCharacter[]>([]);
  const [saveCharacterName, setSaveCharacterName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [attrs, setAttrs] = useState<CharacterAttributes>({ ...EMPTY_ATTRIBUTES });
  const [useAttributeBuilder, setUseAttributeBuilder] = useState(true);

  function updateAttr(key: keyof CharacterAttributes, value: string) {
    setAttrs((prev) => ({ ...prev, [key]: value }));
  }

  // Sync built prompt into imagePrompt when attributes change (only in builder mode)
  useEffect(() => {
    if (!useAttributeBuilder) return;
    const built = buildPromptFromAttributes(attrs);
    if (built) setImagePrompt(built);
  }, [attrs, useAttributeBuilder]);

  useEffect(() => {
    setSavedCharacters(loadSavedCharacters());
  }, []);

  function saveCharacter() {
    if (!imageId || !imageUrl || !saveCharacterName.trim()) return;
    const character: SavedCharacter = {
      id: crypto.randomUUID(),
      name: saveCharacterName.trim(),
      prompt: imagePrompt,
      imageUrl,
      imageId,
      attributes: { ...attrs },
      createdAt: Date.now(),
    };
    const updated = [character, ...savedCharacters];
    setSavedCharacters(updated);
    persistSavedCharacters(updated);
    setSaveCharacterName('');
    setShowSaveInput(false);
  }

  function deleteSavedCharacter(id: string) {
    const updated = savedCharacters.filter((c) => c.id !== id);
    setSavedCharacters(updated);
    persistSavedCharacters(updated);
  }

  function loadCharacter(character: SavedCharacter) {
    setImagePrompt(character.prompt);
    setImageId(character.imageId);
    setImageUrl(character.imageUrl);
    if (character.attributes) {
      setAttrs({ ...EMPTY_ATTRIBUTES, ...character.attributes });
      setUseAttributeBuilder(true);
    }
    setVideoJobId(null);
    setVideoId(null);
    setVideoUrl(null);
    setVideoStatus('idle');
    setCaption('');
    setHashtags([]);
    if (!motionPrompt.trim()) {
      setMotionPrompt('Cinematic 9:16 TikTok video using this image as the hero frame, with smooth camera movement and rich visual detail.');
    }
  }

  const hashtagText = useMemo(() => hashtags.join(' '), [hashtags]);
  const selectedImageCreator = useMemo(
    () => STUDIO_IMAGE_CREATORS.find((creator) => creator.id === imageCreatorId) || STUDIO_IMAGE_CREATORS[0],
    [imageCreatorId]
  );
  const selectedVideoCreator = useMemo(
    () => STUDIO_VIDEO_CREATORS.find((creator) => creator.id === videoCreatorId) || STUDIO_VIDEO_CREATORS[0],
    [videoCreatorId]
  );
  const videoDurationOptions = useMemo(
    () => Array.from(
      { length: MAX_STUDIO_VIDEO_DURATION_SECONDS - MIN_STUDIO_VIDEO_DURATION_SECONDS + 1 },
      (_, index) => index + MIN_STUDIO_VIDEO_DURATION_SECONDS
    ),
    []
  );

  const readApiKeyHelp = useCallback((payload: unknown): ApiKeyHelpResponse | null => {
    if (!payload || typeof payload !== 'object') return null;
    const value = payload as Record<string, unknown>;
    const help = value.apiKeyHelp;
    if (!help || typeof help !== 'object') return null;
    const helpValue = help as Record<string, unknown>;

    if (
      typeof helpValue.provider !== 'string'
      || typeof helpValue.envVar !== 'string'
      || typeof helpValue.setupUrl !== 'string'
      || typeof helpValue.label !== 'string'
    ) {
      return null;
    }

    return {
      provider: helpValue.provider,
      envVar: helpValue.envVar,
      setupUrl: helpValue.setupUrl,
      label: helpValue.label,
    };
  }, []);

  const applyReferenceImage = useCallback((file: File) => {
    const type = (file.type || '').toLowerCase();
    if (!ALLOWED_REFERENCE_IMAGE_TYPES.has(type)) {
      setErrorMessage('Reference image must be PNG, JPG, or WEBP.');
      return;
    }

    if (file.size > MAX_REFERENCE_IMAGE_BYTES) {
      setErrorMessage('Reference image must be 10MB or smaller.');
      return;
    }

    setErrorMessage(null);
    setReferenceImageFile(file);
  }, []);

  const imageFromClipboard = useCallback((clipboardData: DataTransfer | null): File | null => {
    if (!clipboardData?.items) return null;
    for (const item of Array.from(clipboardData.items)) {
      if (!item.type.startsWith('image/')) continue;
      const file = item.getAsFile();
      if (file) return file;
    }
    return null;
  }, []);

  const handlePaste = useCallback((clipboardData: DataTransfer | null): boolean => {
    const file = imageFromClipboard(clipboardData);
    if (!file) return false;
    applyReferenceImage(file);
    return true;
  }, [applyReferenceImage, imageFromClipboard]);

  useEffect(() => {
    const onWindowPaste = (event: ClipboardEvent) => {
      const handled = handlePaste(event.clipboardData);
      if (handled) {
        event.preventDefault();
      }
    };

    window.addEventListener('paste', onWindowPaste);
    return () => window.removeEventListener('paste', onWindowPaste);
  }, [handlePaste]);

  useEffect(() => {
    if (!referenceImageFile) {
      setReferenceImagePreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(referenceImageFile);
    setReferenceImagePreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [referenceImageFile]);

  async function runImageGeneration(
    mode: 'generate' | 'edit',
    prompt: string,
    sourceReferenceImage: File | null
  ): Promise<boolean> {
    setErrorMessage(null);
    setErrorApiKeyHelp(null);
    setGeneratingImage(true);
    setImageGenerationMode(mode);
    setImageId(null);
    setImageUrl(null);
    setVideoJobId(null);
    setVideoId(null);
    setVideoUrl(null);
    setVideoStatus('idle');
    setGeneratedVideoDurationSeconds(videoDurationSeconds);
    setCaption('');
    setHashtags([]);

    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('imageCreator', imageCreatorId);
      if (sourceReferenceImage) {
        formData.append('referenceImage', sourceReferenceImage);
      }

      const res = await fetch('/api/studio/image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorApiKeyHelp(readApiKeyHelp(data));
        throw new Error(data.error || 'Image generation failed');
      }

      setImageId(data.imageId);
      setImageUrl(data.imageUrl);
      setImagePrompt(prompt);

      if (!motionPrompt.trim()) {
        setMotionPrompt('Cinematic 9:16 TikTok video using this image as the hero frame, with smooth camera movement and rich visual detail.');
      }

      return true;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Image generation failed');
      return false;
    } finally {
      setGeneratingImage(false);
      setImageGenerationMode(null);
    }
  }

  async function generateImage() {
    setErrorMessage(null);

    const prompt = imagePrompt.trim();
    if (prompt.length < 8 || prompt.length > 800) {
      setErrorMessage('Image prompt must be 8-800 characters.');
      return;
    }

    await runImageGeneration('generate', prompt, referenceImageFile);
  }

  async function editGeneratedImage() {
    setErrorMessage(null);
    setErrorApiKeyHelp(null);

    if (!imageUrl) {
      setErrorMessage('Generate an image first.');
      return;
    }

    const prompt = editImagePrompt.trim();
    if (prompt.length < 8 || prompt.length > 800) {
      setErrorMessage('Edit prompt must be 8-800 characters.');
      return;
    }

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('Failed to load generated image for editing.');
      }

      const blob = await response.blob();
      const mimeType = normalizeImageMimeType(response.headers.get('content-type') || blob.type || 'image/png');
      if (!ALLOWED_REFERENCE_IMAGE_TYPES.has(mimeType)) {
        throw new Error('Generated image format is not supported for editing.');
      }

      const referenceFile = new File(
        [blob],
        `studio-generated-reference.${extensionFromMimeType(mimeType)}`,
        { type: mimeType }
      );

      const success = await runImageGeneration('edit', prompt, referenceFile);
      if (success) {
        setEditImagePrompt('');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to edit generated image');
    }
  }

  async function generateVideo() {
    setErrorMessage(null);
    setErrorApiKeyHelp(null);

    if (!imageId) {
      setErrorMessage('Generate an image first.');
      return;
    }

    const prompt = motionPrompt.trim();
    if (prompt.length < 8 || prompt.length > 800) {
      setErrorMessage('Motion prompt must be 8-800 characters.');
      return;
    }
    const durationSeconds = clampStudioVideoDurationSeconds(videoDurationSeconds);
    setVideoDurationSeconds(durationSeconds);
    setGeneratedVideoDurationSeconds(durationSeconds);

    setGeneratingVideo(true);
    setVideoJobId(null);
    setVideoId(null);
    setVideoUrl(null);
    setVideoStatus('processing');
    setCaption('');
    setHashtags([]);

    try {
      const res = await fetch('/api/studio/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId, motionPrompt: prompt, durationSeconds, videoCreator: videoCreatorId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorApiKeyHelp(readApiKeyHelp(data));
        throw new Error(data.error || 'Video generation failed to start');
      }

      setVideoJobId(data.jobId);
      setVideoStatus('processing');
    } catch (error) {
      setVideoStatus('failed');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to start video generation');
    } finally {
      setGeneratingVideo(false);
    }
  }

  const generateMetadata = useCallback(async (currentImagePrompt: string, currentMotionPrompt: string) => {
    setGeneratingMetadata(true);
    setErrorApiKeyHelp(null);
    try {
      const res = await fetch('/api/studio/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagePrompt: currentImagePrompt, motionPrompt: currentMotionPrompt }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorApiKeyHelp(readApiKeyHelp(data));
        throw new Error(data.error || 'Failed to generate caption');
      }

      const parsed = data as MetadataResponse;
      setCaption(parsed.caption || '');
      setHashtags(Array.isArray(parsed.hashtags) ? parsed.hashtags : []);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to generate metadata');
    } finally {
      setGeneratingMetadata(false);
    }
  }, [readApiKeyHelp]);

  useEffect(() => {
    if (!videoJobId || videoStatus !== 'processing') return;

    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`/api/studio/video/${videoJobId}`);
        const data = await res.json();

        if (!res.ok) {
          setErrorApiKeyHelp(readApiKeyHelp(data));
          throw new Error(data.error || 'Failed to fetch video status');
        }

        if (typeof data.durationSeconds === 'number') {
          setGeneratedVideoDurationSeconds(clampStudioVideoDurationSeconds(data.durationSeconds));
        }

        if (cancelled) return;

        if (data.status === 'completed') {
          setVideoStatus('completed');
          setVideoId(data.videoId);
          setVideoUrl(data.videoUrl);
          void generateMetadata(imagePrompt, motionPrompt);
          return;
        }

        if (data.status === 'failed') {
          setVideoStatus('failed');
          setErrorApiKeyHelp(readApiKeyHelp(data));
          setErrorMessage(data.error || 'Video generation failed');
          return;
        }

        setVideoStatus('processing');
      } catch (error) {
        if (cancelled) return;
        setVideoStatus('failed');
        setErrorMessage(error instanceof Error ? error.message : 'Failed to fetch video status');
      }
    };

    void poll();
    const interval = setInterval(() => void poll(), 4000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [videoJobId, videoStatus, generateMetadata, imagePrompt, motionPrompt, readApiKeyHelp]);

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setErrorApiKeyHelp(null);
      setErrorMessage(`Failed to copy ${label}.`);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h1 className="text-2xl font-bold text-gray-900">AI Studio</h1>
          <p className="text-sm text-gray-500 mt-1">
            {selectedImageCreator?.label} to {selectedVideoCreator?.label} for TikTok. Format is locked to 9:16 with configurable duration.
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            <p>{errorMessage}</p>
            {errorApiKeyHelp && (
              <a
                href={errorApiKeyHelp.setupUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-2 text-red-700 underline font-medium"
              >
                {errorApiKeyHelp.label} ({errorApiKeyHelp.envVar})
              </a>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <section className="bg-white rounded-2xl border border-gray-200 p-5 space-y-5">
            <header className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">1</span>
              <h2 className="text-sm font-bold text-gray-900">Create Image</h2>
            </header>

            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-xs text-amber-800">
                <span className="font-semibold">Tip:</span> Iterate on your character as an image first (~$0.02) before generating video (~$1.20). Save characters you like to reuse them across posts.
              </p>
            </div>

            {savedCharacters.length > 0 && (
              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">Your characters</label>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {savedCharacters.map((character) => (
                    <div
                      key={character.id}
                      className="flex-shrink-0 w-20 group relative"
                    >
                      <button
                        onClick={() => loadCharacter(character)}
                        className={`w-20 h-[142px] rounded-xl border-2 overflow-hidden transition-all ${
                          imageId === character.imageId
                            ? 'border-red-500 ring-2 ring-red-500/20'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <img
                          src={character.imageUrl}
                          alt={character.name}
                          className="w-full h-full object-cover"
                        />
                      </button>
                      <p className="text-xs text-gray-700 font-medium text-center mt-1 truncate">{character.name}</p>
                      <button
                        onClick={() => deleteSavedCharacter(character.id)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                        title="Delete character"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Image creator</label>
              <select
                value={imageCreatorId}
                onChange={(e) => setImageCreatorId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
              >
                {STUDIO_IMAGE_CREATORS.map((creator) => (
                  <option key={creator.id} value={creator.id} disabled={!creator.enabled}>
                    {creator.label} - {creator.costLabel}{creator.enabled ? '' : ' (Coming soon)'}
                  </option>
                ))}
              </select>
              {selectedImageCreator?.description && (
                <p className="text-xs text-gray-400 mt-1">
                  {selectedImageCreator.description} · {selectedImageCreator.costLabel}
                </p>
              )}
            </div>

            {/* Mode toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setUseAttributeBuilder(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  useAttributeBuilder ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Character Builder
              </button>
              <button
                onClick={() => setUseAttributeBuilder(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  !useAttributeBuilder ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Raw Prompt
              </button>
            </div>

            {useAttributeBuilder ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {CHARACTER_FIELDS.map(({ key, label, placeholder }) => (
                    <div key={key} className={key === 'sceneDescription' ? 'col-span-2' : ''}>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
                      {key === 'sceneDescription' ? (
                        <textarea
                          value={attrs[key]}
                          onChange={(e) => updateAttr(key, e.target.value)}
                          rows={2}
                          placeholder={placeholder}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 resize-none"
                        />
                      ) : (
                        <input
                          type="text"
                          value={attrs[key]}
                          onChange={(e) => updateAttr(key, e.target.value)}
                          placeholder={placeholder}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Generated prompt preview */}
                <details className="text-xs">
                  <summary className="text-gray-400 cursor-pointer hover:text-gray-600">Preview generated prompt</summary>
                  <p className="mt-1 p-2 bg-gray-50 rounded-lg text-gray-600 break-words">{imagePrompt || 'Fill in fields above to build a prompt'}</p>
                </details>

                <button
                  onClick={() => setAttrs({ ...EMPTY_ATTRIBUTES })}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  Clear all fields
                </button>
              </div>
            ) : (
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Prompt</label>
                <textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  onPaste={(e) => {
                    const handled = handlePaste(e.clipboardData);
                    if (handled) {
                      e.preventDefault();
                    }
                  }}
                  rows={8}
                  placeholder="Example: Photorealistic close-up portrait of a young adult female chef, warm smile, modern kitchen, golden hour lighting, 9:16 vertical"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">{imagePrompt.length}/800</p>
              </div>
            )}

            {/* Reference image */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Optional reference image
              </label>
              <div className="relative w-full aspect-[3/2] rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                <input
                  key={fileInputKey}
                  id={`reference-image-input-${fileInputKey}`}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) {
                      setReferenceImageFile(null);
                      return;
                    }
                    applyReferenceImage(file);
                  }}
                  className="hidden"
                />

                {referenceImagePreviewUrl ? (
                  <img
                    src={referenceImagePreviewUrl}
                    alt="Reference image preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                    <p className="text-xs text-gray-500">No reference image selected</p>
                    <p className="text-xs text-gray-400 mt-1">Choose a file or paste with Cmd/Ctrl+V</p>
                  </div>
                )}

                <div className="absolute left-0 right-0 bottom-0 p-2 bg-white/90 border-t border-gray-200 flex items-center gap-2">
                  <label
                    htmlFor={`reference-image-input-${fileInputKey}`}
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-900 text-white hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    Choose file
                  </label>
                  <p className="flex-1 text-xs text-gray-600 truncate">
                    {referenceImageFile ? referenceImageFile.name : 'Paste image with Cmd/Ctrl+V'}
                  </p>
                  <button
                    onClick={() => {
                      setReferenceImageFile(null);
                      setFileInputKey((prev) => prev + 1);
                    }}
                    disabled={!referenceImageFile}
                    className="text-xs font-medium text-red-500 hover:text-red-700 disabled:text-gray-300 disabled:cursor-not-allowed"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={generateImage}
              disabled={generatingImage}
              className="w-full px-4 py-3 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {generatingImage && imageGenerationMode === 'generate' ? 'Generating image...' : 'Generate Image'}
            </button>

            {imageUrl && (
              <div>
                {showSaveInput ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={saveCharacterName}
                      onChange={(e) => setSaveCharacterName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveCharacter()}
                      placeholder="Character name..."
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                      autoFocus
                    />
                    <button
                      onClick={saveCharacter}
                      disabled={!saveCharacterName.trim()}
                      className="px-3 py-2 rounded-lg text-xs font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setShowSaveInput(false); setSaveCharacterName(''); }}
                      className="px-2 py-2 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSaveInput(true)}
                    className="w-full px-4 py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors border border-gray-200"
                  >
                    Save Character for Reuse
                  </button>
                )}
              </div>
            )}

            <header className="flex items-center gap-2 pt-2">
              <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">2</span>
              <h2 className="text-sm font-bold text-gray-900">Create Video (Veo 3.1 Fast)</h2>
            </header>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Video creator</label>
              <select
                value={videoCreatorId}
                onChange={(e) => setVideoCreatorId(e.target.value)}
                disabled
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-gray-50 cursor-not-allowed focus:outline-none"
              >
                {STUDIO_VIDEO_CREATORS.map((creator) => (
                  <option key={creator.id} value={creator.id}>
                    {creator.label}{creator.costLabel ? ` - ${creator.costLabel}` : ''}
                  </option>
                ))}
              </select>
              {selectedVideoCreator?.description && (
                <p className="text-xs text-gray-400 mt-1">
                  {selectedVideoCreator.description}
                  {selectedVideoCreator.costLabel ? ` · ${selectedVideoCreator.costLabel}` : ''}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">More video models coming soon.</p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Motion prompt</label>
              <textarea
                value={motionPrompt}
                onChange={(e) => setMotionPrompt(e.target.value)}
                rows={5}
                placeholder="Example: Slow push-in camera movement with soft parallax, subtle subject motion, and dramatic cinematic lighting"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{motionPrompt.length}/800</p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Duration (seconds)</label>
              <select
                value={videoDurationSeconds}
                onChange={(e) => setVideoDurationSeconds(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
              >
                {videoDurationOptions.map((seconds) => (
                  <option key={seconds} value={seconds}>
                    {seconds}s
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={generateVideo}
              disabled={!imageId || generatingVideo || generatingImage}
              className="w-full px-4 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {generatingVideo || videoStatus === 'processing' ? 'Generating video...' : `Generate 9:16 Video (${videoDurationSeconds}s)`}
            </button>
          </section>

          <section className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <header className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">3</span>
                <h2 className="text-sm font-bold text-gray-900">Preview</h2>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Image</p>
                  {imageUrl ? (
                    <div className="space-y-3">
                      <img
                        src={imageUrl}
                        alt="Generated studio image"
                        className="w-full aspect-[9/16] object-cover rounded-xl border border-gray-200 bg-gray-100"
                      />
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Edit this image</label>
                        <textarea
                          value={editImagePrompt}
                          onChange={(e) => setEditImagePrompt(e.target.value)}
                          rows={3}
                          placeholder="Example: Keep framing, but make the scene look rainy and cinematic"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 resize-none"
                        />
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <p className="text-xs text-gray-400">{editImagePrompt.length}/800</p>
                          <button
                            onClick={editGeneratedImage}
                            disabled={generatingImage || editImagePrompt.trim().length < 8 || editImagePrompt.trim().length > 800}
                            className="px-3 py-2 rounded-lg text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            {generatingImage && imageGenerationMode === 'edit' ? 'Applying edit...' : 'Apply Edit'}
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Uses the current generated image as the reference.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full aspect-[9/16] rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-sm text-gray-400">
                      No image yet
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Video</p>
                  {videoUrl ? (
                    <video
                      src={videoUrl}
                      controls
                      playsInline
                      className="w-full aspect-[9/16] object-cover rounded-xl border border-gray-200 bg-black"
                    />
                  ) : (
                    <div className="w-full aspect-[9/16] rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-sm text-gray-400 text-center px-3">
                      {videoStatus === 'processing' ? 'Video is rendering. Polling every 4 seconds...' : 'No video yet'}
                    </div>
                  )}
                </div>
              </div>

              {videoUrl && (
                <div className="mt-4 flex items-center gap-3">
                  <a
                    href={videoUrl}
                    download={`studio-${videoId || 'video'}.mp4`}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    Download MP4
                  </a>
                  <span className="text-xs text-gray-400">TikTok-ready: 9:16, {generatedVideoDurationSeconds}s</span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <header className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">4</span>
                <h2 className="text-sm font-bold text-gray-900">TikTok Caption + Hashtags</h2>
              </header>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Caption</label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 resize-none"
                    placeholder="Caption will appear after video generation finishes"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Hashtags</label>
                  <textarea
                    value={hashtagText}
                    onChange={(e) => setHashtags(e.target.value.split(/\s+/).filter(Boolean))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 resize-none"
                    placeholder="#tiktok #fyp #viral"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => void generateMetadata(imagePrompt, motionPrompt)}
                    disabled={generatingMetadata || imagePrompt.trim().length < 8 || motionPrompt.trim().length < 8}
                    className="px-3 py-2 rounded-lg text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {generatingMetadata ? 'Generating...' : 'Regenerate Copy'}
                  </button>
                  <button
                    onClick={() => void copyText(caption, 'caption')}
                    disabled={!caption}
                    className="px-3 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Copy Caption
                  </button>
                  <button
                    onClick={() => void copyText(hashtagText, 'hashtags')}
                    disabled={!hashtagText}
                    className="px-3 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Copy Hashtags
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
