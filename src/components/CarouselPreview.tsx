'use client';

import { useState } from 'react';

interface CarouselPreviewProps {
  slides: string[];
  loading: boolean;
}

// Infer slide label from its position in the carousel
// The render pipeline always produces: hero, [ingredients], [instructions], [cta (non-reddit)]
// Since we don't know exactly which slides are present, we label them positionally:
// slide 0 = Hero, last slide if count >=4 = CTA, middle slides = Ingredients / Instructions
function getSlideLabel(index: number, total: number): string {
  if (index === 0) return 'Hero';
  if (total >= 4 && index === total - 1) return 'CTA';
  if (total === 3) {
    if (index === 1) return 'Ingredients';
    if (index === 2) return 'Instructions';
  }
  if (total === 4) {
    if (index === 1) return 'Ingredients';
    if (index === 2) return 'Instructions';
  }
  // 2-slide or unusual: just number them
  return `Slide ${index + 1}`;
}

export default function CarouselPreview({ slides, loading }: CarouselPreviewProps) {
  const [zoomedSlide, setZoomedSlide] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-3 border-gray-300 border-t-red-500 rounded-full mx-auto" />
          <p className="text-sm text-gray-400 mt-3">Generating carousel...</p>
        </div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <div className="text-center">
          <p className="text-2xl mb-2">🖼️</p>
          <p className="text-sm text-gray-400">Select a dish and generate a carousel</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Slides grid */}
      <div className="grid grid-cols-4 gap-3">
        {slides.map((url, i) => (
          <button
            key={i}
            onClick={() => setZoomedSlide(i)}
            className="group relative rounded-xl overflow-hidden border border-gray-200 hover:border-red-500 transition-colors aspect-[3/4]"
          >
            <img
              src={url}
              alt={`Slide ${i + 1}: ${getSlideLabel(i, slides.length)}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error(`Failed to load slide ${i}:`, url);
                (e.target as HTMLImageElement).style.background = '#fee';
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
              <span className="text-white text-xs font-medium">{getSlideLabel(i, slides.length)}</span>
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 text-white text-lg transition-opacity">
                🔍
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Zoom modal */}
      {zoomedSlide !== null && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8"
          onClick={() => setZoomedSlide(null)}
        >
          <div className="relative max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={slides[zoomedSlide]}
              alt={`Slide ${zoomedSlide + 1}`}
              className="max-h-[90vh] rounded-2xl shadow-2xl"
            />
            {/* Close button - top left to avoid cook tag */}
            <button
              onClick={() => setZoomedSlide(null)}
              className="absolute top-4 left-4 bg-white/90 rounded-full w-10 h-10 flex items-center justify-center text-lg hover:bg-white transition-colors"
            >
              ✕
            </button>
            {/* Nav + label below image */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <button
                onClick={() => setZoomedSlide(Math.max(0, zoomedSlide - 1))}
                disabled={zoomedSlide === 0}
                className="bg-white/90 rounded-full w-10 h-10 flex items-center justify-center text-lg hover:bg-white transition-colors disabled:opacity-30"
              >
                ←
              </button>
              <p className="text-white/70 text-sm">
                {getSlideLabel(zoomedSlide, slides.length)} ({zoomedSlide + 1}/{slides.length})
              </p>
              <button
                onClick={() => setZoomedSlide(Math.min(slides.length - 1, zoomedSlide + 1))}
                disabled={zoomedSlide === slides.length - 1}
                className="bg-white/90 rounded-full w-10 h-10 flex items-center justify-center text-lg hover:bg-white transition-colors disabled:opacity-30"
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
