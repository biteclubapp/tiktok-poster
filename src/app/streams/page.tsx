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
    href: '/streams/day-in-life',
    color: 'text-amber-600',
    bgGradient: 'from-amber-50 to-yellow-50',
    status: 'new',
    platforms: ['tiktok', 'instagram'],
    examples: ['Morning routine + cooking', 'Office taste testing', 'Late night debugging + ramen'],
  },
  {
    id: 'challenges',
    emoji: '🔥',
    title: 'Food Challenges',
    vibe: 'Engagement bait (the good kind)',
    description: 'Rate my fridge, guess the dish, cook with 3 ingredients — interactive content that gets comments.',
    href: '/streams/challenges',
    color: 'text-orange-600',
    bgGradient: 'from-orange-50 to-red-50',
    status: 'new',
    platforms: ['tiktok'],
    examples: ['Rate my fridge', 'Guess the dish from ingredients', '$10 vs $100 meal'],
  },
  {
    id: 'spotlights',
    emoji: '✨',
    title: 'User Spotlights',
    vibe: 'Community flex',
    description: 'Feature what BiteClub users are actually cooking. Social proof + community love = follows.',
    href: '/streams/spotlights',
    color: 'text-pink-600',
    bgGradient: 'from-pink-50 to-rose-50',
    status: 'new',
    platforms: ['tiktok', 'reddit', 'instagram'],
    examples: ['This week\'s top cook', 'User meal of the day', 'Before/after cooking glow-up'],
  },
  {
    id: 'meal-prep',
    emoji: '🥡',
    title: 'Meal Prep Guides',
    vibe: 'Sunday energy',
    description: 'Weekly meal plans, batch cooking breakdowns, budget-friendly prep sessions.',
    href: '/streams/meal-prep',
    color: 'text-green-600',
    bgGradient: 'from-green-50 to-emerald-50',
    status: 'new',
    platforms: ['tiktok', 'reddit', 'instagram'],
    examples: ['$50 weekly meal prep', '5 lunches in 1 hour', 'Freezer meal starter pack'],
  },
  {
    id: 'polls',
    emoji: '🗳️',
    title: 'Polls & Quizzes',
    vibe: 'Hot takes only',
    description: 'Food opinions that start wars in the comments. Pineapple on pizza? Ketchup on eggs? Let them fight.',
    href: '/streams/polls',
    color: 'text-indigo-600',
    bgGradient: 'from-indigo-50 to-violet-50',
    status: 'new',
    platforms: ['tiktok', 'instagram'],
    examples: ['Is this a sandwich?', 'Rank these comfort foods', 'Unpopular food opinion'],
  },
  {
    id: 'seasonal',
    emoji: '🍂',
    title: 'Seasonal & Trending',
    vibe: 'Right place, right time',
    description: 'Seasonal ingredients, holiday recipes, trending food moments. Ride the wave when it hits.',
    href: '/streams/seasonal',
    color: 'text-teal-600',
    bgGradient: 'from-teal-50 to-cyan-50',
    status: 'new',
    platforms: ['tiktok', 'reddit', 'instagram'],
    examples: ['Spring produce guide', 'Halloween snack ideas', 'What\'s trending this week'],
  },
  {
    id: 'versus',
    emoji: '⚔️',
    title: 'Food Battles',
    vibe: 'Pick a side',
    description: 'Head-to-head comparisons that get people talking. Two dishes, two takes, one winner (voted by comments).',
    href: '/streams/versus',
    color: 'text-rose-600',
    bgGradient: 'from-rose-50 to-red-50',
    status: 'new',
    platforms: ['tiktok', 'instagram'],
    examples: ['Tacos vs Burritos', 'Homemade vs Store-bought', 'Gordon vs Grandma'],
  },
  {
    id: 'stories',
    emoji: '📖',
    title: 'Food Stories',
    vibe: 'The feels',
    description: 'The story behind the dish. Cultural history, family recipes, why this meal matters. Emotional hooks that stick.',
    href: '/streams/stories',
    color: 'text-stone-600',
    bgGradient: 'from-stone-50 to-neutral-100',
    status: 'new',
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

export default function StreamsPage() {
  const [filter, setFilter] = useState<string>('All');

  const liveStreams = STREAMS.filter(s => s.status === 'live' || s.status === 'new');
  const comingSoon = STREAMS.filter(s => s.status === 'soon');

  const filtered = filter === 'All' ? STREAMS
    : filter === 'Live' ? STREAMS.filter(s => s.status === 'live')
    : filter === 'New' ? STREAMS.filter(s => s.status === 'new')
    : comingSoon;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Content Streams</h1>
          <p className="text-sm text-gray-500 mt-1">
            Every type of content BiteClub can make. Pick a stream and start creating.
          </p>
        </div>

        {/* Quick-launch: Active streams */}
        <div className="mb-10">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Ready to Use</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {liveStreams.map(stream => {
              const badge = STATUS_BADGE[stream.status];
              return (
                <Link
                  key={stream.id}
                  href={stream.href || '/'}
                  className="group relative bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-md transition-all"
                >
                  {/* Gradient accent top */}
                  <div className={`h-1.5 bg-gradient-to-r ${stream.bgGradient}`} />

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{stream.emoji}</span>
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 group-hover:text-gray-700">{stream.title}</h3>
                          <p className={`text-[11px] font-semibold ${stream.color} uppercase tracking-wide`}>{stream.vibe}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${badge.class}`}>
                        {badge.label}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed mb-3">{stream.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {stream.platforms.map(p => (
                          <span key={p} className="px-1.5 py-0.5 rounded bg-gray-100 text-[9px] font-bold text-gray-400 uppercase">
                            {PLATFORM_ICON[p]}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-gray-400 group-hover:text-red-500 transition-colors flex items-center gap-1">
                        Open
                        <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M3 8h10M9 4l4 4-4 4" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* All streams grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">All Streams</h2>
            <div className="flex items-center gap-1.5">
              {(['All', 'Live', 'New', 'Coming Soon'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    filter === f
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map(stream => {
              const badge = STATUS_BADGE[stream.status];
              const isClickable = stream.href !== null;

              const card = (
                <div className={`group bg-white rounded-xl border border-gray-200 p-4 transition-all h-full flex flex-col ${
                  isClickable ? 'hover:border-gray-300 hover:shadow-sm cursor-pointer' : 'opacity-70'
                }`}>
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <span className="text-2xl">{stream.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 truncate">{stream.title}</h3>
                      <p className={`text-[10px] font-semibold ${stream.color} uppercase tracking-wide`}>{stream.vibe}</p>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide flex-shrink-0 ${badge.class}`}>
                      {badge.label}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed mb-3 flex-1">{stream.description}</p>

                  {/* Examples */}
                  <div className="space-y-1 mb-3">
                    {stream.examples.map((ex, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
                        {ex}
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      {stream.platforms.map(p => (
                        <span key={p} className="px-1.5 py-0.5 rounded bg-gray-100 text-[9px] font-bold text-gray-400 uppercase">
                          {PLATFORM_ICON[p]}
                        </span>
                      ))}
                    </div>
                    {isClickable ? (
                      <span className="text-[11px] font-semibold text-gray-400 group-hover:text-red-500 transition-colors flex items-center gap-1">
                        Open
                        <svg viewBox="0 0 16 16" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M3 8h10M9 4l4 4-4 4" />
                        </svg>
                      </span>
                    ) : (
                      <span className="text-[11px] text-gray-300 font-medium">Soon</span>
                    )}
                  </div>
                </div>
              );

              return isClickable ? (
                <Link key={stream.id} href={stream.href!}>{card}</Link>
              ) : (
                <div key={stream.id}>{card}</div>
              );
            })}
          </div>
        </div>

        {/* Stats footer */}
        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-gray-400">
          <span><strong className="text-gray-600">{STREAMS.filter(s => s.status === 'live').length}</strong> live</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span><strong className="text-gray-600">{STREAMS.filter(s => s.status === 'new').length}</strong> new</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span><strong className="text-gray-600">{STREAMS.filter(s => s.status === 'soon').length}</strong> coming soon</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span>All 1080×1440</span>
        </div>
      </main>
    </div>
  );
}
