'use client';

import { useState } from 'react';

interface PostControlsProps {
  slides: string[];
  recipeName: string;
  onPublish: (caption: string) => void;
  onSchedule: (caption: string) => void;
  onPublishReddit: (title: string, subreddit: string) => void;
  tiktokConnected: boolean;
  redditConnected: boolean;
  publishing: boolean;
  publishingReddit: boolean;
}

export default function PostControls({
  slides,
  recipeName,
  onPublish,
  onSchedule,
  onPublishReddit,
  tiktokConnected,
  redditConnected,
  publishing,
  publishingReddit,
}: PostControlsProps) {
  const [caption, setCaption] = useState(
    `${recipeName} \n\nFull recipe in the carousel! Save for later \n\n#cooking #recipe #food #homecooking #biteclub`
  );
  const [subreddit, setSubreddit] = useState('');
  const [redditTitle, setRedditTitle] = useState(recipeName);

  async function downloadAll() {
    // Use a small delay between downloads to prevent browser blocking
    for (let i = 0; i < slides.length; i++) {
      if (i > 0) await new Promise(r => setTimeout(r, 500));
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
    <div className="space-y-6">
      {/* TikTok Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">TikTok</h3>
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

        {/* TikTok Actions */}
        <div className="flex gap-3">
          <button
            onClick={downloadAll}
            disabled={slides.length === 0}
            className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Download All JPEGs ({slides.length})
          </button>

          <button
            onClick={() => onSchedule(caption)}
            disabled={slides.length === 0}
            className="flex-1 px-4 py-3 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Schedule
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

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Reddit Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reddit</h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subreddit</label>
            <div className="flex items-center">
              <span className="text-sm text-gray-400 mr-1">r/</span>
              <input
                type="text"
                value={subreddit}
                onChange={(e) => setSubreddit(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                placeholder="cooking"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Post Title</label>
            <input
              type="text"
              value={redditTitle}
              onChange={(e) => setRedditTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
              placeholder="Recipe title..."
            />
          </div>
        </div>

        <button
          onClick={() => onPublishReddit(redditTitle, subreddit)}
          disabled={!redditConnected || slides.length === 0 || publishingReddit || !subreddit.trim()}
          className="w-full px-4 py-3 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {publishingReddit ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              Publishing to Reddit...
            </span>
          ) : redditConnected ? (
            'Post to Reddit'
          ) : (
            'Connect Reddit First'
          )}
        </button>
      </div>
    </div>
  );
}
