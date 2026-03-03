'use client';

import { useState, useEffect } from 'react';
import type { TrendingSound, TrendingHashtag } from '@/lib/db';

export default function TrendingPage() {
  const [sounds, setSounds] = useState<TrendingSound[]>([]);
  const [hashtags, setHashtags] = useState<TrendingHashtag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrending() {
      try {
        const res = await fetch('/api/trending');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setSounds(data.sounds || []);
        setHashtags(data.hashtags || []);
      } catch (err) {
        console.error('Failed to load trending data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTrending();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-5xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Trending on TikTok</h1>
          <p className="text-sm text-gray-500 mt-1">
            Trending sounds & cooking hashtags for carousel inspiration
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-red-500 rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {/* Trending Sounds */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-red-500 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
                <h2 className="text-sm font-bold text-gray-900">Trending Sounds</h2>
                <span className="text-xs text-gray-400 ml-auto">Updated hourly</span>
              </div>

              <div className="relative h-[520px] overflow-hidden">
                {sounds.length > 0 && <TickerColumn items={sounds.map((s, i) => ({
                  key: `sound-${s.id}`,
                  rank: i + 1,
                  primary: s.name,
                  secondary: s.artist || 'Original Sound',
                  badge: s.score > 0 ? String(s.score) : undefined,
                }))} speed={35} />}
              </div>
            </div>

            {/* Trending Hashtags */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-red-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">#</span>
                </span>
                <h2 className="text-sm font-bold text-gray-900">Cooking Hashtags</h2>
                <span className="text-xs text-gray-400 ml-auto">By views</span>
              </div>

              <div className="relative h-[520px] overflow-hidden">
                {hashtags.length > 0 && <TickerColumn items={hashtags.map((h, i) => ({
                  key: `tag-${h.id}`,
                  rank: i + 1,
                  primary: h.tag,
                  secondary: h.views ? `${h.views} views` : undefined,
                  badge: h.posts || undefined,
                }))} speed={40} />}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ——— Rolling Ticker Component ———

interface TickerItem {
  key: string;
  rank: number;
  primary: string;
  secondary?: string | null;
  badge?: string;
}

function TickerColumn({ items, speed = 30 }: { items: TickerItem[]; speed?: number }) {
  // Duplicate items for seamless loop
  const duration = items.length * speed;

  return (
    <div className="ticker-wrapper">
      <style>{`
        .ticker-wrapper {
          position: relative;
          height: 100%;
          overflow: hidden;
        }
        .ticker-wrapper::before,
        .ticker-wrapper::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          height: 40px;
          z-index: 2;
          pointer-events: none;
        }
        .ticker-wrapper::before {
          top: 0;
          background: linear-gradient(to bottom, white, transparent);
        }
        .ticker-wrapper::after {
          bottom: 0;
          background: linear-gradient(to top, white, transparent);
        }
        @keyframes ticker-scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .ticker-track {
          animation: ticker-scroll ${duration}s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="ticker-track">
        {[0, 1].map((batch) => (
          <div key={batch}>
            {items.map((item) => (
              <div
                key={`${batch}-${item.key}`}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors cursor-default group"
              >
                {/* Rank */}
                <span className="w-6 text-right text-xs font-bold text-gray-300 tabular-nums flex-shrink-0">
                  {item.rank}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-red-500 transition-colors">
                    {item.primary}
                  </p>
                  {item.secondary && (
                    <p className="text-xs text-gray-400 truncate">{item.secondary}</p>
                  )}
                </div>

                {/* Badge */}
                {item.badge && (
                  <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
