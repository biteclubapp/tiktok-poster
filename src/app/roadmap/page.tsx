'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

type ContentType = 'Video' | 'Carousel' | 'UGC' | 'Interactive' | 'Carousel - Info';
type PlatformTarget = 'TikTok' | 'Reddit' | 'Instagram' | 'All';
type KanbanColumn = 'ideas' | 'in-progress' | 'published';

interface KanbanCard {
  id: string;
  title: string;
  contentType: ContentType;
  platform: PlatformTarget;
  column: KanbanColumn;
  calendarDay?: string; // ISO date string e.g. '2026-03-12'
}

interface InspirationProfile {
  handle: string;
  name: string;
  note: string;
  category: string;
  categoryColor: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const INSPIRATION_PROFILES: InspirationProfile[] = [
  // Recipe Creators
  { handle: 'thefeedfeed', name: 'The Feed Feed', note: 'Curated food community with massive UGC engine. Study their repost/tag strategy.', category: 'Recipe Creators', categoryColor: 'bg-orange-100 text-orange-700' },
  { handle: 'halfbakedharvest', name: 'Half Baked Harvest', note: 'Tieghan Gerard — rustic, homemade aesthetic. Warm tones and imperfect beauty sell authenticity.', category: 'Recipe Creators', categoryColor: 'bg-orange-100 text-orange-700' },
  { handle: 'joshuaweissman', name: 'Joshua Weissman', note: 'Elevated home cooking with big personality. Great hook + punchline format.', category: 'Recipe Creators', categoryColor: 'bg-orange-100 text-orange-700' },
  { handle: 'cookingwithshereen', name: 'Cooking With Shereen', note: 'Approachable Middle Eastern recipes. Warm, personal storytelling drives engagement.', category: 'Recipe Creators', categoryColor: 'bg-orange-100 text-orange-700' },
  { handle: 'feelgoodfoodie', name: 'Feel Good Foodie', note: 'Quick healthy recipes with clean branding. Great carousel/reel thumbnail consistency.', category: 'Recipe Creators', categoryColor: 'bg-orange-100 text-orange-700' },
  // Food Apps & Startups
  { handle: 'whaborask', name: 'Whisk', note: 'Recipe saving/planning app. Study their product-led content and feature teasers.', category: 'Food Apps', categoryColor: 'bg-blue-100 text-blue-700' },
  { handle: 'mealime', name: 'Mealime', note: 'Meal planning startup. Clean, minimal content style that lets the food speak.', category: 'Food Apps', categoryColor: 'bg-blue-100 text-blue-700' },
  { handle: 'sidechefapp', name: 'SideChef', note: 'Guided cooking app. Interactive step-by-step content translates well to carousels.', category: 'Food Apps', categoryColor: 'bg-blue-100 text-blue-700' },
  { handle: 'yummly', name: 'Yummly', note: 'Recipe discovery platform. Strong recommendation-style content and seasonal hooks.', category: 'Food Apps', categoryColor: 'bg-blue-100 text-blue-700' },
  { handle: 'papaborakaapp', name: 'Paprika App', note: 'Recipe manager with loyal community. Study their low-budget, high-engagement approach.', category: 'Food Apps', categoryColor: 'bg-blue-100 text-blue-700' },
  // Community-First Brands
  { handle: 'strava', name: 'Strava', note: 'Direct analog — social fitness. Study how they celebrate user achievements and build FOMO.', category: 'Community Brands', categoryColor: 'bg-green-100 text-green-700' },
  { handle: 'duolingo', name: 'Duolingo', note: 'Masterclass in brand personality on TikTok. Unhinged but on-brand. The gold standard.', category: 'Community Brands', categoryColor: 'bg-green-100 text-green-700' },
  { handle: 'notionhq', name: 'Notion', note: 'Productivity tool with creator community. Great template-sharing content model.', category: 'Community Brands', categoryColor: 'bg-green-100 text-green-700' },
  { handle: 'figma', name: 'Figma', note: 'Design tool with authentic community content. Behind-the-scenes and tips format.', category: 'Community Brands', categoryColor: 'bg-green-100 text-green-700' },
  { handle: 'oatly', name: 'Oatly', note: 'Irreverent, self-aware food brand voice. Anti-corporate tone that builds cult following.', category: 'Community Brands', categoryColor: 'bg-green-100 text-green-700' },
  // Content Format Inspiration
  { handle: 'mob', name: 'MOB Kitchen', note: 'Short, punchy recipe videos. Perfected the overhead 60-second recipe format.', category: 'Format Inspo', categoryColor: 'bg-purple-100 text-purple-700' },
  { handle: 'buzzfeedtasty', name: 'Tasty', note: 'Overhead recipe format pioneers. Study their thumbnail and hook strategies.', category: 'Format Inspo', categoryColor: 'bg-purple-100 text-purple-700' },
  { handle: 'bonappetitmag', name: 'Bon Appetit', note: 'Editorial food content with personality. Long-form that still works in short clips.', category: 'Format Inspo', categoryColor: 'bg-purple-100 text-purple-700' },
  { handle: 'gordonramsayofficial', name: 'Gordon Ramsay', note: 'Personality-driven cooking. Duets, reactions, challenges — pure engagement bait done right.', category: 'Format Inspo', categoryColor: 'bg-purple-100 text-purple-700' },
];

const DEFAULT_CARDS: KanbanCard[] = [
  { id: '1', title: 'Day in the life of a home cook', contentType: 'Video', platform: 'TikTok', column: 'ideas' },
  { id: '2', title: '"Rate my fridge" challenge', contentType: 'UGC', platform: 'TikTok', column: 'ideas' },
  { id: '3', title: '5 meals under 30 min', contentType: 'Carousel', platform: 'All', column: 'ideas' },
  { id: '4', title: 'Kitchen hack: knife skills', contentType: 'Carousel - Info', platform: 'All', column: 'ideas' },
  { id: '5', title: 'What I eat in a day', contentType: 'Video', platform: 'TikTok', column: 'ideas' },
  { id: '6', title: 'Cooking the most liked recipe', contentType: 'Video', platform: 'TikTok', column: 'ideas' },
  { id: '7', title: 'Ingredient spotlight: seasonal produce', contentType: 'Carousel', platform: 'Instagram', column: 'ideas' },
  { id: '8', title: 'Cook with me: weekend meal prep', contentType: 'Video', platform: 'TikTok', column: 'ideas' },
  { id: '9', title: 'BiteClub user spotlight', contentType: 'UGC', platform: 'All', column: 'ideas' },
  { id: '10', title: '"Guess the dish" game', contentType: 'Interactive', platform: 'TikTok', column: 'ideas' },
];

const CONTENT_TYPE_COLORS: Record<ContentType, string> = {
  'Video': 'bg-red-100 text-red-700',
  'Carousel': 'bg-amber-100 text-amber-700',
  'UGC': 'bg-teal-100 text-teal-700',
  'Interactive': 'bg-violet-100 text-violet-700',
  'Carousel - Info': 'bg-amber-100 text-amber-700',
};

const PLATFORM_ICONS: Record<PlatformTarget, string> = {
  'TikTok': 'TT',
  'Reddit': 'Rd',
  'Instagram': 'IG',
  'All': 'All',
};

const PLATFORM_COLORS: Record<PlatformTarget, string> = {
  'TikTok': 'bg-gray-900 text-white',
  'Reddit': 'bg-orange-500 text-white',
  'Instagram': 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
  'All': 'bg-gray-200 text-gray-700',
};

const COLUMN_META: Record<KanbanColumn, { label: string; color: string; emptyText: string }> = {
  'ideas': { label: 'Ideas', color: 'bg-amber-400', emptyText: 'Drop ideas here or click "Add Idea"' },
  'in-progress': { label: 'In Progress', color: 'bg-blue-400', emptyText: 'Drag ideas here when you start working on them' },
  'published': { label: 'Published', color: 'bg-green-400', emptyText: 'Completed content shows up here' },
};

const STORAGE_KEY = 'biteclub-roadmap';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function RoadmapPage() {
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [activeTab, setActiveTab] = useState<'inspiration' | 'board' | 'calendar'>('board');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCards(JSON.parse(saved));
      } else {
        setCards(DEFAULT_CARDS);
      }
    } catch {
      setCards(DEFAULT_CARDS);
    }
    setLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    }
  }, [cards, loaded]);

  // Focus edit input
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const monday = getMonday(new Date());
  monday.setDate(monday.getDate() + weekOffset * 7);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });

  const weekLabel = `${formatDisplayDate(weekDays[0])} - ${formatDisplayDate(weekDays[6])}`;

  // ─── Handlers ────────────────────────────────────────────────────────────

  const moveCard = useCallback((cardId: string, toColumn: KanbanColumn) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, column: toColumn } : c));
  }, []);

  const assignDay = useCallback((cardId: string, day: string) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, calendarDay: day } : c));
  }, []);

  const deleteCard = useCallback((cardId: string) => {
    setCards(prev => prev.filter(c => c.id !== cardId));
  }, []);

  const addCard = useCallback(() => {
    const newCard: KanbanCard = {
      id: uid(),
      title: 'New content idea',
      contentType: 'Video',
      platform: 'All',
      column: 'ideas',
    };
    setCards(prev => [newCard, ...prev]);
    setEditingId(newCard.id);
    setEditValue('New content idea');
  }, []);

  const startEdit = useCallback((card: KanbanCard) => {
    setEditingId(card.id);
    setEditValue(card.title);
  }, []);

  const commitEdit = useCallback(() => {
    if (editingId && editValue.trim()) {
      setCards(prev => prev.map(c => c.id === editingId ? { ...c, title: editValue.trim() } : c));
    }
    setEditingId(null);
  }, [editingId, editValue]);

  // ─── Drag & Drop ────────────────────────────────────────────────────────

  function handleDragStart(e: React.DragEvent, cardId: string) {
    setDraggedCard(cardId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', cardId);
    // Make the drag image slightly transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  }

  function handleDragEnd(e: React.DragEvent) {
    setDraggedCard(null);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  }

  function handleColumnDrop(e: React.DragEvent, column: KanbanColumn) {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain');
    if (cardId) moveCard(cardId, column);
  }

  function handleCalendarDrop(e: React.DragEvent, day: string) {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain');
    if (cardId) assignDay(cardId, day);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  // ─── Render Helpers ──────────────────────────────────────────────────────

  function renderCard(card: KanbanCard, compact = false) {
    const isEditing = editingId === card.id;
    const isDragging = draggedCard === card.id;

    return (
      <div
        key={card.id}
        draggable={!isEditing}
        onDragStart={(e) => handleDragStart(e, card.id)}
        onDragEnd={handleDragEnd}
        className={`group bg-white rounded-xl border border-gray-200 transition-all cursor-grab active:cursor-grabbing ${
          isDragging ? 'opacity-50 scale-95' : 'hover:border-gray-300 hover:shadow-sm'
        } ${compact ? 'p-2.5' : 'p-3'}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                ref={editInputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitEdit();
                  if (e.key === 'Escape') setEditingId(null);
                }}
                className={`w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent ${compact ? 'text-xs' : 'text-sm'}`}
              />
            ) : (
              <p
                onClick={() => startEdit(card)}
                className={`font-medium text-gray-900 cursor-text truncate ${compact ? 'text-xs' : 'text-sm'}`}
                title={card.title}
              >
                {card.title}
              </p>
            )}
          </div>
          <button
            onClick={() => deleteCard(card.id)}
            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-opacity flex-shrink-0"
            title="Delete"
          >
            <svg className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className={`flex items-center gap-1.5 flex-wrap ${compact ? 'mt-1.5' : 'mt-2'}`}>
          <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 font-medium ${CONTENT_TYPE_COLORS[card.contentType]} ${compact ? 'text-[10px]' : 'text-xs'}`}>
            {card.contentType}
          </span>
          <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 font-semibold ${PLATFORM_COLORS[card.platform]} ${compact ? 'text-[10px]' : 'text-xs'}`}>
            {PLATFORM_ICONS[card.platform]}
          </span>
          {card.calendarDay && !compact && (
            <span className="inline-flex items-center rounded-md bg-gray-100 text-gray-500 px-1.5 py-0.5 text-xs">
              {new Date(card.calendarDay + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  if (!loaded) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center py-20">
            <span className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-red-500 rounded-full" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Content Roadmap</h1>
          <p className="text-sm text-gray-500 mt-1">
            Plan, track, and brainstorm content ideas for BiteClub across all platforms
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mb-6 bg-white rounded-xl border border-gray-200 p-1 w-fit">
          {([
            { key: 'board' as const, label: 'Content Board' },
            { key: 'calendar' as const, label: 'Calendar' },
            { key: 'inspiration' as const, label: 'Inspiration' },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-red-50 text-red-600'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Inspiration Tab ───────────────────────────────────────────── */}
        {activeTab === 'inspiration' && (
          <section>
            <div className="mb-5">
              <h2 className="text-lg font-bold text-gray-900">Inspiration Profiles</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Real accounts BiteClub should study for tone, format, and engagement strategy
              </p>
            </div>

            {/* Category groups */}
            {(['Recipe Creators', 'Food Apps', 'Community Brands', 'Format Inspo'] as const).map(category => {
              const profiles = INSPIRATION_PROFILES.filter(p => p.category === category);
              return (
                <div key={category} className="mb-8">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                    {profiles.map(profile => (
                      <a
                        key={profile.handle}
                        href={`https://tiktok.com/@${profile.handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group bg-white rounded-2xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-md transition-all"
                      >
                        {/* Avatar placeholder + handle */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 group-hover:from-red-50 group-hover:to-red-100 transition-colors">
                            <span className="text-sm font-bold text-gray-400 group-hover:text-red-400 transition-colors">
                              {profile.name.charAt(0)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{profile.name}</p>
                            <p className="text-xs text-gray-400 truncate">@{profile.handle}</p>
                          </div>
                        </div>
                        {/* Category badge */}
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium mb-2 ${profile.categoryColor}`}>
                          {profile.category}
                        </span>
                        {/* Note */}
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                          {profile.note}
                        </p>
                        {/* Link hint */}
                        <div className="mt-3 flex items-center gap-1 text-xs text-gray-300 group-hover:text-red-400 transition-colors">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          <span>View on TikTok</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* ─── Board Tab (Kanban) ────────────────────────────────────────── */}
        {activeTab === 'board' && (
          <section>
            <div className="grid grid-cols-3 gap-4">
              {(['ideas', 'in-progress', 'published'] as KanbanColumn[]).map(column => {
                const meta = COLUMN_META[column];
                const columnCards = cards.filter(c => c.column === column);

                return (
                  <div
                    key={column}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleColumnDrop(e, column)}
                    className="bg-gray-100/60 rounded-2xl border border-gray-200/60 min-h-[400px] flex flex-col"
                  >
                    {/* Column header */}
                    <div className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${meta.color}`} />
                        <h3 className="text-sm font-bold text-gray-900">{meta.label}</h3>
                        <span className="text-xs text-gray-400 bg-gray-200/80 rounded-full px-2 py-0.5">
                          {columnCards.length}
                        </span>
                      </div>
                      {column === 'ideas' && (
                        <button
                          onClick={addCard}
                          className="text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                        >
                          + Add Idea
                        </button>
                      )}
                    </div>

                    {/* Cards */}
                    <div className="px-3 pb-3 flex-1 flex flex-col gap-2">
                      {columnCards.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                          <p className="text-xs text-gray-400 text-center px-4">{meta.emptyText}</p>
                        </div>
                      ) : (
                        columnCards.map(card => renderCard(card))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ─── Calendar Tab ──────────────────────────────────────────────── */}
        {activeTab === 'calendar' && (
          <section>
            {/* Week nav */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setWeekOffset(o => o - 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-sm font-bold text-gray-900">{weekLabel}</h2>
                <button
                  onClick={() => setWeekOffset(o => o + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => setWeekOffset(0)}
                  className="text-xs font-medium text-gray-500 hover:text-gray-900 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Today
                </button>
              </div>
              <p className="text-xs text-gray-400">Drag cards from the board to assign them to days</p>
            </div>

            {/* Week grid */}
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day, i) => {
                const dateStr = formatDate(day);
                const isToday = formatDate(new Date()) === dateStr;
                const dayCards = cards.filter(c => c.calendarDay === dateStr);

                return (
                  <div
                    key={dateStr}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleCalendarDrop(e, dateStr)}
                    className={`rounded-2xl border min-h-[200px] flex flex-col transition-colors ${
                      isToday
                        ? 'border-red-200 bg-red-50/30'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    {/* Day header */}
                    <div className={`px-3 py-2 border-b ${isToday ? 'border-red-100' : 'border-gray-100'}`}>
                      <p className={`text-xs font-medium ${isToday ? 'text-red-500' : 'text-gray-400'}`}>
                        {DAY_NAMES[i]}
                      </p>
                      <p className={`text-lg font-bold ${isToday ? 'text-red-600' : 'text-gray-900'}`}>
                        {day.getDate()}
                      </p>
                    </div>
                    {/* Day cards */}
                    <div className="p-2 flex-1 flex flex-col gap-1.5">
                      {dayCards.map(card => renderCard(card, true))}
                      {dayCards.length === 0 && (
                        <div className="flex-1 flex items-center justify-center">
                          <p className="text-[10px] text-gray-300">Drop here</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Unscheduled cards for easy dragging */}
            <div className="mt-8">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
                Unscheduled Content
              </h3>
              <div className="flex flex-wrap gap-2">
                {cards.filter(c => !c.calendarDay).length === 0 ? (
                  <p className="text-xs text-gray-400">All content is scheduled. Nice work!</p>
                ) : (
                  cards.filter(c => !c.calendarDay).map(card => (
                    <div key={card.id} className="w-64">
                      {renderCard(card, true)}
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
