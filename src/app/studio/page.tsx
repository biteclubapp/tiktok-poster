'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

type VideoStatus = 'idle' | 'processing' | 'completed' | 'failed';

interface MetadataResponse {
  caption: string;
  hashtags: string[];
}

const ALLOWED_REFERENCE_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp']);
const MAX_REFERENCE_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB

export default function StudioPage() {
  const [imagePrompt, setImagePrompt] = useState('');
  const [motionPrompt, setMotionPrompt] = useState('');
  const [referenceImageFile, setReferenceImageFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const [imageId, setImageId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [videoJobId, setVideoJobId] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<VideoStatus>('idle');

  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);

  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [generatingMetadata, setGeneratingMetadata] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hashtagText = useMemo(() => hashtags.join(' '), [hashtags]);

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

  async function generateImage() {
    setErrorMessage(null);

    const prompt = imagePrompt.trim();
    if (prompt.length < 8 || prompt.length > 800) {
      setErrorMessage('Image prompt must be 8-800 characters.');
      return;
    }

    setGeneratingImage(true);
    setImageId(null);
    setImageUrl(null);
    setVideoJobId(null);
    setVideoId(null);
    setVideoUrl(null);
    setVideoStatus('idle');
    setCaption('');
    setHashtags([]);

    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      if (referenceImageFile) {
        formData.append('referenceImage', referenceImageFile);
      }

      const res = await fetch('/api/studio/image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Image generation failed');
      }

      setImageId(data.imageId);
      setImageUrl(data.imageUrl);

      if (!motionPrompt.trim()) {
        setMotionPrompt(`Cinematic 9:16 food video using this image as the hero frame, with smooth camera movement and rich texture detail.`);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Image generation failed');
    } finally {
      setGeneratingImage(false);
    }
  }

  async function generateVideo() {
    setErrorMessage(null);

    if (!imageId) {
      setErrorMessage('Generate an image first.');
      return;
    }

    const prompt = motionPrompt.trim();
    if (prompt.length < 8 || prompt.length > 800) {
      setErrorMessage('Motion prompt must be 8-800 characters.');
      return;
    }

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
        body: JSON.stringify({ imageId, motionPrompt: prompt }),
      });

      const data = await res.json();
      if (!res.ok) {
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
    try {
      const res = await fetch('/api/studio/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagePrompt: currentImagePrompt, motionPrompt: currentMotionPrompt }),
      });

      const data = await res.json();
      if (!res.ok) {
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
  }, []);

  useEffect(() => {
    if (!videoJobId || videoStatus !== 'processing') return;

    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`/api/studio/video/${videoJobId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch video status');
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
  }, [videoJobId, videoStatus, generateMetadata, imagePrompt, motionPrompt]);

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setErrorMessage(`Failed to copy ${label}.`);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h1 className="text-2xl font-bold text-gray-900">AI Studio</h1>
          <p className="text-sm text-gray-500 mt-1">
            OpenRouter Nano Banana image to Veo 3.1 Fast video for TikTok. Format is locked to 9:16, 8 seconds.
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <section className="bg-white rounded-2xl border border-gray-200 p-5 space-y-5">
            <header className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">1</span>
              <h2 className="text-sm font-bold text-gray-900">Create Image (OpenRouter Nano Banana)</h2>
            </header>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Food image prompt</label>
              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                onPaste={(e) => {
                  const handled = handlePaste(e.clipboardData);
                  if (handled) {
                    e.preventDefault();
                  }
                }}
                rows={5}
                placeholder="Example: Overhead shot of spicy honey garlic chicken thighs on a cast iron skillet with steam and glossy sauce"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{imagePrompt.length}/800</p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Optional reference image (for Nano Banana edit/guidance)
              </label>
              <p className="text-xs text-gray-400 mb-2">Upload a file or paste an image with Cmd/Ctrl+V.</p>
              <input
                key={fileInputKey}
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
                className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
              />
              <div className="mt-1 flex items-center justify-between">
                <p className="text-xs text-gray-400 truncate">
                  {referenceImageFile ? `Selected: ${referenceImageFile.name}` : 'No file selected'}
                </p>
                {referenceImageFile && (
                  <button
                    onClick={() => {
                      setReferenceImageFile(null);
                      setFileInputKey((prev) => prev + 1);
                    }}
                    className="text-xs font-medium text-red-500 hover:text-red-700"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={generateImage}
              disabled={generatingImage}
              className="w-full px-4 py-3 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {generatingImage ? 'Generating image...' : 'Generate Image'}
            </button>

            <header className="flex items-center gap-2 pt-2">
              <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">2</span>
              <h2 className="text-sm font-bold text-gray-900">Create Video (Veo 3.1 Fast)</h2>
            </header>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Motion prompt</label>
              <textarea
                value={motionPrompt}
                onChange={(e) => setMotionPrompt(e.target.value)}
                rows={5}
                placeholder="Example: Slow push-in shot, steam rising, sauce glistening, with dynamic lighting and appetizing texture"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{motionPrompt.length}/800</p>
            </div>

            <button
              onClick={generateVideo}
              disabled={!imageId || generatingVideo || generatingImage}
              className="w-full px-4 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {generatingVideo || videoStatus === 'processing' ? 'Generating video...' : 'Generate 9:16 Video (8s)'}
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
                    <img
                      src={imageUrl}
                      alt="Generated studio image"
                      className="w-full aspect-[9/16] object-cover rounded-xl border border-gray-200 bg-gray-100"
                    />
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
                  <span className="text-xs text-gray-400">TikTok-ready: 9:16, 8s</span>
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
                    placeholder="#foodtiktok #recipe"
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
