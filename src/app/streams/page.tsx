'use client';

import Link from 'next/link';
import { useState } from 'react';

// ─── Content types ──────────────────────────────────────────────────────────

interface ContentType {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  href: string;
  presetCount: number;
  color: string;
  accent: string;
  platforms: string[];
}

const CONTENT_TYPES: ContentType[] = [
  { id: 'info', emoji: '💡', title: 'Food Knowledge', desc: 'Stats, tips, nutrition, debates — generates real carousel slides you can publish instantly.', href: '/streams/info', presetCount: 68, color: 'from-blue-500 to-cyan-500', accent: 'text-blue-600', platforms: ['TT', 'IG', 'Rd'] },
  { id: 'day-in-life', emoji: '🎬', title: 'Day in the Life', desc: 'Behind-the-scenes founder content. Coding, cooking, real moments.', href: '/streams/day-in-life', presetCount: 37, color: 'from-amber-400 to-yellow-500', accent: 'text-amber-600', platforms: ['TT', 'IG'] },
  { id: 'challenges', emoji: '🔥', title: 'Food Challenges', desc: 'Fridge raids, budget battles, speed runs, taste tests.', href: '/streams/challenges', presetCount: 36, color: 'from-orange-500 to-red-500', accent: 'text-orange-600', platforms: ['TT'] },
  { id: 'spotlights', emoji: '✨', title: 'User Spotlights', desc: 'Feature real BiteClub users, streak heroes, community recipes.', href: '/streams/spotlights', presetCount: 32, color: 'from-pink-500 to-rose-500', accent: 'text-pink-600', platforms: ['TT', 'IG', 'Rd'] },
  { id: 'meal-prep', emoji: '🥡', title: 'Meal Prep', desc: 'Budget preps, time savers, diet-specific, family-sized batches.', href: '/streams/meal-prep', presetCount: 35, color: 'from-green-500 to-emerald-500', accent: 'text-green-600', platforms: ['TT', 'IG', 'Rd'] },
  { id: 'polls', emoji: '🗳️', title: 'Polls & Quizzes', desc: 'Hot takes, this-or-that, would-you-rather, rate-it.', href: '/streams/polls', presetCount: 37, color: 'from-indigo-500 to-violet-500', accent: 'text-indigo-600', platforms: ['TT', 'IG'] },
  { id: 'seasonal', emoji: '🍂', title: 'Seasonal & Trending', desc: 'Spring, summer, fall, winter themes + viral food trends.', href: '/streams/seasonal', presetCount: 39, color: 'from-teal-500 to-cyan-500', accent: 'text-teal-600', platforms: ['TT', 'IG', 'Rd'] },
  { id: 'versus', emoji: '⚔️', title: 'Food Battles', desc: 'Head-to-head comparisons, technique wars, budget vs bougie.', href: '/streams/versus', presetCount: 38, color: 'from-rose-500 to-red-500', accent: 'text-rose-600', platforms: ['TT', 'IG'] },
  { id: 'stories', emoji: '📖', title: 'Food Stories', desc: 'Family recipes, cultural origins, personal journeys, nostalgia.', href: '/streams/stories', presetCount: 35, color: 'from-stone-500 to-neutral-600', accent: 'text-stone-600', platforms: ['TT', 'IG', 'Rd'] },
];

const TOTAL_PRESETS = CONTENT_TYPES.reduce((sum, t) => sum + t.presetCount, 0);

export default function ContentPage() {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? CONTENT_TYPES.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.desc.toLowerCase().includes(search.toLowerCase())
      )
    : CONTENT_TYPES;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-gray-900">Content</h1>
          <p className="text-sm text-gray-500 mt-1">
            {TOTAL_PRESETS} ready-to-use content ideas with TikTok captions across {CONTENT_TYPES.length} categories.
          </p>
        </div>

        {/* Hero: Carousel Generator */}
        <Link
          href="/streams/info"
          className="group block mb-10 relative overflow-hidden rounded-2xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5" />
          <div className="relative p-8 flex items-center gap-8">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-3xl shadow-lg">
              🍳
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-gray-900">Carousel Generator</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500 text-white uppercase tracking-wide">Live</span>
              </div>
              <p className="text-sm text-gray-500 mb-2">
                Pick a topic, choose a template, generate real carousel slides. Publish to TikTok, Instagram, or Reddit in one click.
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">68 presets</span>
                <span className="text-xs text-gray-300">|</span>
                <span className="text-xs text-gray-400">6 templates</span>
                <span className="text-xs text-gray-300">|</span>
                <span className="text-xs text-gray-400">1080×1440 output</span>
              </div>
            </div>
            <div className="flex-shrink-0 text-gray-300 group-hover:text-red-500 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search content types..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-sm px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300 placeholder-gray-400"
          />
        </div>

        {/* Content Ideas Grid */}
        <div className="mb-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Content Ideas</h2>
          <p className="text-xs text-gray-400 mt-0.5">Each has pre-written TikTok captions with BiteClub tie-ins. Pick a type to browse.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(type => (
            <Link
              key={type.id}
              href={type.href}
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all"
            >
              {/* Color bar */}
              <div className={`h-1 bg-gradient-to-r ${type.color}`} />

              <div className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{type.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-gray-700 truncate">{type.title}</h3>
                    <p className={`text-[10px] font-bold ${type.accent} uppercase tracking-wide`}>{type.presetCount} ideas</p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed mb-3">{type.desc}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {type.platforms.map(p => (
                      <span key={p} className="px-1.5 py-0.5 rounded bg-gray-100 text-[9px] font-bold text-gray-400">{p}</span>
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold text-gray-300 group-hover:text-red-500 transition-colors flex items-center gap-0.5">
                    Browse
                    <svg viewBox="0 0 16 16" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-400">No content types match &ldquo;{search}&rdquo;</p>
          </div>
        )}

        {/* Footer stats */}
        <div className="mt-10 flex items-center justify-center gap-6 text-xs text-gray-400">
          <span><strong className="text-gray-600">{TOTAL_PRESETS}</strong> total presets</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span><strong className="text-gray-600">{CONTENT_TYPES.length}</strong> content types</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span>All with TikTok captions</span>
        </div>
      </main>
    </div>
  );
}
