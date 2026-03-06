'use client';

import { useState, useEffect, useRef } from 'react';
import { SUBREDDIT_PRESETS } from '@/lib/subreddits';
import { DishData } from '@/types';

interface PostControlsProps {
  slides: string[];
  recipeName: string;
  dishData?: DishData;
  onPublish: (caption: string) => void;
  onSchedule: (caption: string) => void;
  onPublishReddit: (title: string, subreddit: string) => void;
  onPublishInstagram?: (caption: string) => void;
  tiktokConnected: boolean;
  redditConnected: boolean;
  instagramConnected?: boolean;
  publishing: boolean;
  publishingReddit: boolean;
  publishingInstagram?: boolean;
}

export default function PostControls({
  slides,
  recipeName,
  dishData,
  onPublish,
  onSchedule,
  onPublishReddit,
  onPublishInstagram,
  tiktokConnected,
  redditConnected,
  instagramConnected,
  publishing,
  publishingReddit,
  publishingInstagram,
}: PostControlsProps) {
  const [caption, setCaption] = useState(
    `${recipeName} \n\nFull recipe in the carousel! Save for later \n\n#cooking #recipe #food #homecooking #biteclub`
  );
  const [subreddit, setSubreddit] = useState('');
  const [redditTitle, setRedditTitle] = useState(recipeName);
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [generatingTitle, setGeneratingTitle] = useState(false);
  const [suggestedSubreddits, setSuggestedSubreddits] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const lastRecipeRef = useRef<string>('');

  // Fetch subreddit recommendations when dishData changes
  useEffect(() => {
    if (!dishData?.recipeName || dishData.recipeName === lastRecipeRef.current) return;
    lastRecipeRef.current = dishData.recipeName;

    setLoadingSuggestions(true);
    fetch('/api/captions/subreddits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dishData }),
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setSuggestedSubreddits(data.subreddits || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSuggestions(false));
  }, [dishData]);

  async function handleGenerateCaption() {
    if (!dishData) return;
    setGeneratingCaption(true);
    try {
      const res = await fetch('/api/captions/tiktok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dishData }),
      });
      if (res.ok) {
        const data = await res.json();
        const hashtags = (data.hashtags || []).join(' ');
        setCaption(`${data.caption}\n\n${hashtags}`);
      }
    } catch {}
    setGeneratingCaption(false);
  }

  async function handleGenerateTitle() {
    if (!dishData) return;
    setGeneratingTitle(true);
    try {
      const res = await fetch('/api/captions/reddit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dishData }),
      });
      if (res.ok) {
        const data = await res.json();
        setRedditTitle(data.title || recipeName);
      }
    } catch {}
    setGeneratingTitle(false);
  }

  async function downloadAll() {
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
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">Caption</label>
            {dishData && (
              <button
                onClick={handleGenerateCaption}
                disabled={generatingCaption}
                className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
              >
                {generatingCaption ? 'Generating...' : 'Generate Caption'}
              </button>
            )}
          </div>
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

        {/* AI Subreddit Suggestions */}
        {(suggestedSubreddits.length > 0 || loadingSuggestions) && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">AI Suggestions</label>
            <div className="flex flex-wrap gap-2">
              {loadingSuggestions ? (
                <span className="text-xs text-gray-400">Finding subreddits...</span>
              ) : (
                suggestedSubreddits.map((sr) => (
                  <button
                    key={sr}
                    onClick={() => setSubreddit(sr)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      subreddit === sr
                        ? 'bg-orange-500 text-white'
                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    }`}
                  >
                    r/{sr}
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subreddit</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">r/</span>
              <select
                value={SUBREDDIT_PRESETS.includes(subreddit) ? subreddit : '__custom__'}
                onChange={(e) => {
                  if (e.target.value !== '__custom__') setSubreddit(e.target.value);
                }}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-white"
              >
                <option value="__custom__">Custom...</option>
                {SUBREDDIT_PRESETS.map((sr) => (
                  <option key={sr} value={sr}>{sr}</option>
                ))}
              </select>
            </div>
            {!SUBREDDIT_PRESETS.includes(subreddit) && (
              <input
                type="text"
                value={subreddit}
                onChange={(e) => setSubreddit(e.target.value)}
                className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                placeholder="Enter subreddit name..."
              />
            )}
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Post Title</label>
              {dishData && (
                <button
                  onClick={handleGenerateTitle}
                  disabled={generatingTitle}
                  className="text-xs text-orange-500 hover:text-orange-700 font-medium disabled:opacity-50"
                >
                  {generatingTitle ? 'Generating...' : 'Generate Title'}
                </button>
              )}
            </div>
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

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Instagram Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Instagram</h3>
        <p className="text-xs text-gray-400">Uses same caption as TikTok</p>

        <button
          onClick={() => onPublishInstagram?.(caption)}
          disabled={!instagramConnected || slides.length === 0 || publishingInstagram}
          className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          {publishingInstagram ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              Publishing to Instagram...
            </span>
          ) : instagramConnected ? (
            'Post to Instagram'
          ) : (
            'Connect Instagram First'
          )}
        </button>
      </div>
    </div>
  );
}
