'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────────────────────────

type WrapperStyle = 'phone' | 'story' | 'photo_dump';

interface WrapperConfig {
  id: WrapperStyle;
  label: string;
  desc: string;
  badge: string;
  badgeColor: string;
  preview: string;
}

const WRAPPER_STYLES: WrapperConfig[] = [
  {
    id: 'phone',
    label: 'Phone Screenshot',
    desc: 'Renders each slide inside a minimal iPhone-style frame. Looks like a real screenshot shared to Stories.',
    badge: 'Authentic',
    badgeColor: 'bg-blue-100 text-blue-700',
    preview: 'bg-gray-900 rounded-2xl border-4 border-gray-700',
  },
  {
    id: 'story',
    label: 'Story Style',
    desc: 'Adds casual text overlays, a timestamp sticker, and subtle rotation — feels like an organic Story repost.',
    badge: 'Casual',
    badgeColor: 'bg-pink-100 text-pink-700',
    preview: 'bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg',
  },
  {
    id: 'photo_dump',
    label: 'Photo Dump',
    desc: 'Arranges up to 4 slides in a loose multi-photo grid with slight rotations — perfect for a casual carousel intro.',
    badge: 'Aesthetic',
    badgeColor: 'bg-amber-100 text-amber-700',
    preview: 'bg-gray-100 rounded border-2 border-gray-300',
  },
];

// ── Canvas rendering helpers ──────────────────────────────────────────────────

const CANVAS_W = 1080;
const CANVAS_H = 1440;

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function renderPhoneFrame(slideUrl: string): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Phone outer frame dimensions
  const frameW = 860;
  const frameH = 1740;
  const frameX = (CANVAS_W - frameW) / 2;
  const frameY = (CANVAS_H - frameH) / 2;
  const radius = 80;

  // Draw phone body shadow
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 20;

  // Draw phone body
  ctx.beginPath();
  ctx.roundRect(frameX, frameY, frameW, frameH, radius);
  ctx.fillStyle = '#111';
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Phone border ring
  ctx.beginPath();
  ctx.roundRect(frameX, frameY, frameW, frameH, radius);
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Screen area (inset from frame)
  const screenPad = 16;
  const screenTop = frameY + 60;
  const screenX = frameX + screenPad;
  const screenW = frameW - screenPad * 2;
  const screenH = frameH - 60 - 30;

  // Clip to screen
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(screenX, screenTop, screenW, screenH, 64);
  ctx.clip();

  // Draw slide image
  const img = await loadImg(slideUrl);
  const imgAspect = img.width / img.height;
  const screenAspect = screenW / screenH;
  let drawX = screenX, drawY = screenTop, drawW = screenW, drawH = screenH;
  if (imgAspect > screenAspect) {
    drawH = screenH;
    drawW = screenH * imgAspect;
    drawX = screenX - (drawW - screenW) / 2;
  } else {
    drawW = screenW;
    drawH = screenW / imgAspect;
    drawY = screenTop - (drawH - screenH) / 2;
  }
  ctx.drawImage(img, drawX, drawY, drawW, drawH);

  ctx.restore();

  // Status bar overlay
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(screenX, screenTop, screenW, 60);

  // Dynamic island / notch bar
  const notchW = 200;
  const notchH = 36;
  const notchX = screenX + (screenW - notchW) / 2;
  const notchY = screenTop + 12;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.roundRect(notchX, notchY, notchW, notchH, 18);
  ctx.fill();

  // Status bar text (time on left, icons on right)
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, Arial, sans-serif';
  ctx.fillText('9:41', screenX + 28, screenTop + 42);

  // Battery indicator (right side of status bar)
  const battX = screenX + screenW - 90;
  const battY = screenTop + 26;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.roundRect(battX, battY, 56, 22, 5);
  ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.roundRect(battX + 2, battY + 2, 46, 18, 3);
  ctx.fill();
  ctx.fillStyle = '#4ade80';
  ctx.beginPath();
  ctx.roundRect(battX + 2, battY + 2, 36, 18, 3);
  ctx.fill();
  // Battery tip
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.roundRect(battX + 58, battY + 7, 6, 10, 2);
  ctx.fill();

  // Signal bars (simplified)
  const sigX = screenX + screenW - 160;
  const sigY = screenTop + 28;
  [0, 10, 20].forEach((offset, i) => {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(sigX + offset, sigY + (2 - i) * 4, 7, 12 + i * 4);
  });

  // Home indicator bar at bottom
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  const homeW = 200;
  const homeY = frameY + frameH - 28;
  ctx.beginPath();
  ctx.roundRect((CANVAS_W - homeW) / 2, homeY, homeW, 8, 4);
  ctx.fill();

  return canvas.toDataURL('image/jpeg', 0.9);
}

async function renderStoryStyle(slideUrl: string, slideIndex: number): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext('2d')!;

  // Warm paper background
  ctx.fillStyle = '#f5f0ea';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Draw slide with slight rotation for each slide to feel organic
  const rotations = [-2.5, 1.8, -1.2, 2.1, -0.8];
  const rot = (rotations[slideIndex % rotations.length] * Math.PI) / 180;
  const innerW = 960;
  const innerH = 1560;
  const x = (CANVAS_W - innerW) / 2;
  const y = (CANVAS_H - innerH) / 2;

  ctx.save();
  ctx.translate(CANVAS_W / 2, CANVAS_H / 2);
  ctx.rotate(rot);
  ctx.translate(-CANVAS_W / 2, -CANVAS_H / 2);

  // Drop shadow
  ctx.shadowColor = 'rgba(0,0,0,0.25)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 12;

  // White card border (like a Polaroid)
  const borderW = innerW + 24;
  const borderH = innerH + 24;
  const borderX = (CANVAS_W - borderW) / 2;
  const borderY = (CANVAS_H - borderH) / 2;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.roundRect(borderX, borderY, borderW, borderH, 16);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Slide image
  ctx.beginPath();
  ctx.roundRect(x, y, innerW, innerH, 12);
  ctx.clip();

  const img = await loadImg(slideUrl);
  const aspect = img.width / img.height;
  const targetAspect = innerW / innerH;
  let dx = x, dy = y, dw = innerW, dh = innerH;
  if (aspect > targetAspect) {
    dw = innerH * aspect;
    dx = x - (dw - innerW) / 2;
  } else {
    dh = innerW / aspect;
    dy = y - (dh - innerH) / 2;
  }
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();

  // Story progress bar overlay at top
  const barY = 90;
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.roundRect(60, barY, CANVAS_W - 120, 6, 3);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.roundRect(60, barY, (CANVAS_W - 120) * 0.6, 6, 3);
  ctx.fill();

  // "Caption" sticker overlay — bottom left
  const overlayY = CANVAS_H - 180;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.beginPath();
  ctx.roundRect(60, overlayY, 480, 80, 24);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 32px Arial, sans-serif';
  ctx.fillText('swipe for more', 90, overlayY + 52);

  // Time sticker
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  ctx.roundRect(CANVAS_W - 240, CANVAS_H - 180, 180, 68, 20);
  ctx.fill();
  ctx.fillStyle = '#333';
  ctx.font = 'bold 28px Arial, sans-serif';
  const hours = new Date().getHours();
  const mins = new Date().getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  ctx.fillText(`${hours % 12 || 12}:${mins} ${ampm}`, CANVAS_W - 228, CANVAS_H - 136);

  return canvas.toDataURL('image/jpeg', 0.9);
}

async function renderPhotoDump(slideUrls: string[]): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext('2d')!;

  // Warm off-white background
  ctx.fillStyle = '#faf8f5';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  const usedSlides = slideUrls.slice(0, 4);
  const imgs = await Promise.all(usedSlides.map(loadImg));

  // Layout: 4 photos in a 2x2 staggered grid with rotations
  const configs = [
    { x: 60,  y: 100,  w: 480, h: 700, rot: -3   },
    { x: 540, y: 140,  w: 480, h: 700, rot:  2.5 },
    { x: 80,  y: 1020, w: 480, h: 700, rot:  1.8 },
    { x: 520, y: 980,  w: 480, h: 700, rot: -2.2 },
  ];

  for (let i = 0; i < usedSlides.length; i++) {
    const cfg = configs[i];
    const img = imgs[i];
    const rotRad = (cfg.rot * Math.PI) / 180;

    ctx.save();
    ctx.translate(cfg.x + cfg.w / 2, cfg.y + cfg.h / 2);
    ctx.rotate(rotRad);
    ctx.translate(-(cfg.w / 2), -(cfg.h / 2));

    // White border (Polaroid feel)
    ctx.shadowColor = 'rgba(0,0,0,0.18)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = '#fff';
    ctx.fillRect(-12, -12, cfg.w + 24, cfg.h + 36);
    ctx.shadowColor = 'transparent';

    // Clip to photo area
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, cfg.w, cfg.h);
    ctx.clip();

    const aspect = img.width / img.height;
    const tAspect = cfg.w / cfg.h;
    let dx = 0, dy = 0, dw = cfg.w, dh = cfg.h;
    if (aspect > tAspect) {
      dw = cfg.h * aspect;
      dx = -(dw - cfg.w) / 2;
    } else {
      dh = cfg.w / aspect;
      dy = -(dh - cfg.h) / 2;
    }
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
    ctx.restore();
  }

  // Scrawled label at top
  ctx.fillStyle = '#555';
  ctx.font = 'bold 52px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('dump', CANVAS_W / 2, CANVAS_H - 100);
  ctx.font = '32px Georgia, serif';
  ctx.fillStyle = '#aaa';
  ctx.fillText('@biteclub.app', CANVAS_W / 2, CANVAS_H - 52);
  ctx.textAlign = 'left';

  return canvas.toDataURL('image/jpeg', 0.9);
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function UGCPage() {
  const [wrapperStyle, setWrapperStyle] = useState<WrapperStyle>('phone');
  const [sourceImages, setSourceImages] = useState<string[]>([]);
  const [pastedUrl, setPastedUrl] = useState('');
  const [composited, setComposited] = useState<string[]>([]);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const urls: string[] = [];
    let loaded = 0;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        urls.push(ev.target?.result as string);
        loaded++;
        if (loaded === files.length) {
          setSourceImages((prev) => [...prev, ...urls].slice(0, 8));
          setComposited([]);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function addUrl() {
    const url = pastedUrl.trim();
    if (!url) return;
    setSourceImages((prev) => [...prev, url].slice(0, 8));
    setPastedUrl('');
    setComposited([]);
  }

  function removeImage(i: number) {
    setSourceImages((prev) => prev.filter((_, idx) => idx !== i));
    setComposited([]);
  }

  async function applyWrapper() {
    if (sourceImages.length === 0) return;
    setRendering(true);
    setComposited([]);
    setError(null);

    try {
      let results: string[] = [];

      if (wrapperStyle === 'phone') {
        results = await Promise.all(
          sourceImages.map((url, i) => renderPhoneFrame(url))
        );
      } else if (wrapperStyle === 'story') {
        results = await Promise.all(
          sourceImages.map((url, i) => renderStoryStyle(url, i))
        );
      } else if (wrapperStyle === 'photo_dump') {
        const dump = await renderPhotoDump(sourceImages);
        results = [dump];
      }

      setComposited(results);
      setActiveSlide(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Render failed');
    } finally {
      setRendering(false);
    }
  }

  function downloadSlide(dataUrl: string, i: number) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `ugc-${wrapperStyle}-${i + 1}.jpg`;
    a.click();
  }

  const selected = WRAPPER_STYLES.find((w) => w.id === wrapperStyle)!;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/streams" className="hover:text-gray-600 transition-colors">
            Streams
          </Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">UGC Wrappers</span>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left panel */}
          <div className="col-span-5 space-y-5">
            {/* Step 1: Style */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                  1
                </span>
                Choose Wrapper Style
              </h2>
              <div className="space-y-2">
                {WRAPPER_STYLES.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setWrapperStyle(ws.id);
                      setComposited([]);
                    }}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-start gap-3 ${
                      wrapperStyle === ws.id
                        ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${ws.preview} mt-0.5`} />
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-gray-900">{ws.label}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ws.badgeColor}`}>
                          {ws.badge}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{ws.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {wrapperStyle === 'photo_dump' && (
                <p className="mt-3 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                  Photo Dump uses the first 4 images to create a single composite layout.
                </p>
              )}
            </div>

            {/* Step 2: Images */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                  2
                </span>
                Add Source Images
              </h2>

              {/* Upload area */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-24 rounded-xl border-2 border-dashed border-gray-200 hover:border-red-400 hover:bg-red-50 transition-all flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-red-500"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12M8 8l4-4 4 4" />
                </svg>
                <span className="text-sm font-medium">Upload images</span>
                <span className="text-xs">JPG, PNG, WebP</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />

              {/* URL input */}
              <div className="flex gap-2 mt-3">
                <input
                  type="url"
                  value={pastedUrl}
                  onChange={(e) => setPastedUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addUrl()}
                  placeholder="Paste image URL..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                />
                <button
                  onClick={addUrl}
                  disabled={!pastedUrl.trim()}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>

              {/* Image thumbnails */}
              {sourceImages.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {sourceImages.map((url, i) => (
                    <div key={i} className="relative group aspect-[3/4]">
                      <img
                        src={url}
                        alt={`Source ${i + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '';
                          (e.target as HTMLImageElement).style.background = '#fee2e2';
                        }}
                      />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {sourceImages.length > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  {sourceImages.length} image{sourceImages.length !== 1 ? 's' : ''} loaded
                  {wrapperStyle === 'phone' || wrapperStyle === 'story'
                    ? ` — ${sourceImages.length} wrapped output${sourceImages.length !== 1 ? 's' : ''}`
                    : ' — 1 composite output'}
                </p>
              )}
            </div>

            {/* Apply button */}
            <button
              onClick={applyWrapper}
              disabled={sourceImages.length === 0 || rendering}
              className="w-full px-4 py-3.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {rendering ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  Rendering...
                </span>
              ) : (
                `Apply "${selected.label}" Wrapper`
              )}
            </button>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* Right panel: Preview + Download */}
          <div className="col-span-7 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                  3
                </span>
                Preview
              </h2>

              {rendering && (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                  <div className="animate-spin w-8 h-8 border-2 border-gray-200 border-t-red-500 rounded-full" />
                  <p className="text-sm text-gray-400">Compositing wrapper...</p>
                </div>
              )}

              {!rendering && composited.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <p className="text-2xl mb-2">🖼</p>
                  <p className="text-sm text-gray-400">Add images and apply a wrapper to preview</p>
                </div>
              )}

              {!rendering && composited.length > 0 && (
                <>
                  {/* Slide navigator */}
                  {composited.length > 1 && (
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <button
                        onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
                        disabled={activeSlide === 0}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center text-sm transition-colors"
                      >
                        ←
                      </button>
                      <span className="text-sm text-gray-500 font-medium">
                        {activeSlide + 1} / {composited.length}
                      </span>
                      <button
                        onClick={() => setActiveSlide(Math.min(composited.length - 1, activeSlide + 1))}
                        disabled={activeSlide === composited.length - 1}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center text-sm transition-colors"
                      >
                        →
                      </button>
                    </div>
                  )}

                  {/* Preview image */}
                  <div className="flex justify-center">
                    <img
                      src={composited[activeSlide]}
                      alt={`Wrapped slide ${activeSlide + 1}`}
                      className="max-h-[60vh] rounded-2xl shadow-lg border border-gray-100"
                      style={{ aspectRatio: '9/16', objectFit: 'contain' }}
                    />
                  </div>

                  {/* Thumbnail strip */}
                  {composited.length > 1 && (
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                      {composited.map((url, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveSlide(i)}
                          className={`flex-shrink-0 w-16 rounded-lg overflow-hidden border-2 transition-all aspect-[3/4] ${
                            i === activeSlide ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img src={url} alt={`Slide ${i + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Downloads */}
            {composited.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Download</h3>
                <div className="flex flex-wrap gap-2">
                  {composited.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => downloadSlide(url, i)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors"
                    >
                      {wrapperStyle === 'photo_dump' ? 'Photo Dump' : `Slide ${i + 1}`}
                    </button>
                  ))}
                  {composited.length > 1 && (
                    <button
                      onClick={() => composited.forEach((url, i) => downloadSlide(url, i))}
                      className="px-3 py-1.5 bg-gray-900 hover:bg-gray-700 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      Download All
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {composited.length} wrapped image{composited.length !== 1 ? 's' : ''} at 1080x1440px.
                  Rendered client-side — nothing uploaded.
                </p>
              </div>
            )}

            {/* Info note */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-700 mb-1">How UGC Wrappers work</p>
              <p className="text-xs text-blue-600 leading-relaxed">
                All compositing happens in your browser using the Canvas API — your images are never
                uploaded to our servers. You can use any image: generated carousels from the Recipe
                or Streams pages, phone screenshots, or your own photos.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
