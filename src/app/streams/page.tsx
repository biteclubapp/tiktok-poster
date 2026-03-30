'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback, useRef } from 'react';
import StreamCarouselGenerator, { CarouselPrefill } from '@/components/StreamCarouselGenerator';
import { DishData } from '@/types';

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
  { id: 'info', emoji: '\u{1F4A1}', title: 'Food Knowledge', desc: 'Stats, tips, nutrition, debates \u2014 generates real carousel slides you can publish instantly.', href: '/streams/info', presetCount: 68, color: 'from-blue-500 to-cyan-500', accent: 'text-blue-600', platforms: ['TT', 'IG', 'Rd'] },
  { id: 'day-in-life', emoji: '\u{1F3AC}', title: 'Day in the Life', desc: 'Behind-the-scenes founder content. Coding, cooking, real moments.', href: '/streams/day-in-life', presetCount: 37, color: 'from-amber-400 to-yellow-500', accent: 'text-amber-600', platforms: ['TT', 'IG'] },
  { id: 'challenges', emoji: '\u{1F525}', title: 'Food Challenges', desc: 'Fridge raids, budget battles, speed runs, taste tests.', href: '/streams/challenges', presetCount: 36, color: 'from-orange-500 to-red-500', accent: 'text-orange-600', platforms: ['TT'] },
  { id: 'spotlights', emoji: '\u2728', title: 'User Spotlights', desc: 'Feature real BiteClub users, streak heroes, community recipes.', href: '/streams/spotlights', presetCount: 32, color: 'from-pink-500 to-rose-500', accent: 'text-pink-600', platforms: ['TT', 'IG', 'Rd'] },
  { id: 'meal-prep', emoji: '\u{1F961}', title: 'Meal Prep', desc: 'Budget preps, time savers, diet-specific, family-sized batches.', href: '/streams/meal-prep', presetCount: 35, color: 'from-green-500 to-emerald-500', accent: 'text-green-600', platforms: ['TT', 'IG', 'Rd'] },
  { id: 'polls', emoji: '\u{1F5F3}\uFE0F', title: 'Polls & Quizzes', desc: 'Hot takes, this-or-that, would-you-rather, rate-it.', href: '/streams/polls', presetCount: 37, color: 'from-indigo-500 to-violet-500', accent: 'text-indigo-600', platforms: ['TT', 'IG'] },
  { id: 'seasonal', emoji: '\u{1F342}', title: 'Seasonal & Trending', desc: 'Spring, summer, fall, winter themes + viral food trends.', href: '/streams/seasonal', presetCount: 39, color: 'from-teal-500 to-cyan-500', accent: 'text-teal-600', platforms: ['TT', 'IG', 'Rd'] },
  { id: 'versus', emoji: '\u2694\uFE0F', title: 'Food Battles', desc: 'Head-to-head comparisons, technique wars, budget vs bougie.', href: '/streams/versus', presetCount: 38, color: 'from-rose-500 to-red-500', accent: 'text-rose-600', platforms: ['TT', 'IG'] },
  { id: 'stories', emoji: '\u{1F4D6}', title: 'Food Stories', desc: 'Family recipes, cultural origins, personal journeys, nostalgia.', href: '/streams/stories', presetCount: 35, color: 'from-stone-500 to-neutral-600', accent: 'text-stone-600', platforms: ['TT', 'IG', 'Rd'] },
  { id: 'anti-food-culture', emoji: '\u270A', title: 'Anti-Food Culture', desc: 'Against performative cooking content. Real food, real kitchens, no aesthetics required.', href: '/streams/anti-food-culture', presetCount: 40, color: 'from-red-600 to-rose-500', accent: 'text-red-600', platforms: ['TT', 'IG', 'Rd'] },
];

const TOTAL_PRESETS = CONTENT_TYPES.reduce((sum, t) => sum + t.presetCount, 0);

// ─── New Updates: event-driven, dismissable, time-gated ─────────────────────

type Recurrence = 'daily' | 'weekly' | 'monthly' | 'milestone';

interface UpdateDef {
  id: string;
  emoji: string;
  titleFn: () => string;
  descFn: () => string;
  recurrence: Recurrence;
  badge: string;
  badgeColor: string;
  prefillFn: () => CarouselPrefill;
}

/** Real data returned from /api/streams/updates */
interface UpdateData {
  title: string;
  desc: string;
  user?: { username: string; fullName?: string; avatarUrl?: string };
  meals: Array<{
    id: string;
    recipeName: string;
    caption?: string;
    rating?: number;
    imageUrl?: string;
    createdAt: string;
    ingredients?: string[];
    instructions?: string[];
  }>;
  stats?: Array<{ label: string; value: string; unit?: string }>;
}

const STORAGE_KEY = 'biteclub_updates_dismissed';

/** Get the period key for an update — used to decide when it "resets" */
function getPeriodKey(recurrence: Recurrence): string {
  const now = new Date();
  switch (recurrence) {
    case 'daily':
      return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    case 'weekly': {
      // Week starts Monday. Get Monday of current week.
      const day = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((day + 6) % 7));
      return `${monday.getFullYear()}-${monday.getMonth()}-${monday.getDate()}`;
    }
    case 'monthly':
      return `${now.getFullYear()}-${now.getMonth()}`;
    case 'milestone':
      // Milestones don't auto-reset — they stay dismissed until manually retriggered
      return 'permanent';
  }
}

function getDismissed(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function dismissUpdate(id: string, recurrence: Recurrence) {
  const dismissed = getDismissed();
  dismissed[id] = getPeriodKey(recurrence);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissed));
}

function isUpdateDue(id: string, recurrence: Recurrence): boolean {
  const dismissed = getDismissed();
  const lastDismissedPeriod = dismissed[id];
  if (!lastDismissedPeriod) return true; // never dismissed
  const currentPeriod = getPeriodKey(recurrence);
  return lastDismissedPeriod !== currentPeriod; // new period = due again
}

function getMonthName(): string {
  return new Date().toLocaleString('en-US', { month: 'long' });
}

function getDayOfWeek(): string {
  return new Date().toLocaleString('en-US', { weekday: 'long' });
}

function isWeekend(): boolean {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

// All possible updates — each with a recurrence rule
const UPDATE_DEFS: UpdateDef[] = [
  {
    id: 'new_month',
    emoji: '\u{1F389}',
    titleFn: () => `${getMonthName()} on BiteClub`,
    descFn: () => `New month, new cooking goals. What the community is cooking in ${getMonthName()}.`,
    recurrence: 'monthly',
    badge: 'Monthly',
    badgeColor: 'bg-purple-100 text-purple-700',
    prefillFn: () => ({
      type: 'biteclub_stats',
      title: `${getMonthName()} on BiteClub`,
      callout: `A brand new month of cooking starts now. Here's what the BiteClub community is planning.`,
      cta: 'Set your cooking goal for the month',
      ctaSub: 'Your BiteClub streak resets monthly \u2014 start strong',
      stats: [
        { label: 'Active cooks this month', value: '...', unit: '' },
        { label: 'Meals logged', value: '...', unit: '' },
      ],
    }),
  },
  {
    id: 'daily_spotlight',
    emoji: '\u{1F468}\u200D\u{1F373}',
    titleFn: () => `${getDayOfWeek()}'s Cook of the Day`,
    descFn: () => 'A standout cook from today. Someone who logged a great meal and deserves a shoutout.',
    recurrence: 'daily',
    badge: 'Daily',
    badgeColor: 'bg-blue-100 text-blue-700',
    prefillFn: () => ({
      type: 'community_spotlight',
      username: '@todays_cook',
      bio: `Today's standout cook on BiteClub. A real person, a real kitchen, a real meal.`,
      cta: 'Cook something today and you could be next',
      ctaSub: 'Post your meal on BiteClub \u2014 the Discovery feed is where we find these cooks',
      highlights: [
        { dish: 'Loading...', quote: 'Fetching real data...' },
      ],
    }),
  },
  {
    id: 'milestone_100',
    emoji: '\u{1F4AF}',
    titleFn: () => 'Someone Just Hit 100 Meals',
    descFn: () => 'A BiteClub user just crossed triple digits. That\u2019s a lifestyle change, not a stat.',
    recurrence: 'milestone',
    badge: 'Milestone',
    badgeColor: 'bg-amber-100 text-amber-700',
    prefillFn: () => ({
      type: 'biteclub_stats',
      title: '100 Meals Logged',
      callout: 'Someone on BiteClub just hit 100 meals. That is not a number \u2014 that is proof.',
      cta: 'Start logging your meals on BiteClub',
      ctaSub: 'Your Cooking History counts every single one',
      stats: [
        { label: 'Total meals logged', value: '...', unit: '' },
        { label: 'Unique recipes', value: '...', unit: '' },
      ],
    }),
  },
  {
    id: 'streak_record',
    emoji: '\u{1F525}',
    titleFn: () => 'New Longest Streak Record',
    descFn: () => 'A BiteClub user just set a new streak record. Cooking every day, no skips.',
    recurrence: 'milestone',
    badge: 'Record',
    badgeColor: 'bg-orange-100 text-orange-700',
    prefillFn: () => ({
      type: 'biteclub_stats',
      title: 'New Streak Record',
      callout: 'The longest cooking streak on BiteClub just got longer. Every day counts.',
      cta: 'Start your own streak',
      ctaSub: 'The weekly calendar marks every day you cooked',
      stats: [
        { label: 'Streak length', value: '...', unit: 'days' },
      ],
    }),
  },
  {
    id: 'countries_cooked',
    emoji: '\u{1F5FA}\uFE0F',
    titleFn: () => 'Countries Cooked This Week',
    descFn: () => 'A breakdown of every cuisine the BiteClub community cooked from this week.',
    recurrence: 'weekly',
    badge: 'Weekly',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    prefillFn: () => ({
      type: 'biteclub_stats',
      title: 'Countries Cooked This Week',
      callout: 'The BiteClub community cooked from multiple countries this week.',
      cta: 'Add a new cuisine to your map',
      ctaSub: 'Every country you cook from gets a pin on your Cuisines Cooked map',
      stats: [
        { label: 'Countries', value: '...', unit: '' },
      ],
    }),
  },
  {
    id: 'global_cook',
    emoji: '\u{1F30D}',
    titleFn: () => 'Latest Global Cook',
    descFn: () => 'The most recent cook from a new country on the BiteClub world map.',
    recurrence: 'daily',
    badge: 'Daily',
    badgeColor: 'bg-blue-100 text-blue-700',
    prefillFn: () => ({
      type: 'community_spotlight',
      username: '@global_cook',
      bio: 'A BiteClub user just added a new country to their Cuisines Cooked map.',
      cta: 'Add a new cuisine to your map',
      ctaSub: 'Every country you cook from gets a pin',
      highlights: [
        { dish: 'Loading...', quote: 'Fetching real data...' },
      ],
    }),
  },
  {
    id: 'new_member',
    emoji: '\u{1F331}',
    titleFn: () => 'Newest BiteClub Member',
    descFn: () => 'Someone just posted their very first meal on BiteClub. Welcome them.',
    recurrence: 'daily',
    badge: 'Daily',
    badgeColor: 'bg-blue-100 text-blue-700',
    prefillFn: () => ({
      type: 'community_spotlight',
      username: '@new_member',
      bio: 'Their very first meal on BiteClub. Everyone starts somewhere.',
      cta: 'Post your first meal today',
      ctaSub: 'Your cooking journey starts with one post',
      highlights: [
        { dish: 'Loading...', quote: 'Fetching real data...' },
      ],
    }),
  },
  {
    id: 'weekend_recap',
    emoji: '\u{1F37D}\uFE0F',
    titleFn: () => isWeekend() ? 'What the Community Is Cooking Right Now' : 'Weekend Cooking Recap',
    descFn: () => isWeekend() ? 'Live look at what BiteClub users are making this weekend.' : 'What the community cooked this past weekend.',
    recurrence: 'weekly',
    badge: 'Weekly',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    prefillFn: () => ({
      type: 'biteclub_stats',
      title: isWeekend() ? 'Weekend Cooking: Live' : 'Weekend Cooking Recap',
      callout: isWeekend()
        ? 'BiteClub kitchens are busy right now. Here is what people are making.'
        : 'The weekend is when the community cooks the most. Here is what happened.',
      cta: 'Post your weekend meal on BiteClub',
      ctaSub: 'Weekend cooking counts toward your streak',
      stats: [
        { label: 'Weekend meals', value: '...', unit: '' },
      ],
    }),
  },
  {
    id: 'rising_recipe',
    emoji: '\u{1F4C8}',
    titleFn: () => 'Rising Recipe',
    descFn: () => 'This recipe is gaining traction fast on the Discovery feed.',
    recurrence: 'daily',
    badge: 'Trending',
    badgeColor: 'bg-red-100 text-red-700',
    prefillFn: () => ({
      type: 'biteclub_stats',
      title: 'Rising Recipe Alert',
      callout: 'One recipe is spreading through the BiteClub community faster than usual.',
      cta: 'Find it on the Discovery feed',
      ctaSub: 'Save it before everyone else does',
      stats: [
        { label: 'Recipe', value: '...', unit: '' },
        { label: 'Times cooked', value: '...', unit: 'this week' },
      ],
    }),
  },
];

// ─── Build DishData from UpdateData (for dish-based carousel generation) ────

function buildDishDataFromUpdate(updateData: UpdateData): DishData | undefined {
  const meal = updateData.meals[0];
  if (!meal || !meal.imageUrl) return undefined;

  return {
    meal: {
      id: meal.id,
      user_id: '',
      caption: meal.caption || null,
      rating: meal.rating || null,
      created_at: meal.createdAt,
      description: null,
      profile: {
        id: '',
        username: updateData.user?.username || 'unknown',
        full_name: updateData.user?.fullName || null,
        avatar_url: updateData.user?.avatarUrl || null,
      },
      media: [],
      recipes: [],
    },
    heroImageUrl: meal.imageUrl,
    recipeName: meal.recipeName,
    cookName: updateData.user?.fullName || updateData.user?.username || 'BiteClub Cook',
    cookInitial: (updateData.user?.fullName || updateData.user?.username || 'B')[0].toUpperCase(),
    cookTime: '',
    ingredients: meal.ingredients || [],
    instructions: meal.instructions || [],
    stepCount: (meal.instructions || []).length,
    ingredientCount: (meal.ingredients || []).length,
  };
}

// ─── Build prefill from real UpdateData ─────────────────────────────────────

function buildPrefillFromUpdate(updateData: UpdateData, fallback: CarouselPrefill): CarouselPrefill {
  // If we have stats, use biteclub_stats type
  if (updateData.stats && updateData.stats.length > 0) {
    return {
      ...fallback,
      type: 'biteclub_stats',
      title: updateData.title,
      callout: updateData.desc,
      stats: updateData.stats.map((s) => ({ label: s.label, value: s.value, unit: s.unit })),
    };
  }

  // If we have a user and meals, use community_spotlight type
  if (updateData.user && updateData.meals.length > 0) {
    return {
      ...fallback,
      type: 'community_spotlight',
      username: `@${updateData.user.username}`,
      bio: updateData.desc,
      highlights: updateData.meals.map((m) => ({
        dish: m.recipeName,
        quote: m.caption || undefined,
      })),
    };
  }

  return fallback;
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function ContentPage() {
  const [search, setSearch] = useState('');
  const [activeUpdateId, setActiveUpdateId] = useState<string | null>(null);
  const [dueUpdates, setDueUpdates] = useState<UpdateDef[]>([]);

  // Store fetched real data per update id
  const [updateDataMap, setUpdateDataMap] = useState<Record<string, UpdateData>>({});
  const [loadingUpdates, setLoadingUpdates] = useState<Record<string, boolean>>({});
  const fetchedRef = useRef<Set<string>>(new Set());

  // Compute which updates are due (not yet dismissed for this period)
  const refreshDueUpdates = useCallback(() => {
    setDueUpdates(UPDATE_DEFS.filter((u) => isUpdateDue(u.id, u.recurrence)));
  }, []);

  useEffect(() => {
    refreshDueUpdates();
  }, [refreshDueUpdates]);

  // Fetch real data for all due updates on mount
  useEffect(() => {
    if (dueUpdates.length === 0) return;

    for (const update of dueUpdates) {
      if (fetchedRef.current.has(update.id)) continue;
      fetchedRef.current.add(update.id);

      setLoadingUpdates((prev) => ({ ...prev, [update.id]: true }));

      fetch('/api/streams/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: update.id }),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed');
          return res.json();
        })
        .then((data: UpdateData) => {
          setUpdateDataMap((prev) => ({ ...prev, [update.id]: data }));
        })
        .catch((err) => {
          console.error(`Failed to fetch update data for ${update.id}:`, err);
          // Leave as undefined — fallback to static prefill
        })
        .finally(() => {
          setLoadingUpdates((prev) => ({ ...prev, [update.id]: false }));
        });
    }
  }, [dueUpdates]);

  function handleDismiss(update: UpdateDef) {
    dismissUpdate(update.id, update.recurrence);
    setActiveUpdateId(null);
    refreshDueUpdates();
  }

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

        {/* ─── New Updates Section (only shows when there are pending updates) ── */}
        {dueUpdates.length > 0 ? (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </div>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">New Updates</h2>
                <span className="text-xs text-gray-300">{dueUpdates.length} pending</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {dueUpdates.map((update) => {
                const isActive = activeUpdateId === update.id;
                const realData = updateDataMap[update.id];
                const isLoading = loadingUpdates[update.id];

                // Use real data for title/desc if available, else fallback
                const title = realData?.title || update.titleFn();
                const desc = realData?.desc || update.descFn();

                // Get thumbnail images from real data
                const thumbnails = (realData?.meals || [])
                  .map((m) => m.imageUrl)
                  .filter(Boolean)
                  .slice(0, 3) as string[];

                // Build DishData for the cover slide (hero food photo)
                // Every update type gets a food photo cover when real data is available
                const dishData = realData ? buildDishDataFromUpdate(realData) : undefined;

                // Build prefill from real data, falling back to static
                const prefill = realData
                  ? buildPrefillFromUpdate(realData, update.prefillFn())
                  : update.prefillFn();

                return (
                  <div
                    key={update.id}
                    className={`bg-white rounded-xl border overflow-hidden transition-all ${
                      isActive ? 'border-red-300 shadow-md col-span-1 sm:col-span-2' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="p-4">
                      {/* Thumbnails row */}
                      {thumbnails.length > 0 && (
                        <div className="flex gap-1.5 mb-3 -mx-1">
                          {thumbnails.map((url, i) => (
                            <div
                              key={i}
                              className="relative flex-1 aspect-square rounded-lg overflow-hidden bg-gray-100"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={url}
                                alt=""
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                              {i === 0 && realData?.user && (
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                                  <p className="text-[9px] font-bold text-white truncate">
                                    @{realData.user.username}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Loading shimmer for thumbnails */}
                      {isLoading && thumbnails.length === 0 && (
                        <div className="flex gap-1.5 mb-3 -mx-1">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="flex-1 aspect-square rounded-lg bg-gray-100 animate-pulse" />
                          ))}
                        </div>
                      )}

                      <div className="flex items-start gap-3 mb-2">
                        <span className="text-2xl flex-shrink-0">{update.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 leading-snug">
                            {isLoading ? (
                              <span className="inline-block w-32 h-4 bg-gray-100 rounded animate-pulse" />
                            ) : (
                              title
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                            {isLoading ? (
                              <span className="inline-block w-48 h-3 bg-gray-50 rounded animate-pulse mt-1" />
                            ) : (
                              desc
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Real stats chips */}
                      {realData?.stats && realData.stats.length > 0 && !isActive && (
                        <div className="flex flex-wrap gap-1 mt-2 mb-2">
                          {realData.stats.slice(0, 3).map((stat, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-50 border border-gray-100 rounded text-[9px] text-gray-600"
                            >
                              <span className="font-bold">{stat.value}</span>
                              <span className="text-gray-400">{stat.label}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${update.badgeColor}`}>
                          {update.badge}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDismiss(update)}
                            className="text-[10px] font-medium text-gray-400 hover:text-gray-600 transition-colors"
                            title={`Dismiss \u2014 will reappear ${update.recurrence === 'daily' ? 'tomorrow' : update.recurrence === 'weekly' ? 'next week' : update.recurrence === 'monthly' ? 'next month' : 'when retriggered'}`}
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => setActiveUpdateId(isActive ? null : update.id)}
                            className="text-[10px] font-semibold text-red-500 hover:text-red-700 transition-colors flex items-center gap-0.5"
                          >
                            {isActive ? 'Close' : 'Generate'}
                            <svg viewBox="0 0 16 16" className={`w-2.5 h-2.5 transition-transform ${isActive ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M4 6l4 4 4-4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Carousel generator — downloading dismisses the update */}
                    {isActive && (
                      <StreamCarouselGenerator
                        preset={{ id: update.id, label: title, emoji: update.emoji, desc, category: 'updates' }}
                        prefill={prefill}
                        dishData={dishData}
                        onClose={() => setActiveUpdateId(null)}
                        onDownload={() => handleDismiss(update)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mb-10 p-6 bg-white rounded-2xl border border-gray-200 text-center">
            <div className="text-3xl mb-2">{'\u2705'}</div>
            <p className="text-sm font-semibold text-gray-700">All caught up</p>
            <p className="text-xs text-gray-400 mt-1">
              No new updates right now. Daily updates refresh tomorrow, weekly ones on Monday, and monthly ones on the 1st.
            </p>
          </div>
        )}

        {/* Hero: Carousel Generator */}
        <Link
          href="/streams/info"
          className="group block mb-10 relative overflow-hidden rounded-2xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5" />
          <div className="relative p-8 flex items-center gap-8">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-3xl shadow-lg">
              {'\u{1F373}'}
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
                <span className="text-xs text-gray-400">1080x1440 output</span>
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
          <span>All with TikTok captions + carousel generation</span>
        </div>
      </main>
    </div>
  );
}
