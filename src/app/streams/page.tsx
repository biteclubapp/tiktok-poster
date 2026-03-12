'use client';

import Link from 'next/link';
import { useState } from 'react';

interface ContentStream {
  id: string;
  emoji: string;
  title: string;
  vibe: string;
  description: string;
  href: string | null;
  color: string;
  bgGradient: string;
  status: 'live' | 'new' | 'soon';
  platforms: ('tiktok' | 'reddit' | 'instagram')[];
  examples: string[];
}

const STREAMS: ContentStream[] = [
  {
    id: 'recipe',
    emoji: '🍳',
    title: 'Recipe Carousels',
    vibe: 'The OG',
    description: 'Turn any BiteClub dish into a swipeable recipe breakdown. Pick a template, hit publish.',
    href: '/',
    color: 'text-red-600',
    bgGradient: 'from-red-50 to-orange-50',
    status: 'live',
    platforms: ['tiktok', 'reddit', 'instagram'],
    examples: ['Chicken Couscous breakdown', 'Thai Curry step-by-step', 'Pasta carbonara how-to'],
  },
  {
    id: 'info',
    emoji: '💡',
    title: 'Food Knowledge',
    vibe: 'Big brain energy',
    description: 'Cooking tips, food facts, nutrition breakdowns, ingredient hacks — no recipe needed.',
    href: '/streams/info',
    color: 'text-blue-600',
    bgGradient: 'from-blue-50 to-cyan-50',
    status: 'new',
    platforms: ['tiktok', 'instagram'],
    examples: ['5 ways to use tahini', 'Why you salt pasta water', 'Protein in everyday foods'],
  },
  {
    id: 'ugc',
    emoji: '📱',
    title: 'UGC Wrappers',
    vibe: 'Casual & authentic',
    description: 'Wrap your carousels in phone frames, story overlays, or photo dump layouts. Feels real.',
    href: '/streams/ugc',
    color: 'text-purple-600',
    bgGradient: 'from-purple-50 to-pink-50',
    status: 'new',
    platforms: ['tiktok', 'instagram'],
    examples: ['iPhone screenshot frame', 'Story-style with stickers', 'Messy photo dump grid'],
  },
  {
    id: 'day-in-life',
    emoji: '🎬',
    title: 'Day in the Life',
    vibe: 'Behind the scenes',
    description: 'What it looks like building a food app. Dev life, cooking tests, real moments. People follow people.',
    href: null,
    color: 'text-amber-600',
    bgGradient: 'from-amber-50 to-yellow-50',
    status: 'soon',
    platforms: ['tiktok', 'instagram'],
    examples: ['Morning routine + cooking', 'Office taste testing', 'Late night debugging + ramen'],
  },
  {
    id: 'challenges',
    emoji: '🔥',
    title: 'Food Challenges',
    vibe: 'Engagement bait (the good kind)',
    description: 'Rate my fridge, guess the dish, cook with 3 ingredients — interactive content that gets comments.',
    href: null,
    color: 'text-orange-600',
    bgGradient: 'from-orange-50 to-red-50',
    status: 'soon',
    platforms: ['tiktok'],
    examples: ['Rate my fridge', 'Guess the dish from ingredients', '$10 vs $100 meal'],
  },
  {
    id: 'spotlights',
    emoji: '✨',
    title: 'User Spotlights',
    vibe: 'Community flex',
    description: 'Feature what BiteClub users are actually cooking. Social proof + community love = follows.',
    href: null,
    color: 'text-pink-600',
    bgGradient: 'from-pink-50 to-rose-50',
    status: 'soon',
    platforms: ['tiktok', 'reddit', 'instagram'],
    examples: ['This week\'s top cook', 'User meal of the day', 'Before/after cooking glow-up'],
  },
  {
    id: 'meal-prep',
    emoji: '🥡',
    title: 'Meal Prep Guides',
    vibe: 'Sunday energy',
    description: 'Weekly meal plans, batch cooking breakdowns, budget-friendly prep sessions.',
    href: null,
    color: 'text-green-600',
    bgGradient: 'from-green-50 to-emerald-50',
    status: 'soon',
    platforms: ['tiktok', 'reddit', 'instagram'],
    examples: ['$50 weekly meal prep', '5 lunches in 1 hour', 'Freezer meal starter pack'],
  },
  {
    id: 'polls',
    emoji: '🗳️',
    title: 'Polls & Quizzes',
    vibe: 'Hot takes only',
    description: 'Food opinions that start wars in the comments. Pineapple on pizza? Ketchup on eggs? Let them fight.',
    href: null,
    color: 'text-indigo-600',
    bgGradient: 'from-indigo-50 to-violet-50',
    status: 'soon',
    platforms: ['tiktok', 'instagram'],
    examples: ['Is this a sandwich?', 'Rank these comfort foods', 'Unpopular food opinion'],
  },
  {
    id: 'seasonal',
    emoji: '🍂',
    title: 'Seasonal & Trending',
    vibe: 'Right place, right time',
    description: 'Seasonal ingredients, holiday recipes, trending food moments. Ride the wave when it hits.',
    href: null,
    color: 'text-teal-600',
    bgGradient: 'from-teal-50 to-cyan-50',
    status: 'soon',
    platforms: ['tiktok', 'reddit', 'instagram'],
    examples: ['Spring produce guide', 'Halloween snack ideas', 'What\'s trending this week'],
  },
  {
    id: 'versus',
    emoji: '⚔️',
    title: 'Food Battles',
    vibe: 'Pick a side',
    description: 'Head-to-head comparisons that get people talking. Two dishes, two takes, one winner (voted by comments).',
    href: null,
    color: 'text-rose-600',
    bgGradient: 'from-rose-50 to-red-50',
    status: 'soon',
    platforms: ['tiktok', 'instagram'],
    examples: ['Tacos vs Burritos', 'Homemade vs Store-bought', 'Gordon vs Grandma'],
  },
  {
    id: 'stories',
    emoji: '📖',
    title: 'Food Stories',
    vibe: 'The feels',
    description: 'The story behind the dish. Cultural history, family recipes, why this meal matters. Emotional hooks that stick.',
    href: null,
    color: 'text-stone-600',
    bgGradient: 'from-stone-50 to-neutral-100',
    status: 'soon',
    platforms: ['tiktok', 'reddit', 'instagram'],
    examples: ['My grandma\'s secret recipe', 'The history of ramen', 'Why I started cooking'],
  },
];

const STATUS_BADGE = {
  live: { label: 'Live', class: 'bg-green-500 text-white' },
  new: { label: 'New', class: 'bg-blue-500 text-white' },
  soon: { label: 'Coming Soon', class: 'bg-gray-200 text-gray-600' },
};

const PLATFORM_ICON: Record<string, string> = {
  tiktok: 'TT',
  reddit: 'Rd',
  instagram: 'IG',
};

const FILTERS = ['All', 'Live', 'New', 'Coming Soon'] as const;

export default function StreamsPage() {
  const [filter, setFilter] = useState<string>('All');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = STREAMS.filter((s) => {
    if (filter === 'All') return true;
    if (filter === 'Live') return s.status === 'live';
    if (filter === 'New') return s.status === 'new';
    return s.status === 'soon';
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
            Content Streams
          </h1>
          <p className="text-gray-500 text-base max-w-xl">
            Every type of content BiteClub can make. Pick a stream and start cooking up posts.
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2 mb-6">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {f}
              <span className="ml-1.5 text-xs opacity-60">
                {f === 'All'
                  ? STREAMS.length
                  : STREAMS.filter((s) =>
                      f === 'Live' ? s.status === 'live' : f === 'New' ? s.status === 'new' : s.status === 'soon'
                    ).length}
              </span>
            </button>
          ))}
        </div>

        {/* Scrollable card strip */}
        <div className="overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
          <div className="flex gap-4" style={{ minWidth: 'min-content' }}>
            {filtered.map((stream) => {
              const badge = STATUS_BADGE[stream.status];
              const isHovered = hoveredId === stream.id;
              const isClickable = stream.href !== null;

              const card = (
                <div
                  key={stream.id}
                  onMouseEnter={() => setHoveredId(stream.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`
                    relative flex-shrink-0 w-72 rounded-2xl border-2 overflow-hidden transition-all duration-200
                    ${isHovered ? 'border-gray-300 shadow-lg -translate-y-1' : 'border-gray-200 shadow-sm'}
                    ${!isClickable ? 'opacity-80' : ''}
                  `}
                >
                  {/* Color header */}
                  <div className={`bg-gradient-to-br ${stream.bgGradient} px-5 pt-5 pb-4`}>
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-4xl">{stream.emoji}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${badge.class}`}>
                        {badge.label}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 leading-tight">{stream.title}</h2>
                    <p className={`text-xs font-semibold mt-0.5 ${stream.color} uppercase tracking-wide`}>
                      {stream.vibe}
                    </p>
                  </div>

                  {/* Body */}
                  <div className="bg-white px-5 py-4 flex flex-col flex-1">
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      {stream.description}
                    </p>

                    {/* Example ideas */}
                    <div className="space-y-1.5 mb-4">
                      {stream.examples.map((ex, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                          <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
                          {ex}
                        </div>
                      ))}
                    </div>

                    {/* Platforms */}
                    <div className="flex items-center gap-1.5 mt-auto">
                      {stream.platforms.map((p) => (
                        <span
                          key={p}
                          className="px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-bold text-gray-500 uppercase"
                        >
                          {PLATFORM_ICON[p]}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom action bar */}
                  <div className="bg-white border-t border-gray-100 px-5 py-3">
                    {isClickable ? (
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 group-hover:text-red-600">
                        Open Stream
                        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 8h10M9 4l4 4-4 4" />
                        </svg>
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400 font-medium">Coming soon</span>
                    )}
                  </div>
                </div>
              );

              return isClickable ? (
                <Link key={stream.id} href={stream.href!} className="group flex-shrink-0">
                  {card}
                </Link>
              ) : (
                <div key={stream.id} className="flex-shrink-0">{card}</div>
              );
            })}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="flex items-center justify-center gap-2 mt-2 text-xs text-gray-400">
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 8h12M10 4l4 4-4 4" />
          </svg>
          Scroll for more streams
        </div>

        {/* Stats bar */}
        <div className="mt-10 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
            <div className="text-3xl font-bold text-gray-900">{STREAMS.filter((s) => s.status === 'live').length}</div>
            <div className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wide">Live Streams</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
            <div className="text-3xl font-bold text-gray-900">{STREAMS.filter((s) => s.status === 'new').length}</div>
            <div className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wide">Just Added</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
            <div className="text-3xl font-bold text-gray-900">{STREAMS.filter((s) => s.status === 'soon').length}</div>
            <div className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wide">In the Kitchen</div>
          </div>
        </div>

        {/* Bottom note */}
        <p className="text-xs text-gray-400 text-center mt-8">
          All streams render at 1080×1440 — optimized for TikTok, Instagram, and Reddit.
        </p>
      </main>
    </div>
  );
}
