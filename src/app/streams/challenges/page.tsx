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
  { id: 'fridge', label: 'Fridge Challenges', emoji: '\u{1F9CA}', color: 'text-cyan-600 bg-cyan-50' },
  { id: 'budget', label: 'Budget Battles', emoji: '\u{1F4B5}', color: 'text-green-600 bg-green-50' },
  { id: 'speed', label: 'Speed Runs', emoji: '\u23F1\uFE0F', color: 'text-orange-600 bg-orange-50' },
  { id: 'taste', label: 'Taste Tests', emoji: '\u{1F9C0}', color: 'text-amber-600 bg-amber-50' },
  { id: 'viewer', label: 'Viewer Challenges', emoji: '\u{1F4AC}', color: 'text-purple-600 bg-purple-50' },
] as const;

const PRESETS: ContentPreset[] = [
  // ── Fridge Challenges ──
  { id: 'rate_my_fridge', label: 'Rate My Fridge', emoji: '\u{1F9CA}', desc: 'Open the fridge and let TikTok judge. No hiding.', category: 'fridge' },
  { id: 'cook_whats_left', label: 'Cook With What is Left', emoji: '\u{1F373}', desc: 'Only using what is currently in the fridge. No shopping allowed.', category: 'fridge' },
  { id: 'mystery_ingredient', label: 'Mystery Ingredient Challenge', emoji: '\u2753', desc: 'Spin a wheel, cook whatever it lands on', category: 'fridge' },
  { id: 'fridge_cleanout', label: 'Fridge Cleanout Meal', emoji: '\u{1F5D1}\uFE0F', desc: 'Everything about to expire goes into one dish', category: 'fridge' },
  { id: 'blindfold_grab', label: 'Blindfold Fridge Grab', emoji: '\u{1F9D1}\u200D\u{1F9AF}', desc: 'Reach in blind. Cook with whatever you touch first.', category: 'fridge' },
  { id: 'organize_rate', label: 'Fridge Organization Tier List', emoji: '\u{1F4CA}', desc: 'S-tier to F-tier fridge organization rating', category: 'fridge' },
  { id: 'empty_fridge_meal', label: 'Almost Empty Fridge Meal', emoji: '\u{1F4AD}', desc: '3 ingredients or less. Make it work.', category: 'fridge' },

  // ── Budget Battles ──
  { id: 'five_dollar_meal', label: '$5 Meal Challenge', emoji: '\u{1F4B5}', desc: 'Full dinner for $5. Every cent counts.', category: 'budget' },
  { id: 'one_dollar_ingredient', label: '$1 Per Ingredient', emoji: '\u{1F4B2}', desc: 'Each ingredient must cost $1 or less. No exceptions.', category: 'budget' },
  { id: 'grocery_store_dash', label: 'Grocery Store Speed Run', emoji: '\u{1F3C3}', desc: '5 minutes in the store. Whatever you grab, you cook.', category: 'budget' },
  { id: 'dollar_store_gourmet', label: 'Dollar Store Gourmet', emoji: '\u{1F451}', desc: 'Making a restaurant-quality meal from the dollar store', category: 'budget' },
  { id: 'ten_vs_hundred', label: '$10 vs $100 Meal', emoji: '\u2696\uFE0F', desc: 'Same dish, two budgets. Can you tell the difference?', category: 'budget' },
  { id: 'weekly_budget', label: '$25 Weekly Grocery Challenge', emoji: '\u{1F4B0}', desc: 'One week of meals on a $25 budget', category: 'budget' },
  { id: 'no_buy_week', label: 'No Grocery Shopping for a Week', emoji: '\u{1F6AB}', desc: 'Survive on what you already have. Zero spending.', category: 'budget' },
  { id: 'vending_machine_meal', label: 'Vending Machine Meal', emoji: '\u{1F35F}', desc: 'Making a full meal from vending machine items only', category: 'budget' },

  // ── Speed Runs ──
  { id: '15_min_dinner', label: '15-Minute Dinner', emoji: '\u23F1\uFE0F', desc: 'Timer starts now. Full meal. Go.', category: 'speed' },
  { id: 'one_pot_speed', label: 'One-Pot Speed Cook', emoji: '\u{1F372}', desc: 'One pot. One burner. How fast can you go?', category: 'speed' },
  { id: 'microwave_gourmet', label: 'Microwave Gourmet', emoji: '\u{1F4A5}', desc: 'Making something actually good using only a microwave', category: 'speed' },
  { id: 'speed_vs_friend', label: 'Speed Cook vs My Friend', emoji: '\u{1F3C1}', desc: 'Same recipe, who finishes first?', category: 'speed' },
  { id: 'no_stove_meal', label: 'No Stove, No Oven Challenge', emoji: '\u274C', desc: 'Full meal without any traditional cooking equipment', category: 'speed' },
  { id: 'instant_ramen_upgrade', label: 'Instant Ramen Upgrade Race', emoji: '\u{1F35C}', desc: 'Start with instant ramen. 10 minutes to make it restaurant-worthy.', category: 'speed' },
  { id: 'one_hand_cooking', label: 'One Hand Cooking Challenge', emoji: '\u270B', desc: 'Cook an entire meal with only one hand', category: 'speed' },

  // ── Taste Tests ──
  { id: 'blind_taste_test', label: 'Blind Taste Test', emoji: '\u{1F441}\uFE0F', desc: 'Blindfolded. Can you guess what you are eating?', category: 'taste' },
  { id: 'brand_vs_generic', label: 'Brand vs Generic', emoji: '\u{1F3F7}\uFE0F', desc: 'Premium brand vs store brand. Is it worth the price?', category: 'taste' },
  { id: 'homemade_vs_store', label: 'Homemade vs Store-Bought', emoji: '\u{1F3EA}', desc: 'Side by side. Honest reactions only.', category: 'taste' },
  { id: 'expensive_vs_cheap', label: 'Cheap vs Expensive', emoji: '\u{1F48E}', desc: '$2 chocolate vs $20 chocolate. Can you tell?', category: 'taste' },
  { id: 'gas_station_taste', label: 'Gas Station Food Rating', emoji: '\u26FD', desc: 'Rating every food item at a gas station', category: 'taste' },
  { id: 'international_snacks', label: 'International Snack Tier List', emoji: '\u{1F30D}', desc: 'Trying snacks from 10 different countries', category: 'taste' },
  { id: 'ai_recipe_taste', label: 'AI-Generated Recipe Taste Test', emoji: '\u{1F916}', desc: 'ChatGPT made a recipe. Is it actually edible?', category: 'taste' },
  { id: 'kids_vs_chefs', label: 'Kids Rate vs Chefs Rate', emoji: '\u{1F476}', desc: 'Same dish. Wildly different opinions.', category: 'taste' },

  // ── Viewer Challenges ──
  { id: 'comment_decides', label: 'Comments Decide My Dinner', emoji: '\u{1F4AC}', desc: 'Top comment picks tonight is meal. No veto.', category: 'viewer' },
  { id: 'most_liked_recipe', label: 'Most Liked Recipe Gets Cooked', emoji: '\u2764\uFE0F', desc: 'Drop a recipe in comments. Most likes wins.', category: 'viewer' },
  { id: 'duet_cook_along', label: 'Duet Cook-Along', emoji: '\u{1F91D}', desc: 'You cook it, I cook it. Duet the result.', category: 'viewer' },
  { id: 'worst_combo', label: 'You Pick the Worst Combo, I Cook It', emoji: '\u{1F922}', desc: 'Viewers choose the most cursed ingredient combination', category: 'viewer' },
  { id: 'rate_my_meal', label: 'Rate My Meal 1-10', emoji: '\u2B50', desc: 'Post it. Let TikTok be brutally honest.', category: 'viewer' },
  { id: 'guess_the_price', label: 'Guess the Grocery Total', emoji: '\u{1F4B3}', desc: 'How much did this cart cost? Comment your guess.', category: 'viewer' },
  { id: 'recreate_follower', label: 'Recreating a Follower is Meal', emoji: '\u{1F4F1}', desc: 'A follower sends a photo. I try to recreate it.', category: 'viewer' },
];

// ── TikTok captions ──────────────────────────────────────────────────────────

const TIKTOK_CAPTIONS: Record<string, string> = {
  // FRIDGE
  rate_my_fridge: "rate my fridge. be honest. i can take it.\nsave your own fridge experiments as recipes on BiteClub — even the weird ones deserve a spot. link in bio.\n#ratemyfridge #fridgetour #cookingtok #foodtok #biteclub #fridgechallenge",
  cook_whats_left: "rules: only what's in the fridge right now. no shopping. let's see what happens.\nlog whatever you make on BiteClub — your cooking streak doesn't care how fancy it is. download BiteClub.\n#fridgechallenge #cookwithme #noshoppingchallenge #homecooking #biteclub #whatsinmyfridge",
  mystery_ingredient: "spun the wheel. landed on... this. i have to cook with it. no take-backs.\npost your own mystery ingredient results on BiteClub — your Flavor Palate is about to get interesting. link in bio.\n#mysteryingredient #cookingchallenge #spinthewheel #foodtok #biteclub #cookingtok",
  fridge_cleanout: "everything about to expire. one dish. zero waste. let's go.\ntrack your zero-waste meals on BiteClub — your cooking history shows how resourceful you actually are. try BiteClub free.\n#zerowaste #fridgecleanout #cookwithme #budgetcooking #biteclub #foodwaste",
  blindfold_grab: "blindfolded. reached into the fridge. cooking whatever i touched first.\nlog the chaos on BiteClub. your Flavor Palate doesn't judge. link in bio.\n#blindfoldchallenge #fridgechallenge #cookingtok #randomcooking #biteclub #foodchallenge",
  organize_rate: "rating fridge organization from S-tier to absolute disaster. where does yours rank?\norganize your recipes first — build cookbooks on BiteClub so your kitchen follows. download BiteClub.\n#fridgeorganization #tierlist #kitchentok #organization #biteclub #fridgetour",
  empty_fridge_meal: "3 ingredients. almost empty fridge. making it work anyway.\nsave your \"almost nothing\" recipes on BiteClub — they're the ones you'll actually use most. link in bio.\n#almostemptyfridge #3ingredients #budgetmeals #homecooking #biteclub #cookingtok",

  // BUDGET
  five_dollar_meal: "$5. full dinner. every single cent accounted for.\ntrack your budget meals on BiteClub — your cooking history is proof you don't need delivery apps. download BiteClub.\n#5dollarmeal #budgetcooking #cheapmeals #foodchallenge #biteclub #moneysaving",
  one_dollar_ingredient: "every ingredient has to cost $1 or less. no exceptions. let's see how fancy we can get.\nsave the budget winners to a cookbook on BiteClub. the \"Under $1 Per Ingredient\" cookbook goes hard. link in bio.\n#dollarchallenge #budgetcooking #cheapfood #foodchallenge #biteclub #savemoney",
  grocery_store_dash: "5 minutes in the store. grab what you can. cook whatever you got.\npost the result on BiteClub — chaotic grocery runs count as real cooking. try BiteClub free.\n#grocerychallenge #speedrun #foodchallenge #cookingtok #biteclub #groceryhaul",
  dollar_store_gourmet: "dollar store ingredients only. making it look and taste like a restaurant.\npin your best budget flex to your BiteClub profile — let people know you cook good on any budget. link in bio.\n#dollarstore #gourmet #budgetcooking #foodchallenge #biteclub #cheapgourmet",
  ten_vs_hundred: "$10 meal vs $100 meal. same dish. can anyone actually tell the difference?\nlog both on BiteClub with ratings — let the stars do the talking. download BiteClub.\n#cheapvsexpensive #foodcomparison #tastetest #foodchallenge #biteclub #budgetvsluxury",
  weekly_budget: "$25 for an entire week of groceries. every meal planned. every dollar stretched.\nbuild your weekly meal plan on BiteClub first — a cookbook called \"$25 Week\" hits different. link in bio.\n#mealprep #budgetmeals #weeklygrocery #cheapmeals #biteclub #mealplanning",
  no_buy_week: "no grocery shopping for an entire week. surviving on what's already in the kitchen.\nlog every survival meal on BiteClub — your cooking streak respects the hustle. try BiteClub free.\n#nobuychallenge #pantrymeals #zerospend #budgetcooking #biteclub #frugalliving",
  vending_machine_meal: "making a full meal using only vending machine items. this is either genius or a crime.\npost the result on BiteClub. the community needs to see this. link in bio.\n#vendingmachine #foodchallenge #cursedcooking #foodtok #biteclub #cookingtok",

  // SPEED
  '15_min_dinner': "15 minutes on the clock. full dinner. timer starts NOW.\npost your speed runs on BiteClub — your cooking history tracks how fast you're getting. download BiteClub.\n#15minutemeal #speedcooking #quickdinner #cookingtok #biteclub #fastfood",
  one_pot_speed: "one pot. one burner. how fast can i make something actually good?\nsave your best one-pot recipes to a BiteClub cookbook. the lazy genius collection. link in bio.\n#onepotmeal #speedcooking #easydinner #homecooking #biteclub #quickrecipes",
  microwave_gourmet: "microwave only. making something that doesn't look like a war crime.\nyour BiteClub Flavor Palate updates even from microwave meals. no judgment. try BiteClub free.\n#microwavecooking #microwave #foodchallenge #cookingtok #biteclub #lazycooking",
  speed_vs_friend: "same recipe. head to head. whoever finishes first wins. 3, 2, 1, GO.\nlog the winning time on BiteClub. flex the speed in your cooking history. link in bio.\n#speedchallenge #cookoff #friendchallenge #cookingtok #biteclub #competition",
  no_stove_meal: "no stove. no oven. still making a full meal. is that even possible?\npost your no-heat creations on BiteClub — innovation counts as cooking. download BiteClub.\n#nostove #nooven #rawfood #foodchallenge #biteclub #cookingtok",
  instant_ramen_upgrade: "starting with instant ramen. 10 minutes to make it restaurant-worthy. can it be done?\nsave your best ramen upgrades on BiteClub. the \"Ramen Glow-Ups\" cookbook is needed. link in bio.\n#instantramen #ramenupgrade #foodhack #cookingtok #biteclub #ramenlover",
  one_hand_cooking: "cooking an entire meal with one hand. this is way harder than it sounds.\nlog the result on BiteClub. the cooking streak doesn't care how many hands you used. try BiteClub free.\n#onehandchallenge #cookingchallenge #hardmode #cookingtok #biteclub #foodchallenge",

  // TASTE
  blind_taste_test: "blindfolded. can i guess what i'm eating? the results are embarrassing.\npost your own taste test results on BiteClub — your Flavor Palate might know better than your actual palate. link in bio.\n#blindtastetest #tastetest #foodchallenge #cookingtok #biteclub #foodtok",
  brand_vs_generic: "premium brand vs store brand. same product. is it actually worth double the price?\nsave the winners to your BiteClub cookbook — know what's actually worth buying. download BiteClub.\n#brandvsgeneric #tastetest #grocerytips #savemoney #biteclub #foodcomparison",
  homemade_vs_store: "homemade vs store-bought. side by side. honest reactions.\nif homemade wins, save the recipe on BiteClub. that's why the app exists. link in bio.\n#homemadevsstore #tastetest #fromscratch #cookingtok #biteclub #honestfood",
  expensive_vs_cheap: "$2 version vs $20 version. same type of food. can you actually tell the difference?\nrate both on BiteClub with star ratings — let the data decide. try BiteClub free.\n#cheapvsexpensive #tastetest #foodcomparison #foodtok #biteclub #isthereanydifference",
  gas_station_taste: "rating every single food item at a gas station. some of these are crimes against cooking.\nafter this you'll want to cook at home. start your cooking streak on BiteClub. link in bio.\n#gasstationfood #foodrating #tierlist #junkfood #biteclub #foodreview",
  international_snacks: "trying snacks from 10 different countries. some are incredible. some are... an experience.\nevery country you taste adds context to your BiteClub Cuisines Cooked map. download BiteClub.\n#internationalsnacks #snackreview #worldfood #tastetest #biteclub #globalfood",
  ai_recipe_taste: "asked AI to generate a recipe. cooked it. here's the honest review.\nthe recipes on BiteClub are from real humans who actually cooked them. just saying. link in bio.\n#airecipe #chatgpt #foodexperiment #tastetest #biteclub #aigeneratedrecipe",
  kids_vs_chefs: "gave the same dish to kids and to experienced cooks. the ratings are wildly different.\npost your own dishes on BiteClub and let the community rate them. try BiteClub free.\n#kidsvschefs #tastetest #foodreview #cookingtok #biteclub #honestopinions",

  // VIEWER
  comment_decides: "top comment decides what i eat tonight. no veto. no take-backs. let's go.\nlog whatever cursed meal you guys choose on BiteClub — my cooking history is your fault now. link in bio.\n#commentsdecide #youchoose #foodchallenge #interactive #biteclub #cookingtok",
  most_liked_recipe: "drop your recipe in the comments. most likes wins. i cook it tomorrow.\nimport the winning recipe to BiteClub from anywhere — that's how community cookbooks get built. download BiteClub.\n#mostliked #recipechallenge #communitycooking #interactive #biteclub #crowdsource",
  duet_cook_along: "you cook it. i cook it. duet the results. let's see who did it better.\ncook along and log yours on BiteClub — same recipe, different kitchens, both count. link in bio.\n#duetchallenge #cookalong #duetcooking #cookingtok #biteclub #cookwithme",
  worst_combo: "you picked the ingredients. i have to cook them. this might be a mistake.\npost whatever comes out of this on BiteClub. the cooking streak accepts all outcomes. try BiteClub free.\n#worstcombo #cursedcooking #youdecide #foodchallenge #biteclub #cookingtok",
  rate_my_meal: "cooked this. need honest ratings. 1 to 10. be brutal.\npost your meals on BiteClub and get real ratings — star system, no sugarcoating. link in bio.\n#ratemymeal #honestrating #foodreview #cookingtok #biteclub #ratethis",
  guess_the_price: "how much did this grocery cart cost? drop your guess in comments. closest wins.\nplan your groceries better with BiteClub meal planning — build a cookbook, then shop. download BiteClub.\n#guesstheprice #grocerytok #foodchallenge #interactive #biteclub #groceryshopping",
  recreate_follower: "a follower sent me this photo. i'm trying to recreate their meal from a picture alone.\nimport recipes from your followers on BiteClub — the Discovery feed is full of inspo. link in bio.\n#recreatechallenge #cookwithme #followercooking #cookingtok #biteclub #foodchallenge",
};

// ── Page component ───────────────────────────────────────────────────────────

export default function ChallengesPage() {
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
          <span className="text-gray-700 font-medium">Food Challenges</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{'\u{1F525}'}</span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Food Challenges</h1>
          </div>
          <p className="text-sm text-gray-500">
            Interactive engagement content. Fridge raids, budget battles, speed runs, taste tests, and viewer-driven challenges.
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
            placeholder="Search challenges..."
            className="w-full max-w-md px-4 py-2.5 bg-white rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 placeholder:text-gray-400"
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
            No challenges found for &ldquo;{search}&rdquo;
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
          <span><strong className="text-gray-600">{PRESETS.length}</strong> challenge ideas</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span><strong className="text-gray-600">{CATEGORIES.length}</strong> categories</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span>Interactive engagement content</span>
        </div>
      </main>
    </div>
  );
}
