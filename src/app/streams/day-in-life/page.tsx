'use client';

import { useState } from 'react';
import Link from 'next/link';

// ── Content presets (grouped by category) ────────────────────────────────────

interface ContentPreset {
  id: string;
  label: string;
  emoji: string;
  desc: string;
  category: string;
}

const CATEGORIES = [
  { id: 'morning', label: 'Morning Routines', emoji: '\u2600\uFE0F', color: 'text-amber-600 bg-amber-50' },
  { id: 'coding', label: 'Coding Sessions', emoji: '\u{1F4BB}', color: 'text-blue-600 bg-blue-50' },
  { id: 'kitchen', label: 'Kitchen Tests', emoji: '\u{1F9EA}', color: 'text-green-600 bg-green-50' },
  { id: 'team', label: 'Team Moments', emoji: '\u{1F91D}', color: 'text-purple-600 bg-purple-50' },
  { id: 'realtalk', label: 'Real Talk', emoji: '\u{1F4AC}', color: 'text-rose-600 bg-rose-50' },
] as const;

const PRESETS: ContentPreset[] = [
  // ── Morning Routines ──
  { id: 'founder_morning', label: 'My Founder Morning Routine', emoji: '\u2600\uFE0F', desc: 'What 6am actually looks like when you run a startup', category: 'morning' },
  { id: 'breakfast_founder', label: 'What I Actually Eat as a Startup Founder', emoji: '\u{1F373}', desc: 'Spoiler: it is not always glamorous', category: 'morning' },
  { id: 'commute_malmo', label: 'My Commute in Malmo', emoji: '\u{1F6B2}', desc: 'From apartment to laptop in 8 minutes flat', category: 'morning' },
  { id: 'coffee_ritual', label: 'The Coffee That Starts Everything', emoji: '\u2615', desc: 'My non-negotiable before any code gets written', category: 'morning' },
  { id: 'morning_standup', label: 'Morning Standup With Myself', emoji: '\u{1F4DD}', desc: 'Solo founder version of a team sync', category: 'morning' },
  { id: 'gym_before_code', label: 'Gym Before Code', emoji: '\u{1F3CB}\uFE0F', desc: 'Why I train before I build and how it changes the whole day', category: 'morning' },
  { id: 'sunday_reset', label: 'Sunday Reset as a Founder', emoji: '\u{1F9F9}', desc: 'Meal prep, week plan, inbox zero attempt', category: 'morning' },

  // ── Coding Sessions ──
  { id: '3am_debug', label: '3am Debugging Session', emoji: '\u{1F41B}', desc: 'The bug that would not let me sleep', category: 'coding' },
  { id: 'app_crashed_prod', label: 'First Time Our App Crashed in Production', emoji: '\u{1F4A5}', desc: 'The panic, the fix, the lesson', category: 'coding' },
  { id: 'feature_3_weeks', label: 'The Feature That Took 3 Weeks', emoji: '\u23F3', desc: 'Estimated 2 days. Took 21. Here is why.', category: 'coding' },
  { id: 'late_night_ship', label: 'Shipping at Midnight', emoji: '\u{1F680}', desc: 'When the deploy button hits different at 11:59pm', category: 'coding' },
  { id: 'refactor_day', label: 'I Spent a Full Day Refactoring', emoji: '\u{1F527}', desc: 'No new features. Just making old code not embarrassing.', category: 'coding' },
  { id: 'first_user_bug', label: 'Our First Real User Found a Bug', emoji: '\u{1F4E9}', desc: 'The DM that made my stomach drop', category: 'coding' },
  { id: 'stack_overflow', label: 'How Much Stack Overflow I Actually Use', emoji: '\u{1F4DA}', desc: 'Honest screen time breakdown of a solo dev', category: 'coding' },
  { id: 'vibe_coding', label: 'Vibe Coding a Whole Feature', emoji: '\u{1F3B5}', desc: 'Lo-fi beats, dark mode, zero interruptions', category: 'coding' },

  // ── Kitchen Tests ──
  { id: 'recipe_test_fail', label: 'This Recipe Test Failed Spectacularly', emoji: '\u{1F525}', desc: 'When the taste test says no', category: 'kitchen' },
  { id: 'taste_test_office', label: 'Office Taste Test: Honest Reactions', emoji: '\u{1F60B}', desc: 'Rating our own recipes with brutal honesty', category: 'kitchen' },
  { id: 'ingredient_experiment', label: 'Experimenting With a New Ingredient', emoji: '\u{1FAD2}', desc: 'Never cooked with this before. Let us see.', category: 'kitchen' },
  { id: 'recreate_takeout', label: 'Recreating My Favorite Takeout at Home', emoji: '\u{1F961}', desc: 'Can homemade actually beat the original?', category: 'kitchen' },
  { id: 'photo_vs_reality', label: 'Recipe Photo vs What I Actually Made', emoji: '\u{1F4F8}', desc: 'The gap between content and reality', category: 'kitchen' },
  { id: 'five_attempts', label: 'It Took 5 Attempts to Get This Right', emoji: '\u{1F3AF}', desc: 'The iteration process behind one recipe', category: 'kitchen' },
  { id: 'grocery_run', label: 'Grocery Run for Recipe Testing', emoji: '\u{1F6D2}', desc: 'What a founder buys when testing 3 recipes in one day', category: 'kitchen' },

  // ── Team Moments ──
  { id: 'cofounder_call_wrong', label: 'Co-founder Call Gone Wrong', emoji: '\u{1F4DE}', desc: 'When you disagree and the call gets real', category: 'team' },
  { id: 'design_review', label: 'Design Review: Roasting Our Own UI', emoji: '\u{1F3A8}', desc: 'Honest critique of what we shipped last week', category: 'team' },
  { id: 'first_team_dinner', label: 'First Team Dinner', emoji: '\u{1F37D}\uFE0F', desc: 'When the people building the app finally eat together', category: 'team' },
  { id: 'celebrate_milestone', label: 'We Hit a Milestone (Small but Real)', emoji: '\u{1F389}', desc: 'The number does not matter. The feeling does.', category: 'team' },
  { id: 'feedback_session', label: 'Reading User Feedback Together', emoji: '\u{1F4AC}', desc: 'The good, the bad, the surprisingly detailed', category: 'team' },
  { id: 'brainstorm_session', label: 'Brainstorm Session: Next Big Feature', emoji: '\u{1F9E0}', desc: 'Whiteboard chaos that might actually work', category: 'team' },
  { id: 'investor_pitch_prep', label: 'Preparing for an Investor Call', emoji: '\u{1F4CA}', desc: 'The deck, the nerves, the practice runs', category: 'team' },

  // ── Real Talk ──
  { id: 'imposter_syndrome', label: 'Imposter Syndrome Hit Different Today', emoji: '\u{1F614}', desc: 'When you wonder if you should even be doing this', category: 'realtalk' },
  { id: 'zero_downloads_day', label: 'The Day We Got Zero Downloads', emoji: '\u{1F4C9}', desc: 'What happens when the numbers say nothing', category: 'realtalk' },
  { id: 'why_i_started', label: 'Why I Started Building BiteClub', emoji: '\u{1F4A1}', desc: 'The origin story nobody asked for but everyone relates to', category: 'realtalk' },
  { id: 'money_running_out', label: 'Running Out of Runway', emoji: '\u{1F4B8}', desc: 'The math that keeps founders up at night', category: 'realtalk' },
  { id: 'comparison_trap', label: 'Comparing Myself to Other Founders', emoji: '\u{1F4F1}', desc: 'Their Series A vs my ramen budget', category: 'realtalk' },
  { id: 'best_advice', label: 'Best Advice I Got This Year', emoji: '\u{1F48E}', desc: 'One sentence that changed how I build', category: 'realtalk' },
  { id: 'lonely_founder', label: 'Nobody Talks About How Lonely This Is', emoji: '\u{1F30C}', desc: 'The side of building nobody posts about', category: 'realtalk' },
  { id: 'first_paying_user', label: 'The Day Someone Paid for Our App', emoji: '\u{1F4B0}', desc: 'When validation finally feels real', category: 'realtalk' },
];

// ── TikTok captions ──────────────────────────────────────────────────────────

const TIKTOK_CAPTIONS: Record<string, string> = {
  // MORNING
  founder_morning: "this is what 6am actually looks like when you're building a startup. no aesthetic morning routine here.\nwe're building BiteClub — a cooking app for people who actually cook. link in bio.\n#founderlife #morningroutine #startuplife #buildinpublic #biteclub #dayinthelife",
  breakfast_founder: "what i actually eat as a startup founder. spoiler: it's whatever takes under 5 minutes.\nwe're building BiteClub to make home cooking easier — even for people like me. try it free.\n#founderfood #startuplife #whatieatinaday #homecooking #biteclub #dayinthelife",
  commute_malmo: "my commute in malmo. 8 minutes, zero traffic, straight to the laptop.\nbuilding BiteClub from sweden. a cooking app for real home cooks — link in bio.\n#malmo #sweden #startuplife #commute #biteclub #dayinthelife #buildinpublic",
  coffee_ritual: "this coffee is the only thing between me and closing the laptop forever. non-negotiable.\nwe're building BiteClub — track your meals, build streaks, discover recipes — download BiteClub.\n#coffeetime #founderlife #morningroutine #startuplife #biteclub #dayinthelife",
  morning_standup: "solo founder standup. it's just me, a notebook, and the cold hard truth about yesterday's progress.\nbuilding BiteClub in public — a cooking app that actually tracks your progress — link in bio.\n#solofoundeer #standup #startuplife #buildinpublic #biteclub #productivity",
  gym_before_code: "gym before code. the only hour of the day where the bugs can't reach me.\nwe're building BiteClub — because founders who cook eat better than founders who don't. try it free.\n#gymlife #founderlife #morningroutine #healthyhabits #biteclub #dayinthelife",
  sunday_reset: "sunday reset as a founder. meal prep, week plan, one desperate attempt at inbox zero.\nbuild your weekly meal plan on BiteClub before monday hits — link in bio.\n#sundayreset #mealprep #weekplanning #founderlife #biteclub #productivity",

  // CODING
  '3am_debug': "3am. still debugging. the fix was one character. ONE CHARACTER.\nthis is what building BiteClub actually looks like. a cooking app built with sleep deprivation. link in bio.\n#debugging #3amcoding #devlife #startuplife #biteclub #buildinpublic",
  app_crashed_prod: "first time our app crashed in production. my heart rate was higher than our user count.\nwe fixed it. BiteClub is back. track your meals and build cooking streaks — download BiteClub.\n#productionbug #startuplife #devlife #appcrash #biteclub #buildinpublic",
  feature_3_weeks: "estimated: 2 days. actual: 3 weeks. this feature nearly broke me.\nbut it shipped. and now it's live on BiteClub. try it yourself — link in bio.\n#featureship #devlife #startuplife #buildinpublic #biteclub #coding",
  late_night_ship: "shipping at midnight. the deploy button hits different when everyone else is asleep.\nnew feature live on BiteClub right now — discover it before anyone else. download BiteClub.\n#shipping #latenightcoding #devlife #startuplife #biteclub #buildinpublic",
  refactor_day: "spent a full day refactoring. zero new features. just making old code less embarrassing.\nBiteClub is getting cleaner under the hood every week. try the app — link in bio.\n#refactoring #cleancode #devlife #startuplife #biteclub #buildinpublic",
  first_user_bug: "our first real user found a bug. the DM notification sound will haunt me forever.\nfixed within an hour. BiteClub gets better every time someone uses it — try it free.\n#userfeedback #bugfix #startuplife #devlife #biteclub #buildinpublic",
  stack_overflow: "here's how much stack overflow i actually use. the honest screen time breakdown.\nbuilding BiteClub one copied snippet at a time. a cooking app for home cooks — link in bio.\n#stackoverflow #devlife #honestcoding #startuplife #biteclub #buildinpublic",
  vibe_coding: "lo-fi beats. dark mode. zero interruptions. this is where features actually get built.\nvibe-coded a whole new feature for BiteClub today. try the app — download BiteClub.\n#vibecoding #lofi #darkmode #devlife #biteclub #buildinpublic #coding",

  // KITCHEN
  recipe_test_fail: "this recipe test failed so hard the smoke alarm went off. not every test is a win.\nthe ones that work end up on BiteClub. discover real recipes from real cooks — link in bio.\n#recipefail #cookingtok #foodfail #honestcooking #biteclub #behindthescenes",
  taste_test_office: "office taste test. rating our own recipes with zero mercy.\nthe ones that survive go live on BiteClub's Discovery feed. try them yourself — download BiteClub.\n#tastetest #honestreviews #foodtesting #startuplife #biteclub #cookingtok",
  ingredient_experiment: "never cooked with this ingredient before. let's find out if it's worth it.\nlog your ingredient experiments on BiteClub — your Flavor Palate updates every time. link in bio.\n#newingredient #cookingexperiment #trynewfoods #homecooking #biteclub #cookingtok",
  recreate_takeout: "trying to recreate my favorite takeout at home. can homemade actually beat the original?\nsave the recipe if it works — add it to your BiteClub cookbook. try BiteClub free.\n#homemadetakeout #cookingtok #copycat #homecooking #biteclub #foodchallenge",
  photo_vs_reality: "recipe photo vs what i actually made. the gap is... real.\npost your real cooking on BiteClub — no filters, just honest food. link in bio.\n#expectationvsreality #foodfail #honestcooking #cookingtok #biteclub #realfood",
  five_attempts: "it took 5 attempts to get this recipe right. attempt 1 was genuinely terrible.\nthe final version is on BiteClub now. discover it on the Discovery feed — download BiteClub.\n#recipedev #iteration #cookingtok #persistence #biteclub #homecooking",
  grocery_run: "what a founder buys when testing 3 recipes in one day. the cart looks insane.\nall test results end up as recipes on BiteClub. browse the Discovery feed — link in bio.\n#groceryhaul #recipetesting #founderlife #cookingtok #biteclub #behindthescenes",

  // TEAM
  cofounder_call_wrong: "co-founder call gone wrong. we disagreed on the roadmap and the vibes were off.\nbut we figured it out. that's how BiteClub gets better. try the app — link in bio.\n#cofounders #startuplife #disagree #teamwork #biteclub #buildinpublic",
  design_review: "design review: roasting our own UI. no one is safe.\nBiteClub gets prettier every sprint. see the latest — download BiteClub.\n#designreview #uidesign #startuplife #honestfeedback #biteclub #buildinpublic",
  first_team_dinner: "the people building the cooking app finally ate together. it was overdue.\nwe cook what we build. BiteClub — for people who actually cook. link in bio.\n#teamdinner #startuplife #cookingteam #companyculture #biteclub #foodtok",
  celebrate_milestone: "we hit a milestone today. the number is small but the feeling is not.\nBiteClub is growing. track your meals and grow with us — try it free.\n#milestone #startupwin #buildinpublic #smallwins #biteclub #startuplife",
  feedback_session: "reading user feedback together. the good, the bad, the surprisingly detailed.\nevery piece of feedback makes BiteClub better. download and tell us what you think.\n#userfeedback #startuplife #buildinpublic #productdev #biteclub #customerfeedback",
  brainstorm_session: "brainstorm session for the next big feature. whiteboard chaos that might actually work.\nBiteClub's roadmap is built in rooms like this. try the current version — link in bio.\n#brainstorm #productdev #startuplife #whiteboard #biteclub #buildinpublic",
  investor_pitch_prep: "preparing for an investor call. the deck, the nerves, the practice runs.\nwe're building BiteClub — Strava for home cooks. wish us luck. link in bio.\n#investorpitch #startuplife #fundraising #pitchdeck #biteclub #buildinpublic",

  // REAL TALK
  imposter_syndrome: "imposter syndrome hit different today. some days you wonder if you should even be doing this.\nthen someone logs a meal on BiteClub and it matters again. try the app — link in bio.\n#impostersyndrome #founderlife #mentalhealth #realtalk #biteclub #startuplife",
  zero_downloads_day: "the day we got zero downloads. zero. the number on the screen was literally 0.\nwe kept building anyway. BiteClub is still here. try it — download BiteClub.\n#zerodownloads #startuplife #realtalk #buildinpublic #biteclub #honestfounder",
  why_i_started: "why i started building BiteClub. nobody asked but i think everyone who cooks will relate.\nBiteClub — track meals, build streaks, find recipes. the app i wished existed. link in bio.\n#originstory #whyistarted #founderlife #buildinpublic #biteclub #startupstory",
  money_running_out: "running out of runway. the math that keeps founders up at 3am.\nwe're still building BiteClub. every download matters more than you know. try it free.\n#runway #startupfinance #founderlife #realtalk #biteclub #buildinpublic",
  comparison_trap: "their Series A announcement vs my ramen budget. the comparison trap is real.\nwe're building BiteClub at our own pace. and it's working. link in bio.\n#comparisontrap #founderlife #startuplife #realtalk #biteclub #mentalhealth",
  best_advice: "the best advice i got this year. one sentence that changed how i build everything.\napplying it to BiteClub every day. try the app and see for yourself — download BiteClub.\n#bestadvice #founderlife #startupadvice #growthmindset #biteclub #buildinpublic",
  lonely_founder: "nobody talks about how lonely this is. building something from nothing, mostly alone.\nbut every time someone cooks with BiteClub, it's less alone. try it — link in bio.\n#loneliness #founderlife #realtalk #mentalhealth #biteclub #startuplife",
  first_paying_user: "the day someone actually paid for our app. the notification sound became my favorite sound.\nBiteClub — the cooking app people are willing to pay for. try it free first. download BiteClub.\n#firstrevenue #startuplife #buildinpublic #milestone #biteclub #payingcustomer",
};

// ── Page component ───────────────────────────────────────────────────────────

export default function DayInLifePage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const q = search.toLowerCase();
  const filtered = q
    ? PRESETS.filter(
        (p) =>
          p.label.toLowerCase().includes(q) ||
          p.desc.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
    : activeCategory
    ? PRESETS.filter((p) => p.category === activeCategory)
    : PRESETS;

  const groupedByCategory = filtered.reduce<Record<string, ContentPreset[]>>((acc, p) => {
    (acc[p.category] ||= []).push(p);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/streams" className="hover:text-gray-600 transition-colors">
            Streams
          </Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">Day in the Life</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{'\u{1F3AC}'}</span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Day in the Life</h1>
          </div>
          <p className="text-sm text-gray-500">
            Behind-the-scenes founder content. What it looks like building a food app — dev life, cooking tests, real moments.
          </p>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (e.target.value) setActiveCategory(null);
            }}
            placeholder="Search content ideas..."
            className="w-full max-w-md px-4 py-2.5 bg-white rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 placeholder:text-gray-400"
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          <button
            onClick={() => { setActiveCategory(null); setSearch(''); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !activeCategory && !search ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            All ({PRESETS.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = PRESETS.filter((p) => p.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setSearch(''); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activeCategory === cat.id ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                <span>{cat.emoji}</span>
                {cat.label}
                <span className="opacity-50">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Content grid */}
        {Object.keys(groupedByCategory).length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-400">
            No content ideas found for &ldquo;{search}&rdquo;
          </div>
        ) : (
          Object.entries(groupedByCategory).map(([catId, presets]) => {
            const cat = CATEGORIES.find((c) => c.id === catId);
            return (
              <div key={catId} className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm">{cat?.emoji}</span>
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {cat?.label}
                  </h2>
                  <span className="text-xs text-gray-300">{presets.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {presets.map((preset) => {
                    const isExpanded = expandedId === preset.id;
                    const caption = TIKTOK_CAPTIONS[preset.id];
                    return (
                      <div
                        key={preset.id}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all"
                      >
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : preset.id)}
                          className="w-full text-left p-4"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl flex-shrink-0">{preset.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 leading-snug">{preset.label}</p>
                              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{preset.desc}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${cat?.color || 'bg-gray-100 text-gray-600'}`}>
                              {cat?.label}
                            </span>
                            <span className="text-[11px] text-gray-400 flex items-center gap-1">
                              {isExpanded ? 'Hide' : 'Caption'}
                              <svg
                                viewBox="0 0 16 16"
                                className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M4 6l4 4 4-4" />
                              </svg>
                            </span>
                          </div>
                        </button>

                        {/* Expanded caption */}
                        {isExpanded && caption && (
                          <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                            <div className="flex items-center gap-1.5 mb-2">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">TikTok Caption</span>
                              <button
                                onClick={() => navigator.clipboard.writeText(caption)}
                                className="text-[10px] text-blue-500 hover:text-blue-700 font-medium transition-colors"
                              >
                                Copy
                              </button>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{caption}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}

        {/* Footer stats */}
        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-gray-400">
          <span><strong className="text-gray-600">{PRESETS.length}</strong> content ideas</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span><strong className="text-gray-600">{CATEGORIES.length}</strong> categories</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span>Behind-the-scenes founder content</span>
        </div>
      </main>
    </div>
  );
}
