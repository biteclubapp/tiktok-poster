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

type Challenger = 'johannes' | 'will';
type ChallengeStatus = 'upcoming' | 'posted' | 'skipped';
type ContentFormat = 'Video' | 'Carousel' | 'Duet' | 'Stitch' | 'Story';

interface ChallengeDay {
  day: number;
  theme: string;
  prompt: string;
  format: ContentFormat;
  category: 'Origin Story' | 'Product' | 'Behind the Scenes' | 'Community' | 'Fun' | 'Growth';
}

interface ChallengeEntry {
  day: number;
  challenger: Challenger;
  status: ChallengeStatus;
  likes: number;
  postUrl?: string;
  note?: string;
}

// ─── 30-Day Challenge Plan ──────────────────────────────────────────────────

const CHALLENGE_START = '2026-03-16'; // Today

const CHALLENGE_DAYS: ChallengeDay[] = [
  // Week 1: Origin & Hook
  { day: 1,  theme: 'Why we built BiteClub',       prompt: 'Film yourself explaining why you started building a cooking app. Be raw and honest — what problem are you solving?', format: 'Video', category: 'Origin Story' },
  { day: 2,  theme: 'What I cooked today',          prompt: 'Show what you actually cooked tonight using BiteClub. Real food, no staging.', format: 'Video', category: 'Product' },
  { day: 3,  theme: 'My cooking streak',            prompt: 'Show your cooking streak in the app. Talk about why streaks make you actually cook more.', format: 'Carousel', category: 'Product' },
  { day: 4,  theme: 'Coding at 2am',                prompt: 'Show your late-night coding setup. What feature are you building right now? B-roll of the code.', format: 'Video', category: 'Behind the Scenes' },
  { day: 5,  theme: 'Rate my fridge',               prompt: 'Open your fridge on camera. Use BiteClub to find a recipe with what\'s in there.', format: 'Video', category: 'Fun' },
  { day: 6,  theme: 'The feature nobody asked for', prompt: 'Show the weirdest or most niche feature you built. Why did you build it?', format: 'Video', category: 'Behind the Scenes' },
  { day: 7,  theme: 'Week 1 recap — who\'s winning?', prompt: 'Side-by-side like count. React to each other\'s best post this week.', format: 'Duet', category: 'Fun' },

  // Week 2: Product Deep-Dives
  { day: 8,  theme: 'Cuisines I\'ve cooked map',    prompt: 'Show your cuisines map in BiteClub. Pick a country you haven\'t cooked from yet and try it tonight.', format: 'Video', category: 'Product' },
  { day: 9,  theme: 'Our first user reaction',      prompt: 'Screen-record or re-enact the moment someone outside the team used BiteClub for the first time.', format: 'Video', category: 'Growth' },
  { day: 10, theme: 'Flavor palate reveal',         prompt: 'Show your BiteClub flavor palate (sweet/salty/umami/spice). Are you balanced or one-note?', format: 'Carousel', category: 'Product' },
  { day: 11, theme: 'Day in the life — founder cook', prompt: 'Full day: wake up, code, cook lunch with BiteClub, more code, cook dinner. Real day.', format: 'Video', category: 'Behind the Scenes' },
  { day: 12, theme: '5 meals under $5',             prompt: 'Pick 5 budget recipes from BiteClub. Show the grocery haul and the finished plates.', format: 'Carousel', category: 'Product' },
  { day: 13, theme: 'Bug that almost broke us',     prompt: 'Tell the story of the worst bug you\'ve encountered building BiteClub. Make it dramatic.', format: 'Video', category: 'Behind the Scenes' },
  { day: 14, theme: 'Week 2 scoreboard',            prompt: 'Update the running scoreboard. Call out each other\'s best content. Trash talk encouraged.', format: 'Duet', category: 'Fun' },

  // Week 3: Community & Growth
  { day: 15, theme: 'Cook with a friend',           prompt: 'Invite someone over and cook a BiteClub recipe together. Get their honest review on camera.', format: 'Video', category: 'Community' },
  { day: 16, theme: 'What type of cook are you?',   prompt: 'Show the "Type of Cook" badge feature. Take the quiz on camera and react to your result.', format: 'Video', category: 'Product' },
  { day: 17, theme: 'Malmö vs wherever Will is',    prompt: 'Show your city\'s food scene. What local ingredients or dishes inspire you? Represent your city.', format: 'Video', category: 'Fun' },
  { day: 18, theme: 'The recipe that changed my mind', prompt: 'Cook a recipe you thought you\'d hate. Film the whole journey from skepticism to the first bite.', format: 'Video', category: 'Product' },
  { day: 19, theme: 'Building in public — real numbers', prompt: 'Show actual app metrics: downloads, active users, whatever you\'re comfortable sharing. Be transparent.', format: 'Carousel', category: 'Growth' },
  { day: 20, theme: 'Recreate a childhood meal',    prompt: 'Ask your parents for a recipe from your childhood. Cook it and call them to show the result.', format: 'Video', category: 'Community' },
  { day: 21, theme: 'Week 3 — the gap widens',      prompt: 'Full scoreboard update. React to comments. Address the haters (or lack thereof).', format: 'Duet', category: 'Fun' },

  // Week 4: The Final Push
  { day: 22, theme: 'I cooked every day for 22 days', prompt: 'Show your 22-day streak. How has daily cooking changed your routine? Be reflective.', format: 'Video', category: 'Product' },
  { day: 23, theme: 'Feature request speedrun',      prompt: 'Pick a comment/DM requesting a feature. Build it live (or fake it). Ship by end of video.', format: 'Video', category: 'Behind the Scenes' },
  { day: 24, theme: 'Meal prep Sunday',              prompt: 'Use BiteClub to plan and prep meals for the whole week. Time-lapse the entire cook.', format: 'Video', category: 'Product' },
  { day: 25, theme: 'Cooking battle — same recipe',  prompt: 'Both of you cook the SAME recipe. Film it. Let comments decide who did it better.', format: 'Video', category: 'Fun' },
  { day: 26, theme: 'What we\'d do differently',     prompt: 'If you started BiteClub over, what would you change? Honest founder reflections.', format: 'Video', category: 'Origin Story' },
  { day: 27, theme: 'The community feed',            prompt: 'Show the BiteClub discovery feed. React to what other users are cooking. Hype them up.', format: 'Video', category: 'Community' },
  { day: 28, theme: 'Teach me something in 60 sec',  prompt: 'One cooking skill, one minute. Knife skills, seasoning, plating — whatever you\'re best at.', format: 'Video', category: 'Fun' },
  { day: 29, theme: 'Letter to future BiteClub',     prompt: 'Record a message to yourselves 1 year from now. Where do you hope BiteClub will be?', format: 'Video', category: 'Origin Story' },
  { day: 30, theme: 'FINALE — Winner takes all',     prompt: 'Final like count reveal. Recap the best moments. Announce the winner. Loser cooks winner\'s most hated recipe.', format: 'Duet', category: 'Fun' },
];

const CATEGORY_COLORS: Record<ChallengeDay['category'], { bg: string; text: string; dot: string }> = {
  'Origin Story':      { bg: 'bg-indigo-50',  text: 'text-indigo-600',  dot: 'bg-indigo-400' },
  'Product':           { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-400' },
  'Behind the Scenes': { bg: 'bg-amber-50',   text: 'text-amber-600',   dot: 'bg-amber-400' },
  'Community':         { bg: 'bg-pink-50',    text: 'text-pink-600',    dot: 'bg-pink-400' },
  'Fun':               { bg: 'bg-violet-50',  text: 'text-violet-600',  dot: 'bg-violet-400' },
  'Growth':            { bg: 'bg-cyan-50',    text: 'text-cyan-600',    dot: 'bg-cyan-400' },
};

const FORMAT_ICONS: Record<ContentFormat, string> = {
  'Video': '🎬',
  'Carousel': '📸',
  'Duet': '👥',
  'Stitch': '✂️',
  'Story': '📖',
};

const CHALLENGE_STORAGE_KEY = 'biteclub-challenge';
const CHALLENGE_TASKS_KEY = 'biteclub-challenge-tasks';

type TaskColumn = 'todo' | 'doing' | 'done';

interface ChallengeTask {
  id: string;
  title: string;
  assignee: Challenger | 'both';
  column: TaskColumn;
  day?: number; // linked to challenge day
  priority: 'high' | 'medium' | 'low';
}

const TASK_COLUMN_META: Record<TaskColumn, { label: string; color: string; emptyText: string }> = {
  todo: { label: 'To Do', color: 'bg-red-400', emptyText: 'Nothing here yet — add tasks or reset defaults' },
  doing: { label: 'Doing', color: 'bg-amber-400', emptyText: 'Drag tasks here when you start working on them' },
  done: { label: 'Done', color: 'bg-green-400', emptyText: 'Completed tasks show up here' },
};

const ASSIGNEE_COLORS: Record<ChallengeTask['assignee'], { bg: string; text: string; label: string }> = {
  johannes: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Johannes' },
  will: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Will' },
  both: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Both' },
};

const PRIORITY_DOTS: Record<ChallengeTask['priority'], string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-400',
  low: 'bg-gray-300',
};

function makeDefaultTasks(): ChallengeTask[] {
  let id = 0;
  const t = (title: string, assignee: ChallengeTask['assignee'], priority: ChallengeTask['priority'], day?: number): ChallengeTask => ({
    id: `default-${id++}`,
    title,
    assignee,
    column: 'todo',
    day,
    priority,
  });

  return [
    // Pre-launch prep (no day)
    t('Set up TikTok creator accounts', 'both', 'high'),
    t('Agree on hashtag strategy (#BiteClub30 #FounderChallenge)', 'both', 'high'),
    t('Film intro/teaser announcing the challenge', 'both', 'high'),
    t('Set up ring light + phone mount', 'johannes', 'medium'),
    t('Set up ring light + phone mount', 'will', 'medium'),
    t('Create shared Google Drive for raw footage', 'both', 'medium'),
    t('Draft bio links (BiteClub app store link)', 'both', 'medium'),
    t('Batch-write captions for Week 1 (Days 1-7)', 'johannes', 'high'),
    t('Batch-write captions for Week 1 (Days 1-7)', 'will', 'high'),

    // Week 1 tasks
    t('Film "Why we built BiteClub" — write 3 talking points first', 'johannes', 'high', 1),
    t('Film "Why we built BiteClub" — write 3 talking points first', 'will', 'high', 1),
    t('Cook something tonight and film the whole process', 'johannes', 'medium', 2),
    t('Cook something tonight and film the whole process', 'will', 'medium', 2),
    t('Screenshot cooking streak from app + design carousel', 'johannes', 'medium', 3),
    t('Screenshot cooking streak from app + design carousel', 'will', 'medium', 3),
    t('Set up late-night coding B-roll shots', 'johannes', 'medium', 4),
    t('Set up late-night coding B-roll shots', 'will', 'medium', 4),
    t('Clean fridge before filming (or don\'t — chaos content)', 'johannes', 'low', 5),
    t('Clean fridge before filming (or don\'t — chaos content)', 'will', 'low', 5),
    t('Pick your weirdest feature to showcase', 'johannes', 'medium', 6),
    t('Pick your weirdest feature to showcase', 'will', 'medium', 6),
    t('Compile Week 1 like counts for recap duet', 'both', 'high', 7),

    // Week 2 tasks
    t('Batch-write captions for Week 2 (Days 8-14)', 'johannes', 'high'),
    t('Batch-write captions for Week 2 (Days 8-14)', 'will', 'high'),
    t('Pick a new country cuisine to try from the map', 'johannes', 'medium', 8),
    t('Pick a new country cuisine to try from the map', 'will', 'medium', 8),
    t('Find/record the first user reaction footage', 'both', 'medium', 9),
    t('Screenshot flavor palate + make carousel slides', 'johannes', 'medium', 10),
    t('Screenshot flavor palate + make carousel slides', 'will', 'medium', 10),
    t('Plan full day-in-the-life shoot schedule', 'johannes', 'high', 11),
    t('Plan full day-in-the-life shoot schedule', 'will', 'high', 11),
    t('Research 5 budget recipes + do grocery run', 'johannes', 'medium', 12),
    t('Research 5 budget recipes + do grocery run', 'will', 'medium', 12),
    t('Pick your best bug story and outline the narrative', 'johannes', 'medium', 13),
    t('Pick your best bug story and outline the narrative', 'will', 'medium', 13),
    t('Compile Week 2 scoreboard + plan trash talk', 'both', 'high', 14),

    // Week 3 tasks
    t('Batch-write captions for Week 3 (Days 15-21)', 'johannes', 'high'),
    t('Batch-write captions for Week 3 (Days 15-21)', 'will', 'high'),
    t('Invite a friend over for Day 15 cook session', 'johannes', 'high', 15),
    t('Invite a friend over for Day 15 cook session', 'will', 'high', 15),
    t('Test the "Type of Cook" quiz and screen-record reaction', 'johannes', 'medium', 16),
    t('Test the "Type of Cook" quiz and screen-record reaction', 'will', 'medium', 16),
    t('Scout 3-4 food spots in your city to film', 'johannes', 'medium', 17),
    t('Scout 3-4 food spots in your city to film', 'will', 'medium', 17),
    t('Pick a recipe you\'d normally never cook', 'johannes', 'medium', 18),
    t('Pick a recipe you\'d normally never cook', 'will', 'medium', 18),
    t('Pull app metrics from PostHog for transparency post', 'both', 'high', 19),
    t('Call parents and ask for a childhood recipe', 'johannes', 'medium', 20),
    t('Call parents and ask for a childhood recipe', 'will', 'medium', 20),
    t('Compile Week 3 scoreboard + read comments', 'both', 'high', 21),

    // Week 4 tasks
    t('Batch-write captions for Week 4 (Days 22-30)', 'johannes', 'high'),
    t('Batch-write captions for Week 4 (Days 22-30)', 'will', 'high'),
    t('Screenshot 22-day streak + reflect on the journey', 'johannes', 'medium', 22),
    t('Screenshot 22-day streak + reflect on the journey', 'will', 'medium', 22),
    t('Pick a feature request from comments/DMs to build', 'johannes', 'high', 23),
    t('Pick a feature request from comments/DMs to build', 'will', 'high', 23),
    t('Plan full week of meals + buy groceries for meal prep', 'johannes', 'high', 24),
    t('Plan full week of meals + buy groceries for meal prep', 'will', 'high', 24),
    t('Agree on which recipe to cook for the battle', 'both', 'high', 25),
    t('Write reflection notes for "what we\'d do differently"', 'johannes', 'medium', 26),
    t('Write reflection notes for "what we\'d do differently"', 'will', 'medium', 26),
    t('Pick 5 community posts to react to on camera', 'johannes', 'medium', 27),
    t('Pick 5 community posts to react to on camera', 'will', 'medium', 27),
    t('Pick your best cooking skill to teach in 60 seconds', 'johannes', 'medium', 28),
    t('Pick your best cooking skill to teach in 60 seconds', 'will', 'medium', 28),
    t('Write bullet points for your "letter to future BiteClub"', 'johannes', 'high', 29),
    t('Write bullet points for your "letter to future BiteClub"', 'will', 'high', 29),
    t('Final like count tally + plan the finale video', 'both', 'high', 30),
    t('Decide the punishment recipe for the loser', 'both', 'high', 30),
  ];
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
  const [activeTab, setActiveTab] = useState<'inspiration' | 'board' | 'calendar' | 'challenge'>('challenge');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Challenge state
  const [challengeEntries, setChallengeEntries] = useState<ChallengeEntry[]>([]);
  const [editingLikes, setEditingLikes] = useState<{ day: number; challenger: Challenger } | null>(null);
  const [likesInput, setLikesInput] = useState('');
  const [challengeFilter, setChallengeFilter] = useState<'all' | ChallengeDay['category']>('all');
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [challengeView, setChallengeView] = useState<'days' | 'tasks'>('days');

  // Challenge tasks state
  const [challengeTasks, setChallengeTasks] = useState<ChallengeTask[]>([]);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [taskFilter, setTaskFilter] = useState<'all' | Challenger | 'both'>('all');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskValue, setEditingTaskValue] = useState('');
  const taskEditRef = useRef<HTMLInputElement>(null);

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
    // Load challenge entries
    try {
      const savedChallenge = localStorage.getItem(CHALLENGE_STORAGE_KEY);
      if (savedChallenge) {
        setChallengeEntries(JSON.parse(savedChallenge));
      }
    } catch { /* ignore */ }
    // Load challenge tasks
    try {
      const savedTasks = localStorage.getItem(CHALLENGE_TASKS_KEY);
      if (savedTasks) {
        setChallengeTasks(JSON.parse(savedTasks));
      } else {
        setChallengeTasks(makeDefaultTasks());
      }
    } catch {
      setChallengeTasks(makeDefaultTasks());
    }
    setLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    }
  }, [cards, loaded]);

  // Save challenge entries
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(CHALLENGE_STORAGE_KEY, JSON.stringify(challengeEntries));
    }
  }, [challengeEntries, loaded]);

  // Save challenge tasks
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(CHALLENGE_TASKS_KEY, JSON.stringify(challengeTasks));
    }
  }, [challengeTasks, loaded]);

  // Focus task edit input
  useEffect(() => {
    if (editingTaskId && taskEditRef.current) {
      taskEditRef.current.focus();
      taskEditRef.current.select();
    }
  }, [editingTaskId]);

  // Task helpers
  const moveTask = useCallback((taskId: string, toColumn: TaskColumn) => {
    setChallengeTasks(prev => prev.map(t => t.id === taskId ? { ...t, column: toColumn } : t));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setChallengeTasks(prev => prev.filter(t => t.id !== taskId));
  }, []);

  const addTask = useCallback((assignee: ChallengeTask['assignee']) => {
    const newTask: ChallengeTask = {
      id: uid(),
      title: 'New task',
      assignee,
      column: 'todo',
      priority: 'medium',
    };
    setChallengeTasks(prev => [newTask, ...prev]);
    setEditingTaskId(newTask.id);
    setEditingTaskValue('New task');
  }, []);

  const commitTaskEdit = useCallback(() => {
    if (editingTaskId && editingTaskValue.trim()) {
      setChallengeTasks(prev => prev.map(t => t.id === editingTaskId ? { ...t, title: editingTaskValue.trim() } : t));
    }
    setEditingTaskId(null);
  }, [editingTaskId, editingTaskValue]);

  const cycleTaskPriority = useCallback((taskId: string) => {
    setChallengeTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const next = t.priority === 'high' ? 'medium' : t.priority === 'medium' ? 'low' : 'high';
      return { ...t, priority: next };
    }));
  }, []);

  const cycleTaskAssignee = useCallback((taskId: string) => {
    setChallengeTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const next = t.assignee === 'johannes' ? 'will' : t.assignee === 'will' ? 'both' : 'johannes';
      return { ...t, assignee: next };
    }));
  }, []);

  const resetTasks = useCallback(() => {
    setChallengeTasks(makeDefaultTasks());
  }, []);

  const filteredTasks = challengeTasks.filter(t => taskFilter === 'all' || t.assignee === taskFilter || t.assignee === 'both');

  // Challenge helpers
  const getEntry = useCallback((day: number, challenger: Challenger): ChallengeEntry | undefined => {
    return challengeEntries.find(e => e.day === day && e.challenger === challenger);
  }, [challengeEntries]);

  const updateEntry = useCallback((day: number, challenger: Challenger, updates: Partial<ChallengeEntry>) => {
    setChallengeEntries(prev => {
      const existing = prev.find(e => e.day === day && e.challenger === challenger);
      if (existing) {
        return prev.map(e => e.day === day && e.challenger === challenger ? { ...e, ...updates } : e);
      }
      return [...prev, { day, challenger, status: 'upcoming' as ChallengeStatus, likes: 0, ...updates }];
    });
  }, []);

  const toggleStatus = useCallback((day: number, challenger: Challenger) => {
    const entry = challengeEntries.find(e => e.day === day && e.challenger === challenger);
    const current = entry?.status || 'upcoming';
    const next: ChallengeStatus = current === 'upcoming' ? 'posted' : current === 'posted' ? 'skipped' : 'upcoming';
    updateEntry(day, challenger, { status: next });
  }, [challengeEntries, updateEntry]);

  const totalLikes = useCallback((challenger: Challenger): number => {
    return challengeEntries.filter(e => e.challenger === challenger).reduce((sum, e) => sum + e.likes, 0);
  }, [challengeEntries]);

  const postsCount = useCallback((challenger: Challenger): number => {
    return challengeEntries.filter(e => e.challenger === challenger && e.status === 'posted').length;
  }, [challengeEntries]);

  const getDayDate = useCallback((day: number): string => {
    const start = new Date(CHALLENGE_START + 'T00:00:00');
    start.setDate(start.getDate() + day - 1);
    return start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }, []);

  const getCurrentDay = useCallback((): number => {
    const start = new Date(CHALLENGE_START + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, Math.min(30, diff));
  }, []);

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
            { key: 'challenge' as const, label: '30-Day Challenge' },
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

        {/* ─── 30-Day Challenge Tab ───────────────────────────────────────── */}
        {activeTab === 'challenge' && (
          <section>
            {/* Challenge sub-tabs */}
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setChallengeView('days')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                  challengeView === 'days' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                Daily Challenge
              </button>
              <button
                onClick={() => setChallengeView('tasks')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                  challengeView === 'tasks' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                Task Board
              </button>
            </div>

            {/* ─── Tasks Board ──────────────────────────────────────────── */}
            {challengeView === 'tasks' && (
              <div>
                {/* Task filters + actions */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    {(['all', 'johannes', 'will', 'both'] as const).map(filter => (
                      <button
                        key={filter}
                        onClick={() => setTaskFilter(filter)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          taskFilter === filter
                            ? filter === 'all' ? 'bg-gray-900 text-white'
                              : filter === 'johannes' ? 'bg-blue-600 text-white'
                              : filter === 'will' ? 'bg-orange-500 text-white'
                              : 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {filter === 'all' ? 'All' : filter === 'johannes' ? 'Johannes' : filter === 'will' ? 'Will' : 'Both'}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => addTask('johannes')}
                      className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      + Johannes Task
                    </button>
                    <button
                      onClick={() => addTask('will')}
                      className="text-xs font-bold text-orange-600 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      + Will Task
                    </button>
                    <button
                      onClick={() => addTask('both')}
                      className="text-xs font-bold text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      + Shared Task
                    </button>
                    <button
                      onClick={resetTasks}
                      className="text-xs font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Reset All
                    </button>
                  </div>
                </div>

                {/* Task progress bar */}
                <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-gray-500">Progress</p>
                    <p className="text-xs text-gray-400">
                      {filteredTasks.filter(t => t.column === 'done').length} of {filteredTasks.length} tasks done
                    </p>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
                    {filteredTasks.length > 0 && (
                      <>
                        <div
                          className="bg-green-400 transition-all duration-500"
                          style={{ width: `${(filteredTasks.filter(t => t.column === 'done').length / filteredTasks.length) * 100}%` }}
                        />
                        <div
                          className="bg-amber-300 transition-all duration-500"
                          style={{ width: `${(filteredTasks.filter(t => t.column === 'doing').length / filteredTasks.length) * 100}%` }}
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* 3-column kanban */}
                <div className="grid grid-cols-3 gap-4">
                  {(['todo', 'doing', 'done'] as TaskColumn[]).map(column => {
                    const meta = TASK_COLUMN_META[column];
                    const columnTasks = filteredTasks.filter(t => t.column === column);

                    return (
                      <div
                        key={column}
                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const taskId = e.dataTransfer.getData('text/plain');
                          if (taskId) moveTask(taskId, column);
                        }}
                        className="bg-gray-100/60 rounded-2xl border border-gray-200/60 min-h-[500px] flex flex-col"
                      >
                        {/* Column header */}
                        <div className="px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${meta.color}`} />
                            <h3 className="text-sm font-bold text-gray-900">{meta.label}</h3>
                            <span className="text-xs text-gray-400 bg-gray-200/80 rounded-full px-2 py-0.5">
                              {columnTasks.length}
                            </span>
                          </div>
                        </div>

                        {/* Task cards */}
                        <div className="px-3 pb-3 flex-1 flex flex-col gap-2">
                          {columnTasks.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center">
                              <p className="text-xs text-gray-400 text-center px-4">{meta.emptyText}</p>
                            </div>
                          ) : (
                            columnTasks.map(task => {
                              const isEditingThis = editingTaskId === task.id;
                              const isDragging = draggedTaskId === task.id;
                              const assigneeInfo = ASSIGNEE_COLORS[task.assignee];

                              return (
                                <div
                                  key={task.id}
                                  draggable={!isEditingThis}
                                  onDragStart={(e) => {
                                    setDraggedTaskId(task.id);
                                    e.dataTransfer.effectAllowed = 'move';
                                    e.dataTransfer.setData('text/plain', task.id);
                                    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '0.5';
                                  }}
                                  onDragEnd={(e) => {
                                    setDraggedTaskId(null);
                                    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '1';
                                  }}
                                  className={`group bg-white rounded-xl border border-gray-200 p-3 transition-all cursor-grab active:cursor-grabbing ${
                                    isDragging ? 'opacity-50 scale-95' : 'hover:border-gray-300 hover:shadow-sm'
                                  } ${task.column === 'done' ? 'opacity-70' : ''}`}
                                >
                                  {/* Title row */}
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-start gap-2 flex-1 min-w-0">
                                      {/* Priority dot */}
                                      <button
                                        onClick={() => cycleTaskPriority(task.id)}
                                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${PRIORITY_DOTS[task.priority]} hover:ring-2 hover:ring-gray-300 transition-all`}
                                        title={`Priority: ${task.priority} (click to cycle)`}
                                      />
                                      {isEditingThis ? (
                                        <input
                                          ref={taskEditRef}
                                          type="text"
                                          value={editingTaskValue}
                                          onChange={(e) => setEditingTaskValue(e.target.value)}
                                          onBlur={commitTaskEdit}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') commitTaskEdit();
                                            if (e.key === 'Escape') setEditingTaskId(null);
                                          }}
                                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent"
                                        />
                                      ) : (
                                        <p
                                          onClick={() => {
                                            setEditingTaskId(task.id);
                                            setEditingTaskValue(task.title);
                                          }}
                                          className={`text-xs font-medium cursor-text leading-relaxed ${task.column === 'done' ? 'line-through text-gray-400' : 'text-gray-900'}`}
                                        >
                                          {task.title}
                                        </p>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => deleteTask(task.id)}
                                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-opacity flex-shrink-0"
                                      title="Delete"
                                    >
                                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>

                                  {/* Badges */}
                                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                    <button
                                      onClick={() => cycleTaskAssignee(task.id)}
                                      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold ${assigneeInfo.bg} ${assigneeInfo.text} hover:opacity-80 transition-opacity`}
                                      title="Click to change assignee"
                                    >
                                      {assigneeInfo.label}
                                    </button>
                                    {task.day && (
                                      <span className="inline-flex items-center rounded-md bg-gray-100 text-gray-500 px-1.5 py-0.5 text-[10px] font-medium">
                                        Day {task.day}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── Days View ────────────────────────────────────────────── */}
            {challengeView === 'days' && (<>
            {/* Scoreboard */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {/* Johannes */}
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full -translate-y-8 translate-x-8" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">J</div>
                    <div>
                      <h3 className="text-lg font-bold">Johannes</h3>
                      <p className="text-blue-200 text-xs">Co-founder</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-3xl font-black">{totalLikes('johannes').toLocaleString()}</p>
                      <p className="text-blue-200 text-xs mt-0.5">Total Likes</p>
                    </div>
                    <div>
                      <p className="text-3xl font-black">{postsCount('johannes')}<span className="text-lg text-blue-300">/30</span></p>
                      <p className="text-blue-200 text-xs mt-0.5">Posts Made</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Will */}
              <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/20 rounded-full -translate-y-8 translate-x-8" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">W</div>
                    <div>
                      <h3 className="text-lg font-bold">Will</h3>
                      <p className="text-orange-200 text-xs">Co-founder</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-3xl font-black">{totalLikes('will').toLocaleString()}</p>
                      <p className="text-orange-200 text-xs mt-0.5">Total Likes</p>
                    </div>
                    <div>
                      <p className="text-3xl font-black">{postsCount('will')}<span className="text-lg text-orange-300">/30</span></p>
                      <p className="text-orange-200 text-xs mt-0.5">Posts Made</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Winner banner (if likes differ) */}
            {totalLikes('johannes') !== totalLikes('will') && (totalLikes('johannes') > 0 || totalLikes('will') > 0) && (
              <div className={`mb-6 rounded-xl p-4 text-center font-bold text-sm ${
                totalLikes('johannes') > totalLikes('will')
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-orange-50 text-orange-700 border border-orange-200'
              }`}>
                {totalLikes('johannes') > totalLikes('will')
                  ? `Johannes is leading by ${(totalLikes('johannes') - totalLikes('will')).toLocaleString()} likes`
                  : `Will is leading by ${(totalLikes('will') - totalLikes('johannes')).toLocaleString()} likes`
                }
              </div>
            )}

            {/* Category filter */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <button
                onClick={() => setChallengeFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  challengeFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Days
              </button>
              {(['Origin Story', 'Product', 'Behind the Scenes', 'Community', 'Fun', 'Growth'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setChallengeFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    challengeFilter === cat
                      ? `${CATEGORY_COLORS[cat].bg} ${CATEGORY_COLORS[cat].text}`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Challenge Days Grid */}
            <div className="space-y-3">
              {CHALLENGE_DAYS
                .filter(d => challengeFilter === 'all' || d.category === challengeFilter)
                .map(day => {
                  const jEntry = getEntry(day.day, 'johannes');
                  const wEntry = getEntry(day.day, 'will');
                  const isExpanded = expandedDay === day.day;
                  const isCurrentDay = getCurrentDay() === day.day;
                  const isPast = getCurrentDay() > day.day;
                  const colors = CATEGORY_COLORS[day.category];
                  const weekNum = Math.ceil(day.day / 7);

                  // Show week header
                  const showWeekHeader = day.day === 1 || day.day === 8 || day.day === 15 || day.day === 22;
                  const weekLabel = day.day === 1 ? 'Week 1 — Origin & Hook' : day.day === 8 ? 'Week 2 — Product Deep-Dives' : day.day === 15 ? 'Week 3 — Community & Growth' : 'Week 4 — The Final Push';

                  return (
                    <div key={day.day}>
                      {showWeekHeader && challengeFilter === 'all' && (
                        <div className="flex items-center gap-3 mt-8 mb-4 first:mt-0">
                          <div className="h-px flex-1 bg-gray-200" />
                          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">{weekLabel}</h3>
                          <div className="h-px flex-1 bg-gray-200" />
                        </div>
                      )}

                      <div
                        className={`rounded-2xl border transition-all ${
                          isCurrentDay
                            ? 'border-red-300 bg-red-50/30 ring-2 ring-red-100'
                            : isPast
                              ? 'border-gray-200 bg-gray-50/50'
                              : 'border-gray-200 bg-white'
                        }`}
                      >
                        {/* Day Header — always visible */}
                        <button
                          onClick={() => setExpandedDay(isExpanded ? null : day.day)}
                          className="w-full px-5 py-4 flex items-center gap-4 text-left"
                        >
                          {/* Day number */}
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                            isCurrentDay ? 'bg-red-500 text-white' : isPast ? 'bg-gray-200 text-gray-500' : `${colors.bg} ${colors.text}`
                          }`}>
                            {day.day}
                          </div>

                          {/* Theme */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className={`font-bold truncate ${isPast && !isCurrentDay ? 'text-gray-500' : 'text-gray-900'}`}>
                                {day.theme}
                              </h4>
                              {isCurrentDay && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white animate-pulse">
                                  TODAY
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">{getDayDate(day.day)}</p>
                          </div>

                          {/* Format + Category badges */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-sm">{FORMAT_ICONS[day.format]}</span>
                            <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold ${colors.bg} ${colors.text}`}>
                              {day.category}
                            </span>
                          </div>

                          {/* Quick score display */}
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="text-right">
                              <p className={`text-xs font-bold ${jEntry?.status === 'posted' ? 'text-blue-600' : 'text-gray-300'}`}>
                                {jEntry?.likes ? jEntry.likes.toLocaleString() : '—'}
                              </p>
                              <p className="text-[10px] text-gray-400">J</p>
                            </div>
                            <div className="text-gray-200 text-xs font-bold">vs</div>
                            <div className="text-left">
                              <p className={`text-xs font-bold ${wEntry?.status === 'posted' ? 'text-orange-600' : 'text-gray-300'}`}>
                                {wEntry?.likes ? wEntry.likes.toLocaleString() : '—'}
                              </p>
                              <p className="text-[10px] text-gray-400">W</p>
                            </div>
                          </div>

                          {/* Expand chevron */}
                          <svg className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* Expanded content */}
                        {isExpanded && (
                          <div className="px-5 pb-5 border-t border-gray-100">
                            {/* Prompt */}
                            <div className="mt-4 mb-5 p-4 bg-gray-50 rounded-xl">
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Content Prompt</p>
                              <p className="text-sm text-gray-700 leading-relaxed">{day.prompt}</p>
                            </div>

                            {/* Two columns: Johannes vs Will */}
                            <div className="grid grid-cols-2 gap-4">
                              {/* Johannes */}
                              <div className={`rounded-xl border-2 p-4 transition-colors ${
                                jEntry?.status === 'posted' ? 'border-blue-200 bg-blue-50/50' :
                                jEntry?.status === 'skipped' ? 'border-gray-200 bg-gray-50 opacity-60' :
                                'border-gray-200 bg-white'
                              }`}>
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">J</div>
                                    <span className="text-sm font-bold text-gray-900">Johannes</span>
                                  </div>
                                  <button
                                    onClick={() => toggleStatus(day.day, 'johannes')}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                                      jEntry?.status === 'posted' ? 'bg-green-100 text-green-700' :
                                      jEntry?.status === 'skipped' ? 'bg-gray-200 text-gray-500' :
                                      'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                                  >
                                    {jEntry?.status === 'posted' ? 'Posted' : jEntry?.status === 'skipped' ? 'Skipped' : 'Not Posted'}
                                  </button>
                                </div>

                                {/* Likes input */}
                                <div className="mb-3">
                                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Likes</label>
                                  {editingLikes?.day === day.day && editingLikes?.challenger === 'johannes' ? (
                                    <input
                                      type="number"
                                      value={likesInput}
                                      onChange={e => setLikesInput(e.target.value)}
                                      onBlur={() => {
                                        updateEntry(day.day, 'johannes', { likes: parseInt(likesInput) || 0 });
                                        setEditingLikes(null);
                                      }}
                                      onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                          updateEntry(day.day, 'johannes', { likes: parseInt(likesInput) || 0 });
                                          setEditingLikes(null);
                                        }
                                      }}
                                      autoFocus
                                      className="w-full mt-1 px-3 py-2 text-lg font-bold bg-white border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    />
                                  ) : (
                                    <p
                                      onClick={() => {
                                        setEditingLikes({ day: day.day, challenger: 'johannes' });
                                        setLikesInput(String(jEntry?.likes || 0));
                                      }}
                                      className="mt-1 text-2xl font-black text-blue-600 cursor-pointer hover:text-blue-700"
                                    >
                                      {(jEntry?.likes || 0).toLocaleString()}
                                    </p>
                                  )}
                                </div>

                                {/* Post URL */}
                                <input
                                  type="text"
                                  placeholder="Paste TikTok link..."
                                  value={jEntry?.postUrl || ''}
                                  onChange={e => updateEntry(day.day, 'johannes', { postUrl: e.target.value })}
                                  className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder-gray-300"
                                />
                              </div>

                              {/* Will */}
                              <div className={`rounded-xl border-2 p-4 transition-colors ${
                                wEntry?.status === 'posted' ? 'border-orange-200 bg-orange-50/50' :
                                wEntry?.status === 'skipped' ? 'border-gray-200 bg-gray-50 opacity-60' :
                                'border-gray-200 bg-white'
                              }`}>
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">W</div>
                                    <span className="text-sm font-bold text-gray-900">Will</span>
                                  </div>
                                  <button
                                    onClick={() => toggleStatus(day.day, 'will')}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                                      wEntry?.status === 'posted' ? 'bg-green-100 text-green-700' :
                                      wEntry?.status === 'skipped' ? 'bg-gray-200 text-gray-500' :
                                      'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                                  >
                                    {wEntry?.status === 'posted' ? 'Posted' : wEntry?.status === 'skipped' ? 'Skipped' : 'Not Posted'}
                                  </button>
                                </div>

                                {/* Likes input */}
                                <div className="mb-3">
                                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Likes</label>
                                  {editingLikes?.day === day.day && editingLikes?.challenger === 'will' ? (
                                    <input
                                      type="number"
                                      value={likesInput}
                                      onChange={e => setLikesInput(e.target.value)}
                                      onBlur={() => {
                                        updateEntry(day.day, 'will', { likes: parseInt(likesInput) || 0 });
                                        setEditingLikes(null);
                                      }}
                                      onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                          updateEntry(day.day, 'will', { likes: parseInt(likesInput) || 0 });
                                          setEditingLikes(null);
                                        }
                                      }}
                                      autoFocus
                                      className="w-full mt-1 px-3 py-2 text-lg font-bold bg-white border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                                    />
                                  ) : (
                                    <p
                                      onClick={() => {
                                        setEditingLikes({ day: day.day, challenger: 'will' });
                                        setLikesInput(String(wEntry?.likes || 0));
                                      }}
                                      className="mt-1 text-2xl font-black text-orange-600 cursor-pointer hover:text-orange-700"
                                    >
                                      {(wEntry?.likes || 0).toLocaleString()}
                                    </p>
                                  )}
                                </div>

                                {/* Post URL */}
                                <input
                                  type="text"
                                  placeholder="Paste TikTok link..."
                                  value={wEntry?.postUrl || ''}
                                  onChange={e => updateEntry(day.day, 'will', { postUrl: e.target.value })}
                                  className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 placeholder-gray-300"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Challenge info footer */}
            <div className="mt-8 p-5 bg-gray-50 rounded-2xl border border-gray-200">
              <h4 className="text-sm font-bold text-gray-900 mb-2">Challenge Rules</h4>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>Post one TikTok every day for 30 days (March 16 - April 14)</li>
                <li>Each day has a theme — follow the prompt or put your own spin on it</li>
                <li>Track likes by clicking the number and updating it</li>
                <li>Whoever has the most total likes at the end wins</li>
                <li>Loser cooks the winner&apos;s most hated recipe on camera</li>
              </ul>
            </div>
            </>)}
          </section>
        )}
      </main>
    </div>
  );
}
