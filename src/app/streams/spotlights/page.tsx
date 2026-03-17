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
  { id: 'cook_week', label: 'Cook of the Week', emoji: '\u{1F468}\u200D\u{1F373}', color: 'text-amber-600 bg-amber-50' },
  { id: 'glowup', label: 'Meal Glow-Ups', emoji: '\u{1F4AB}', color: 'text-pink-600 bg-pink-50' },
  { id: 'community', label: 'Community Recipes', emoji: '\u{1F91D}', color: 'text-blue-600 bg-blue-50' },
  { id: 'streaks', label: 'Streak Heroes', emoji: '\u{1F525}', color: 'text-orange-600 bg-orange-50' },
  { id: 'global', label: 'Global Kitchen', emoji: '\u{1F30D}', color: 'text-emerald-600 bg-emerald-50' },
] as const;

const PRESETS: ContentPreset[] = [
  // ── Cook of the Week ──
  { id: 'cotw_intro', label: 'Introducing Cook of the Week', emoji: '\u{1F3C6}', desc: 'The format — why we spotlight one real cook every week', category: 'cook_week' },
  { id: 'cotw_first_meal', label: 'Their First Meal on BiteClub', emoji: '\u{1F373}', desc: 'Where it all started — the dish that kicked off the journey', category: 'cook_week' },
  { id: 'cotw_top_dish', label: 'Their Most-Cooked Dish', emoji: '\u2B50', desc: 'The recipe they keep coming back to and why', category: 'cook_week' },
  { id: 'cotw_cooking_style', label: 'Their Cooking Style in 3 Words', emoji: '\u{1F3A8}', desc: 'How they describe themselves in the kitchen', category: 'cook_week' },
  { id: 'cotw_advice', label: 'Their #1 Cooking Tip', emoji: '\u{1F4A1}', desc: 'One piece of advice from a real home cook', category: 'cook_week' },
  { id: 'cotw_kitchen_tour', label: 'A Peek Into Their Kitchen', emoji: '\u{1F3E0}', desc: 'Real kitchens, real setups, no staging', category: 'cook_week' },

  // ── Meal Glow-Ups ──
  { id: 'glowup_month_one', label: 'Month 1 vs Month 6', emoji: '\u{1F4C8}', desc: 'Same person, same dish, massive improvement', category: 'glowup' },
  { id: 'glowup_plating', label: 'Plating Glow-Up', emoji: '\u{1F37D}\uFE0F', desc: 'When the food was always good but the plate finally caught up', category: 'glowup' },
  { id: 'glowup_first_last', label: 'First Cook vs Latest Cook', emoji: '\u{1F504}', desc: 'Side-by-side of day one vs today', category: 'glowup' },
  { id: 'glowup_technique', label: 'Technique Transformation', emoji: '\u{1F52A}', desc: 'The skill that took months to click', category: 'glowup' },
  { id: 'glowup_confidence', label: 'From Recipe Follower to Improviser', emoji: '\u{1F3B6}', desc: 'When they stopped measuring and started feeling it', category: 'glowup' },
  { id: 'glowup_story', label: 'The Glow-Up Story Behind the Photo', emoji: '\u{1F4F8}', desc: 'One photo, one paragraph — the full journey in a single post', category: 'glowup' },

  // ── Community Recipes ──
  { id: 'community_trending', label: 'Trending on Discovery This Week', emoji: '\u{1F4C8}', desc: 'The recipes getting the most love on BiteClub right now', category: 'community' },
  { id: 'community_underrated', label: 'Most Underrated Community Recipe', emoji: '\u{1F48E}', desc: 'A gem from the Discovery feed that deserves more eyes', category: 'community' },
  { id: 'community_unexpected', label: 'The Most Unexpected Combo That Worked', emoji: '\u{1F92F}', desc: 'A community recipe with ingredients nobody would have guessed', category: 'community' },
  { id: 'community_easy', label: 'Community is Easiest 5-Star Meal', emoji: '\u{1F31F}', desc: 'Highly rated, stupidly simple — from a real user', category: 'community' },
  { id: 'community_remix', label: 'Remix of a Classic by a User', emoji: '\u{1F3B5}', desc: 'A community member put a twist on a classic and it slaps', category: 'community' },
  { id: 'community_debate', label: 'Community Recipe That Divided the Feed', emoji: '\u2694\uFE0F', desc: 'Some loved it. Some hated it. The comments were chaos.', category: 'community' },
  { id: 'community_1_ingredient', label: 'The 1-Ingredient Swap That Changed Everything', emoji: '\u{1F4A5}', desc: 'A community tip that upgraded a basic recipe to something special', category: 'community' },

  // ── Streak Heroes ──
  { id: 'streak_30_day', label: '30-Day Cooking Streak', emoji: '\u{1F525}', desc: 'Spotlighting someone who cooked every day for a month', category: 'streaks' },
  { id: 'streak_100_meals', label: '100 Meals Logged', emoji: '\u{1F4AF}', desc: 'The moment someone crosses triple digits', category: 'streaks' },
  { id: 'streak_comeback', label: 'The Streak Comeback', emoji: '\u{1F504}', desc: 'They lost their streak and rebuilt it even longer', category: 'streaks' },
  { id: 'streak_family', label: 'Family Streak Challenge', emoji: '\u{1F46A}', desc: 'A whole household cooking together daily', category: 'streaks' },
  { id: 'streak_weeknight', label: 'Weeknight Warrior', emoji: '\u{1F5E1}\uFE0F', desc: 'Cooked every weeknight for 3 months straight', category: 'streaks' },
  { id: 'streak_what_changed', label: 'What Changed After 60 Days of Cooking', emoji: '\u{1F9EC}', desc: 'Real talk about habits, health, and wallet changes', category: 'streaks' },

  // ── Global Kitchen ──
  { id: 'global_sweden', label: 'Cooking From Sweden', emoji: '\u{1F1F8}\u{1F1EA}', desc: 'Featuring a Swedish BiteClub user and their staple dishes', category: 'global' },
  { id: 'global_india', label: 'Cooking From India', emoji: '\u{1F1EE}\u{1F1F3}', desc: 'Spice, color, and tradition from an Indian home kitchen', category: 'global' },
  { id: 'global_mexico', label: 'Cooking From Mexico', emoji: '\u{1F1F2}\u{1F1FD}', desc: 'Authentic Mexican home cooking, not the Tex-Mex version', category: 'global' },
  { id: 'global_japan', label: 'Cooking From Japan', emoji: '\u{1F1EF}\u{1F1F5}', desc: 'Precision, simplicity, and umami from a Japanese kitchen', category: 'global' },
  { id: 'global_nigeria', label: 'Cooking From Nigeria', emoji: '\u{1F1F3}\u{1F1EC}', desc: 'Bold flavors and jollof debates from a Nigerian cook', category: 'global' },
  { id: 'global_italy', label: 'Cooking From Italy', emoji: '\u{1F1EE}\u{1F1F9}', desc: 'Simple ingredients, zero shortcuts — Italian home cooking', category: 'global' },
  { id: 'global_crossover', label: 'When Cuisines Collide', emoji: '\u{1F30F}', desc: 'A user who fuses two cultures into one dish', category: 'global' },
];

// ── TikTok captions ──────────────────────────────────────────────────────────

const TIKTOK_CAPTIONS: Record<string, string> = {
  // COOK OF THE WEEK
  cotw_intro: "every week we spotlight a real BiteClub cook. no influencers. no sponsorships. just someone who actually cooks.\napply by cooking on BiteClub — your profile is your audition. link in bio.\n#cookoftheweek #homecooking #realcooks #community #biteclub #spotlight",
  cotw_first_meal: "this is the very first meal they ever logged on BiteClub. everyone starts somewhere.\nlog your first meal on BiteClub today — your cooking journey starts with one post. download BiteClub.\n#firstmeal #cookingjourney #startcooking #homecooking #biteclub #cookoftheweek",
  cotw_top_dish: "their most-cooked dish. the one they keep coming back to. we all have one.\nfind yours in your BiteClub Cooking History — the one you've made the most times tells a story. link in bio.\n#signaturerecipe #mostcooked #homecooking #comfortfood #biteclub #cookoftheweek",
  cotw_cooking_style: "we asked them to describe their cooking style in 3 words. the answer was perfect.\nwhat's your Type of Cook badge on BiteClub? it updates as your cooking history grows. try BiteClub free.\n#cookingstyle #typeofcook #identity #homecooking #biteclub #cookoftheweek",
  cotw_advice: "one piece of cooking advice from this week's featured cook. simple but it hits.\nshare your own tip on BiteClub — post a recipe and tell people what you learned making it. link in bio.\n#cookingtip #bestadvice #homecooking #learntocook #biteclub #cookoftheweek",
  cotw_kitchen_tour: "no ring lights. no marble countertops. just a real kitchen where real food gets made.\nshow your kitchen by cooking in it — post on BiteClub. your space tells your story. download BiteClub.\n#kitchentour #realkitchen #homecooking #nofilterkitchen #biteclub #cookoftheweek",

  // MEAL GLOW-UPS
  glowup_month_one: "month 1 vs month 6. same person. same recipe. completely different result.\nstart logging on BiteClub now so you can look back later and see the glow-up. link in bio.\n#cookingglowup #progress #beforeandafter #homecooking #biteclub #transformation",
  glowup_plating: "the food was always good. the plating finally caught up. this is what practice looks like.\nyour BiteClub profile shows your best dishes — pin the ones that prove how far you've come. try BiteClub free.\n#plating #foodpresentation #glowup #homecooking #biteclub #cookingtok",
  glowup_first_last: "first cook vs latest cook. side by side. the improvement is wild.\nyour BiteClub Cooking History is the visual proof — scroll back to day one and prepare to be surprised. link in bio.\n#firstcookvslast #cookingprogress #beforeafter #homecooking #biteclub #glowup",
  glowup_technique: "the technique that took months to click. then one day it just... worked.\ntrack your cooking milestones on BiteClub — your history shows when the breakthroughs happened. download BiteClub.\n#cookingtechnique #skillbuilding #practice #homecooking #biteclub #glowup",
  glowup_confidence: "they stopped following recipes and started improvising. that's when it clicked.\nyour BiteClub Flavor Palate shows what you gravitate toward — use it as your improv compass. link in bio.\n#cookingconfidence #nomoremeasuring #instinct #homecooking #biteclub #glowup",
  glowup_story: "one photo. one paragraph. their full cooking glow-up in a single post.\npost your glow-up on BiteClub — photo, caption, star rating. that's your story in the Discovery feed. try BiteClub free.\n#glowupstory #cookingjourney #onephoto #homecooking #biteclub #transformation",

  // COMMUNITY RECIPES
  community_trending: "these are the most-saved recipes on BiteClub this week. the community has good taste.\ndiscover what's trending on BiteClub's Discovery feed right now — link in bio.\n#trending #communityrecipes #discoveryfeed #homecooking #biteclub #whatscooking",
  community_underrated: "this recipe from the Discovery feed deserved 10x the attention. time to fix that.\nbrowse the underrated gems on BiteClub — sort by newest and find what others missed. download BiteClub.\n#underrated #hiddengem #communityrecipe #homecooking #biteclub #discoveryfeed",
  community_unexpected: "nobody would have guessed these ingredients work together. but a BiteClub user proved it.\npost your own experimental combos on BiteClub — the weirdest ideas sometimes taste the best. link in bio.\n#unexpectedcombo #foodexperiment #surpriserecipe #homecooking #biteclub #communitycooking",
  community_easy: "highly rated. stupidly simple. from a real BiteClub user who just wanted dinner.\nfind more easy 5-star meals on BiteClub's Discovery feed. real people, real ratings. try BiteClub free.\n#easymeal #5star #simplecooking #quickrecipe #biteclub #communityrecipe",
  community_remix: "they took a classic recipe and twisted it into something new. the community loved it.\npost your own remixes on BiteClub — every twist adds to your Flavor Palate. link in bio.\n#reciperemix #foodtwist #classicrecipe #homecooking #biteclub #communitycooking",
  community_debate: "this recipe divided the BiteClub feed. some loved it. some had strong opinions. the comments were chaos.\njoin the conversation on BiteClub — post your own hot take recipe and let the community decide. download BiteClub.\n#fooddebate #controversialrecipe #hottake #homecooking #biteclub #communitycooking",
  community_1_ingredient: "one ingredient swap. that's it. and it changed the whole dish. a BiteClub user discovered this.\nshare your own secret swaps on BiteClub — the Discovery feed is where cooks teach each other. link in bio.\n#ingredientswap #cookinghack #oneswaprule #homecooking #biteclub #communitytip",

  // STREAK HEROES
  streak_30_day: "30 days of cooking. every single day. no skips. this is what discipline looks like in the kitchen.\nstart your own streak on BiteClub — the weekly calendar marks every day you cooked. try BiteClub free.\n#30daychallenge #cookingstreak #dailycooking #consistency #biteclub #streakhero",
  streak_100_meals: "100 meals logged on BiteClub. that's not a stat — that's a lifestyle change.\nlog your meals on BiteClub and watch the number grow — your Cooking History counts every single one. link in bio.\n#100meals #milestone #cookinghistory #homecooking #biteclub #streakhero",
  streak_comeback: "they lost a 45-day streak. most people would stop. they rebuilt it even longer.\nrebuild your streak on BiteClub — every day you cook, the calendar fills in. no shame in starting over. download BiteClub.\n#comeback #neverquit #cookingstreak #consistency #biteclub #streakhero",
  streak_family: "a whole family doing the cooking streak challenge together. the dinner table energy is unmatched.\nget your family on BiteClub — everyone logs meals, everyone builds streaks. link in bio.\n#familycooking #streakchallenge #cookingtogether #familygoals #biteclub #streakhero",
  streak_weeknight: "every weeknight for 3 months. no takeout on a Tuesday. no delivery on a Thursday. just cooking.\nyour BiteClub streak proves the weeknight warrior lifestyle — the calendar doesn't lie. try BiteClub free.\n#weeknightdinner #nocheating #homecooking #consistency #biteclub #streakhero",
  streak_what_changed: "60 days of cooking every day. here's what actually changed — habits, health, wallet, everything.\nstart the experiment yourself on BiteClub. 60 days. one meal a day. see what happens. link in bio.\n#60daychallenge #whatchanged #habitbuilding #homecooking #biteclub #streakhero",

  // GLOBAL KITCHEN
  global_sweden: "home cooking from sweden. less IKEA meatballs, more real everyday food.\nadd swedish recipes to your BiteClub Cuisines Cooked map — even if you've never been. download BiteClub.\n#swedishfood #scandinavian #homecooking #globalfood #biteclub #globalkitchen",
  global_india: "spice, color, and tradition from a real indian home kitchen. no restaurant shortcuts.\ncook your first indian recipe and add it to your BiteClub Cuisines Cooked map. link in bio.\n#indianfood #homecooking #spice #authenticfood #biteclub #globalkitchen",
  global_mexico: "authentic mexican home cooking. not the tex-mex version. the real thing.\ncook along and add mexico to your BiteClub Cuisines Cooked map. try BiteClub free.\n#mexicanfood #authenticmexican #homecooking #globalfood #biteclub #globalkitchen",
  global_japan: "precision. simplicity. umami. this is japanese home cooking, not restaurant food.\nadd japan to your Cuisines Cooked map on BiteClub — one recipe at a time. link in bio.\n#japanesefood #umami #homecooking #japanesecuisine #biteclub #globalkitchen",
  global_nigeria: "bold flavors and jollof debates from a nigerian kitchen. the heat is real.\ncook your first nigerian dish and watch the pin drop on your BiteClub Cuisines map. download BiteClub.\n#nigerianfood #jollofrice #westafricanfood #homecooking #biteclub #globalkitchen",
  global_italy: "simple ingredients. zero shortcuts. this is what italian home cooking actually looks like.\nadd italy to your Cuisines Cooked map on BiteClub. nonna would approve. link in bio.\n#italianfood #homecooking #pastafromscratch #authenticitalian #biteclub #globalkitchen",
  global_crossover: "when two cuisines collide in one dish. this BiteClub user fused cultures and it worked.\npost your own fusion experiments on BiteClub — multiple cuisine pins from one dish. try BiteClub free.\n#fusionfood #cuisinecollision #globalfood #homecooking #biteclub #globalkitchen",
};

// ── Page component ───────────────────────────────────────────────────────────

export default function SpotlightsPage() {
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
          <span className="text-gray-700 font-medium">User Spotlights</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{'\u2728'}</span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">User Spotlights</h1>
          </div>
          <p className="text-sm text-gray-500">
            Community-focused content. Feature real BiteClub users, celebrate cooking journeys, and showcase the global kitchen.
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
            placeholder="Search spotlights..."
            className="w-full max-w-md px-4 py-2.5 bg-white rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-400 placeholder:text-gray-400"
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
            No spotlights found for &ldquo;{search}&rdquo;
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
          <span><strong className="text-gray-600">{PRESETS.length}</strong> spotlight ideas</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span><strong className="text-gray-600">{CATEGORIES.length}</strong> categories</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span>Community-focused content</span>
        </div>
      </main>
    </div>
  );
}
