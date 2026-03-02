'use client';

import { useState } from 'react';

interface PostControlsProps {
  slides: string[];
  recipeName: string;
  onPublish: (caption: string) => void;
  tiktokConnected: boolean;
  publishing: boolean;
}

export default function PostControls({
  slides,
  recipeName,
  onPublish,
  tiktokConnected,
  publishing,
}: PostControlsProps) {
  const [caption, setCaption] = useState(
    `${recipeName} 🍽️\n\nFull recipe in the carousel! Save for later 📌\n\n#cooking #recipe #food #homecooking #biteclub`
  );

  async function downloadAll() {
    for (let i = 0; i < slides.length; i++) {
      const res = await fetch(slides[i]);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${recipeName.replace(/\s+/g, '-').toLowerCase()}-slide-${i + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  return (
    <div className="space-y-4">
      {/* Caption editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={5}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 resize-none"
          placeholder="Write a caption..."
        />
        <p className="text-xs text-gray-400 mt-1">{caption.length}/2200 characters</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={downloadAll}
          disabled={slides.length === 0}
          className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Download JPEGs
        </button>

        <button
          onClick={() => onPublish(caption)}
          disabled={!tiktokConnected || slides.length === 0 || publishing}
          className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {publishing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              Publishing...
            </span>
          ) : tiktokConnected ? (
            'Post to TikTok'
          ) : (
            'Connect TikTok First'
          )}
        </button>
      </div>
    </div>
  );
}
