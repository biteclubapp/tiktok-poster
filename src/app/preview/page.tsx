'use client';

import { useState, useEffect } from 'react';
import { TemplateStyle } from '@/types';

const TEMPLATES: { id: TemplateStyle; name: string; desc: string; accent: string }[] = [
  { id: 'A', name: 'Clean & Modern', desc: 'Light gray bg, red top accent bar, DM Serif Display headings', accent: 'border-t-4 border-t-red-500 bg-gray-50' },
  { id: 'B', name: 'Dark & Premium', desc: 'Dark bg, red left-edge bar, Cormorant Garamond headings', accent: 'border-l-4 border-l-red-500 bg-gray-900' },
  { id: 'C', name: 'Warm & Friendly', desc: 'Warm cream bg, rounded pill elements, 2-column ingredients', accent: 'border-b-4 border-b-red-500 bg-orange-50' },
];

const SLIDE_LABELS = ['Hero Photo', 'Ingredients', 'Instructions', 'CTA'];

interface TemplateSlides {
  slides: string[];
  loading: boolean;
  error: string | null;
}

export default function PreviewPage() {
  const [allSlides, setAllSlides] = useState<Record<TemplateStyle, TemplateSlides>>({
    A: { slides: [], loading: false, error: null },
    B: { slides: [], loading: false, error: null },
    C: { slides: [], loading: false, error: null },
  });
  const [zoomedImage, setZoomedImage] = useState<{ url: string; label: string } | null>(null);
  const [generating, setGenerating] = useState(false);

  async function generateTemplate(template: TemplateStyle) {
    setAllSlides((prev) => ({
      ...prev,
      [template]: { slides: [], loading: true, error: null },
    }));

    try {
      const res = await fetch(`/api/carousel/preview?template=${template}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Generation failed');
      }
      const data = await res.json();
      setAllSlides((prev) => ({
        ...prev,
        [template]: { slides: data.slides, loading: false, error: null },
      }));
    } catch (e) {
      setAllSlides((prev) => ({
        ...prev,
        [template]: { slides: [], loading: false, error: e instanceof Error ? e.message : 'Failed' },
      }));
    }
  }

  async function generateAll() {
    setGenerating(true);
    await Promise.all([generateTemplate('A'), generateTemplate('B'), generateTemplate('C')]);
    setGenerating(false);
  }

  // Auto-generate on mount
  useEffect(() => {
    generateAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">BC</span>
              </div>
              <h1 className="text-xl font-bold">Template Preview Dashboard</h1>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Compare all 3 carousel styles side-by-side with sample recipe data
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={generateAll}
              disabled={generating}
              className="px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {generating ? 'Regenerating...' : 'Regenerate All'}
            </button>
            <a
              href="/"
              className="px-5 py-2.5 bg-white/10 text-white rounded-xl text-sm font-semibold hover:bg-white/20 transition-colors"
            >
              Back to App
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Template rows */}
        <div className="space-y-10">
          {TEMPLATES.map((tmpl) => {
            const state = allSlides[tmpl.id];
            return (
              <div key={tmpl.id} className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                {/* Template header */}
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg ${tmpl.accent}`} />
                    <div>
                      <h2 className="text-lg font-bold flex items-center gap-2">
                        Style {tmpl.id}: {tmpl.name}
                      </h2>
                      <p className="text-sm text-gray-400">{tmpl.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => generateTemplate(tmpl.id)}
                    disabled={state.loading}
                    className="px-4 py-2 bg-white/10 rounded-lg text-sm font-medium hover:bg-white/20 disabled:opacity-50 transition-colors"
                  >
                    {state.loading ? 'Generating...' : 'Regenerate'}
                  </button>
                </div>

                {/* Slides */}
                <div className="p-6">
                  {state.loading && (
                    <div className="flex items-center justify-center h-48">
                      <div className="text-center">
                        <div className="animate-spin w-8 h-8 border-2 border-gray-600 border-t-red-500 rounded-full mx-auto" />
                        <p className="text-sm text-gray-500 mt-3">Rendering 4 slides at 1080x1920...</p>
                      </div>
                    </div>
                  )}

                  {state.error && (
                    <div className="flex items-center justify-center h-48">
                      <p className="text-red-400 text-sm">{state.error}</p>
                    </div>
                  )}

                  {!state.loading && !state.error && state.slides.length > 0 && (
                    <div className="grid grid-cols-4 gap-4">
                      {state.slides.map((url, i) => (
                        <button
                          key={i}
                          onClick={() => setZoomedImage({ url, label: `Style ${tmpl.id} — ${SLIDE_LABELS[i]}` })}
                          className="group relative rounded-xl overflow-hidden border border-white/10 hover:border-red-500/60 transition-all hover:scale-[1.02] aspect-[9/16]"
                        >
                          <img
                            src={url}
                            alt={`Style ${tmpl.id} - ${SLIDE_LABELS[i]}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3">
                            <span className="text-white text-xs font-semibold">{SLIDE_LABELS[i]}</span>
                            <span className="text-white/50 text-xs block">Slide {i + 1}/4</span>
                          </div>
                          <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/5 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 bg-black/60 rounded-full px-3 py-1.5 text-xs font-medium transition-opacity">
                              Click to zoom
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison notes */}
        <div className="mt-10 bg-white/5 rounded-2xl border border-white/10 p-6">
          <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-4">Design Notes</h3>
          <div className="grid grid-cols-3 gap-6 text-sm text-gray-400">
            <div>
              <p className="font-semibold text-white mb-1">Style A</p>
              <p>Closest to current app aesthetic. Clean white cards with red top accent bar. Works best for mainstream food content.</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-1">Style B</p>
              <p>Stands out in light social feeds. Dark mode with red left-edge signature. Premium feel for elevated recipes.</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-1">Style C</p>
              <p>Best match for the 20-30 female demographic. Warm and approachable with rounded elements and 2-column ingredients.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Zoom modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={zoomedImage.url}
              alt={zoomedImage.label}
              className="max-h-[90vh] rounded-2xl shadow-2xl"
            />
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setZoomedImage(null)}
                className="bg-white/90 text-black rounded-full w-10 h-10 flex items-center justify-center text-lg hover:bg-white transition-colors"
              >
                x
              </button>
            </div>
            <p className="text-center text-white/60 text-sm mt-3 font-medium">{zoomedImage.label}</p>
          </div>
        </div>
      )}
    </div>
  );
}
