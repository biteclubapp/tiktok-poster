'use client';

import { useState, useRef, useEffect } from 'react';
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
  { id: 'budget', label: 'Budget Preps', emoji: '\u{1F4B0}', color: 'text-green-600 bg-green-50' },
  { id: 'time', label: 'Time Savers', emoji: '\u23F1\uFE0F', color: 'text-blue-600 bg-blue-50' },
  { id: 'diet', label: 'Diet Specific', emoji: '\u{1F957}', color: 'text-emerald-600 bg-emerald-50' },
  { id: 'beginner', label: 'Beginner Friendly', emoji: '\u{1F331}', color: 'text-amber-600 bg-amber-50' },
  { id: 'family', label: 'Family Sized', emoji: '\u{1F46A}', color: 'text-pink-600 bg-pink-50' },
] as const;

const PRESETS: ContentPreset[] = [
  // ── Budget Preps ──
  { id: 'thirty_dollar_week', label: '$30 Feeds You All Week', emoji: '\u{1F4B5}', desc: 'Full grocery list, 5 dinners, all under $30', category: 'budget' },
  { id: 'fifty_dollar_feast', label: '$50 Week: Eating Like Royalty', emoji: '\u{1F451}', desc: 'A week of meals that taste expensive but aren\'t', category: 'budget' },
  { id: 'student_survival', label: 'The Broke Student Meal Prep', emoji: '\u{1F393}', desc: 'Ramen is not a food group — real meals on a dorm budget', category: 'budget' },
  { id: 'rice_beans_empire', label: 'Rice & Beans: An Empire', emoji: '\u{1F35A}', desc: '7 completely different meals from the same base', category: 'budget' },
  { id: 'dollar_per_meal', label: '$1 Per Meal Challenge', emoji: '\u{1F4B8}', desc: 'Is it possible? We did the math and the cooking', category: 'budget' },
  { id: 'no_waste_prep', label: 'Zero Waste Meal Prep', emoji: '\u267B\uFE0F', desc: 'Use every ingredient twice — nothing hits the bin', category: 'budget' },
  { id: 'cheap_protein', label: 'High Protein on a Tight Budget', emoji: '\u{1F4AA}', desc: 'Eggs, lentils, chicken thighs — the holy trinity', category: 'budget' },

  // ── Time Savers ──
  { id: 'one_hour_prep', label: '1 Hour = 5 Days of Food', emoji: '\u{1F551}', desc: 'The full Sunday prep session, timed and tested', category: 'time' },
  { id: 'thirty_min_batch', label: '30-Minute Batch Cook', emoji: '\u26A1', desc: 'For people who think they don\'t have time to meal prep', category: 'time' },
  { id: 'freezer_meals', label: 'The Freezer Meal Starter Pack', emoji: '\u2744\uFE0F', desc: 'Cook once, eat for a month — the freezer is your friend', category: 'time' },
  { id: 'sheet_pan_prep', label: 'Sheet Pan Meal Prep Magic', emoji: '\u{1F4AB}', desc: 'Everything on one pan, oven does the work', category: 'time' },
  { id: 'slow_cooker_dump', label: 'Dump It in the Slow Cooker', emoji: '\u{1F372}', desc: '5 minutes of effort, 8 hours of patience, infinite meals', category: 'time' },
  { id: 'fifteen_min_lunches', label: '5 Lunches in 45 Minutes', emoji: '\u{1F96A}', desc: 'Pack them Sunday, forget about lunch all week', category: 'time' },
  { id: 'microwave_prep', label: 'Meal Prep That Microwaves Well', emoji: '\u{1F4A5}', desc: 'Not all preps reheat equal — these do', category: 'time' },

  // ── Diet Specific ──
  { id: 'high_protein_prep', label: 'High Protein Meal Prep (150g+/day)', emoji: '\u{1F969}', desc: 'Gym bro approved, actually tastes good', category: 'diet' },
  { id: 'vegetarian_prep', label: 'Vegetarian Meal Prep That Slaps', emoji: '\u{1F966}', desc: 'No sad salads — real meals, no meat needed', category: 'diet' },
  { id: 'low_carb_prep', label: 'Low Carb Prep Without Suffering', emoji: '\u{1F951}', desc: 'You won\'t even miss the rice (okay maybe a little)', category: 'diet' },
  { id: 'mediterranean_prep', label: 'Mediterranean Meal Prep Week', emoji: '\u{1F3D6}\uFE0F', desc: 'The world\'s healthiest diet, prepped for the week', category: 'diet' },
  { id: 'vegan_prep', label: 'Vegan Meal Prep for Real People', emoji: '\u{1F33F}', desc: 'Affordable, filling, and not just smoothie bowls', category: 'diet' },
  { id: 'keto_prep', label: 'Keto Meal Prep: Fat Is Your Friend', emoji: '\u{1F953}', desc: 'High fat, low carb, full week of meals', category: 'diet' },
  { id: 'balanced_macro_prep', label: 'The Balanced Macro Prep', emoji: '\u2696\uFE0F', desc: 'Protein, carbs, fats — all in the right ratio, all week', category: 'diet' },

  // ── Beginner Friendly ──
  { id: 'first_meal_prep', label: 'Meal Prep for People Who Hate Meal Prep', emoji: '\u{1F937}', desc: 'Start here if you\'ve never prepped before', category: 'beginner' },
  { id: 'starter_pack', label: 'The Meal Prep Starter Pack', emoji: '\u{1F4E6}', desc: 'Containers, tools, mindset — everything you need to begin', category: 'beginner' },
  { id: 'essential_equipment', label: '5 Things You Actually Need', emoji: '\u{1F52A}', desc: 'Skip the gadgets — these 5 items are all that matter', category: 'beginner' },
  { id: 'three_recipe_system', label: 'The 3-Recipe System', emoji: '\u{1F3AF}', desc: 'Master 3 recipes and you never run out of lunch again', category: 'beginner' },
  { id: 'common_mistakes', label: '7 Meal Prep Mistakes Everyone Makes', emoji: '\u{1F6A8}', desc: 'Soggy rice, bland chicken, forgotten containers — fixed', category: 'beginner' },
  { id: 'one_pot_prep', label: 'One-Pot Meal Prep for Beginners', emoji: '\u{1F372}', desc: 'One pot, one hour, five days of food', category: 'beginner' },
  { id: 'no_cook_prep', label: 'No-Cook Meal Prep', emoji: '\u{1F9CA}', desc: 'Afraid of the stove? These meals don\'t need heat', category: 'beginner' },

  // ── Family Sized ──
  { id: 'family_of_four', label: 'Meal Prep for a Family of 4', emoji: '\u{1F3E0}', desc: 'Feed the whole crew without cooking every night', category: 'family' },
  { id: 'kid_friendly', label: 'Kid-Approved Meal Prep', emoji: '\u{1F9D2}', desc: 'Meals they\'ll actually eat (tested by picky eaters)', category: 'family' },
  { id: 'school_lunches', label: 'School Lunch Prep That Beats the Cafeteria', emoji: '\u{1F392}', desc: 'Lunchboxes that come home empty', category: 'family' },
  { id: 'family_freezer', label: 'Family Freezer Stockpile', emoji: '\u{1F9CA}', desc: 'Build a freezer full of ready-to-go family dinners', category: 'family' },
  { id: 'picky_eater_prep', label: 'Meal Prep for Picky Eaters', emoji: '\u{1F612}', desc: 'Modular meals where everyone picks what they want', category: 'family' },
  { id: 'weekend_batch', label: 'The Weekend Family Batch Cook', emoji: '\u{1F468}\u200D\u{1F373}', desc: 'Cook together Saturday, eat easy all week', category: 'family' },
  { id: 'baby_toddler_prep', label: 'Baby & Toddler Meal Prep', emoji: '\u{1F476}', desc: 'Tiny portions, big nutrition — prep alongside your own meals', category: 'family' },
];

// ── TikTok captions ──────────────────────────────────────────────────────────

const TIKTOK_CAPTIONS: Record<string, string> = {
  // BUDGET
  thirty_dollar_week: "$30. one grocery run. five dinners. here's exactly what to buy.\nsave this list to a Meal Prep cookbook on BiteClub and pull it up every Sunday — link in bio.\n#mealprep #budgetmeals #30dollarweek #groceryhaul #biteclub #cheapmeals #mealplanning",
  fifty_dollar_feast: "$50 a week and eating better than most restaurants. the full plan is right here.\ntrack every meal you prep on BiteClub — your cooking streak proves the system works — download BiteClub.\n#mealprep #budgetfood #50dollarweek #eatcheap #biteclub #mealplanning #homecooking",
  student_survival: "college meal prep that isn't instant ramen. real food, real budget, real survival.\nimport these recipes to BiteClub and stop pretending cereal is dinner — link in bio.\n#studentmeals #collegelife #mealprep #brokebudget #biteclub #dormcooking #cheapmeals",
  rice_beans_empire: "rice and beans. 7 completely different meals. don't sleep on the basics.\nsave all 7 variations to a BiteClub cookbook — the base stays the same, the flavor changes everything — try BiteClub free.\n#riceandBeans #mealprep #budgetcooking #onepotmeal #biteclub #homecooking #mealideas",
  dollar_per_meal: "can you actually eat for $1 per meal? we tested it. the answer is wild.\nlog what you actually spent per meal on BiteClub and see where your money really goes — download BiteClub.\n#dollarmeal #budgetchallenge #cheapfood #mealprep #biteclub #foodchallenge #budgetmeals",
  no_waste_prep: "zero waste meal prep. every ingredient gets used twice. nothing hits the trash.\ntrack your zero-waste meals on BiteClub — your cooking history is also your sustainability record — link in bio.\n#zerowaste #mealprep #sustainability #nowaste #biteclub #mealplanning #ecofood",
  cheap_protein: "high protein meal prep on a tight budget. eggs, lentils, chicken thighs. the holy trinity.\nsave your best budget protein recipes to a BiteClub cookbook — that's your gym gains library — try BiteClub free.\n#highprotein #budgetmeals #mealprep #proteinmeals #biteclub #gymfood #cheapprotein",

  // TIME
  one_hour_prep: "1 hour on Sunday. 5 days of food. timed, tested, and repeatable.\npost your Sunday prep on BiteClub and keep the streak alive all week — download BiteClub.\n#mealprep #sundayprep #1hourprep #batchcooking #biteclub #mealplanning #timesaver",
  thirty_min_batch: "you have 30 minutes? you have meal prep. this is the no-excuse version.\nimport these quick-prep recipes to BiteClub and stop ordering delivery every Tuesday — link in bio.\n#30minutemeals #mealprep #quickprep #batchcooking #biteclub #easycooking #timesaver",
  freezer_meals: "the freezer meal starter pack. cook once, eat for a month. your freezer is doing nothing right now.\nsave your best freezer recipes to a BiteClub cookbook — pull it up when you're staring at an empty fridge — try BiteClub free.\n#freezermeals #mealprep #batchcooking #freezercooking #biteclub #mealplanning #makeahead",
  sheet_pan_prep: "one sheet pan. everything on it. oven does the work. this is meal prep for lazy geniuses.\nlog your sheet pan preps on BiteClub — one photo, one rating, five meals — download BiteClub.\n#sheetpan #mealprep #easycooking #onepan #biteclub #lazycooking #mealplanning",
  slow_cooker_dump: "5 minutes of effort. dump everything in the slow cooker. come back to 5 days of food.\nsave your best dump recipes to BiteClub and build a slow cooker cookbook that runs itself — link in bio.\n#slowcooker #crockpot #mealprep #dumpmeal #biteclub #easycooking #setandforget",
  fifteen_min_lunches: "5 lunches. 45 minutes. packed and done. forget about lunch for the rest of the week.\ntrack your lunch prep streak on BiteClub — every packed lunch counts — try BiteClub free.\n#lunchprep #mealprep #45minutes #packedlunch #biteclub #worklunch #mealplanning",
  microwave_prep: "not all meal preps reheat the same. these ones actually taste good on day 4.\nsave the recipes that microwave well to a BiteClub cookbook — skip the ones that turn to rubber — download BiteClub.\n#mealprep #microwave #reheat #lunchprep #biteclub #mealplanning #officelunch",

  // DIET
  high_protein_prep: "150g+ protein per day. all prepped. all actually delicious. gym bros come get your meals.\ntrack your protein-heavy preps on BiteClub — your Flavor Palate shifts when you eat with intention — link in bio.\n#highprotein #mealprep #gymfood #proteinmeals #biteclub #fitfood #macros",
  vegetarian_prep: "vegetarian meal prep that actually slaps. no sad salads. no apologies.\nsave your best veggie preps to a BiteClub cookbook and prove plants can carry the whole week — try BiteClub free.\n#vegetarian #mealprep #plantbased #veggiefood #biteclub #meatfree #mealplanning",
  low_carb_prep: "low carb meal prep that doesn't feel like punishment. you won't even miss the rice. mostly.\nlog your low carb preps on BiteClub — your cooking history tells the real diet story — download BiteClub.\n#lowcarb #mealprep #keto #lowcarbmeals #biteclub #healthyeating #carbfree",
  mediterranean_prep: "the Mediterranean diet. prepped for the whole week. the world's healthiest eating pattern, in containers.\nimport Mediterranean recipes to BiteClub and build a cookbook that's basically a prescription — link in bio.\n#mediterranean #mealprep #healthydiet #mediet #biteclub #healthyeating #mealplanning",
  vegan_prep: "vegan meal prep for real people. not influencer smoothie bowls. actual filling meals.\ntrack your vegan preps on BiteClub — your Cuisines Cooked map grows every time you explore — try BiteClub free.\n#vegan #mealprep #plantbased #veganfood #biteclub #veganmeals #mealplanning",
  keto_prep: "keto meal prep. high fat, low carb, full week of meals. your body will figure it out.\nsave your keto winners to a BiteClub cookbook — the ones you actually make again deserve a home — download BiteClub.\n#keto #mealprep #highfat #lowcarb #biteclub #ketofood #ketolife",
  balanced_macro_prep: "protein, carbs, fats — all balanced, all prepped, all week. this is what intentional eating looks like.\nlog your macro-balanced preps on BiteClub and watch your Flavor Palate evolve — link in bio.\n#macros #mealprep #balanceddiet #iifym #biteclub #healthyeating #mealplanning",

  // BEGINNER
  first_meal_prep: "meal prep for people who hate meal prep. you're not lazy, you just never had a system.\nstart your first cooking streak on BiteClub — every prep counts as a day on the calendar — try BiteClub free.\n#mealprep #beginner #firsttimeprep #starthere #biteclub #easymeals #mealplanning",
  starter_pack: "the meal prep starter pack. containers, tools, mindset — everything you actually need to begin.\nsave this guide to BiteClub and refer back every Sunday until it becomes automatic — download BiteClub.\n#starterpack #mealprep #beginner #mealpreptips #biteclub #kitchenessentials #getstarted",
  essential_equipment: "5 things you actually need for meal prep. skip every gadget that isn't on this list.\nimport your first 3 meal prep recipes to BiteClub — the equipment is useless without the recipes — link in bio.\n#kitchentools #mealprep #essentials #minimalist #biteclub #kitchensetup #beginner",
  three_recipe_system: "master 3 recipes. that's it. you will never run out of lunch again. the 3-recipe system.\nsave your top 3 to a BiteClub cookbook — that's your meal prep forever — try BiteClub free.\n#3recipes #mealprep #simple #mealplanning #biteclub #easycooking #lunchideas",
  common_mistakes: "7 meal prep mistakes everyone makes. soggy rice, bland chicken, forgotten containers — all fixable.\nstart fresh with BiteClub — your cooking streak resets every Monday, just like your meal prep — download BiteClub.\n#mealprepfails #mistakes #cookingtips #mealprep #biteclub #kitchenhacks #fixedit",
  one_pot_prep: "one pot. one hour. five days of food. meal prep for beginners who own one pot.\nlog your one-pot preps on BiteClub — one photo, one rating, and the whole week is handled — link in bio.\n#onepot #mealprep #beginner #easycooking #biteclub #simplemeal #mealplanning",
  no_cook_prep: "no-cook meal prep. zero heat required. if you're afraid of the stove, start here.\nsave your no-cook favorites to a BiteClub cookbook — the gateway to eventually turning on the oven — try BiteClub free.\n#nocook #mealprep #coldmeals #beginner #biteclub #easyfood #noheat",

  // FAMILY
  family_of_four: "meal prep for a family of 4. feed the whole crew without cooking every single night.\ntrack your family meal preps on BiteClub — every night you don't have to cook is still a streak day — download BiteClub.\n#familymealprep #familyof4 #mealprep #familydinner #biteclub #feedthefamily #mealplanning",
  kid_friendly: "kid-approved meal prep. tested by actual picky eaters. they ate it. all of it.\nsave the kid-approved recipes to a BiteClub cookbook — pull it up when they say 'I don't want that' — link in bio.\n#kidfriendly #mealprep #pickyeaters #kidmeals #biteclub #familycooking #lunchbox",
  school_lunches: "school lunch prep that beats the cafeteria. lunchboxes that come home empty.\nprep 5 school lunches and log them on BiteClub — your cooking streak includes lunch duty — try BiteClub free.\n#schoollunch #lunchbox #mealprep #kidlunch #biteclub #packedlunch #momlife",
  family_freezer: "build a family freezer stockpile. ready-to-go dinners for the nights you can't cook.\nsave your freezer stockpile recipes to a BiteClub cookbook — the emergency dinner library — download BiteClub.\n#freezermeals #familyprep #mealprep #freezerstockpile #biteclub #familydinner #makeahead",
  picky_eater_prep: "meal prep for picky eaters. modular meals where everyone picks what they want. peace at the table.\nlog your modular preps on BiteClub — even the picky eaters contribute to the family cooking streak — link in bio.\n#pickyeaters #mealprep #modularmeals #familyfood #biteclub #familycooking #peacemaker",
  weekend_batch: "the weekend family batch cook. cook together on Saturday, eat easy all week.\npost your family batch cook on BiteClub — the whole family helped, everyone gets streak credit — try BiteClub free.\n#familycooking #batchcook #weekendprep #mealprep #biteclub #cookingtogether #familytime",
  baby_toddler_prep: "baby and toddler meal prep. tiny portions, big nutrition. prep alongside your own meals.\nsave baby-friendly recipes to a BiteClub cookbook — they'll grow up seeing what you cooked for them — download BiteClub.\n#babyfood #toddlermeals #mealprep #babymealprep #biteclub #parentlife #tinyportions",
};

// ── Dropdown component ───────────────────────────────────────────────────────

function ContentTypeDropdown({
  selected,
  onSelect,
}: {
  selected: ContentPreset | null;
  onSelect: (preset: ContentPreset) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

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
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
          open
            ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/30'
            : selected
            ? 'border-gray-300 bg-white hover:border-gray-400'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
      >
        {selected ? (
          <>
            <span className="text-2xl">{selected.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{selected.label}</p>
              <p className="text-xs text-gray-500 truncate">{selected.desc}</p>
            </div>
          </>
        ) : (
          <div className="flex-1">
            <p className="text-sm text-gray-400">Choose a content idea...</p>
          </div>
        )}
        <svg
          viewBox="0 0 16 16"
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (e.target.value) setActiveCategory(null);
              }}
              placeholder="Search meal prep ideas..."
              className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 placeholder:text-gray-400"
            />
          </div>

          {/* Category pills */}
          <div className="px-3 py-2 border-b border-gray-100 flex flex-wrap gap-1.5">
            <button
              onClick={() => { setActiveCategory(null); setSearch(''); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                !activeCategory && !search ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setSearch(''); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                  activeCategory === cat.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto">
            {Object.keys(groupedByCategory).length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                No content ideas found for &ldquo;{search}&rdquo;
              </div>
            ) : (
              Object.entries(groupedByCategory).map(([catId, presets]) => {
                const cat = CATEGORIES.find((c) => c.id === catId);
                return (
                  <div key={catId}>
                    <div className="px-4 pt-3 pb-1 flex items-center gap-2">
                      <span className="text-xs">{cat?.emoji}</span>
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        {cat?.label}
                      </span>
                      <span className="text-[10px] text-gray-300">{presets.length}</span>
                    </div>
                    {presets.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => {
                          onSelect(preset);
                          setOpen(false);
                          setSearch('');
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors ${
                          selected?.id === preset.id ? 'bg-red-50/50' : ''
                        }`}
                      >
                        <span className="text-lg flex-shrink-0">{preset.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{preset.label}</p>
                          <p className="text-xs text-gray-500 truncate">{preset.desc}</p>
                        </div>
                        {selected?.id === preset.id && (
                          <svg viewBox="0 0 16 16" className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3,8 6.5,11.5 13,5" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer count */}
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
            <span className="text-[11px] text-gray-400">
              {PRESETS.length} content ideas across {CATEGORIES.length} categories
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function MealPrepStreamPage() {
  const [selectedPreset, setSelectedPreset] = useState<ContentPreset | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);

  function handlePresetSelect(preset: ContentPreset) {
    setSelectedPreset(preset);
    setCopiedCaption(false);
  }

  function copyCaption() {
    if (!selectedPreset) return;
    const caption = TIKTOK_CAPTIONS[selectedPreset.id] || '';
    navigator.clipboard.writeText(caption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/streams" className="hover:text-gray-600 transition-colors">
            Streams
          </Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">{'\u{1F961}'} Meal Prep Guides</span>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left panel */}
          <div className="col-span-5 space-y-5">
            {/* Step 1: Content idea picker */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                  1
                </span>
                Choose a Content Idea
              </h2>
              <ContentTypeDropdown
                selected={selectedPreset}
                onSelect={handlePresetSelect}
              />
              {selectedPreset && (
                <div className="mt-3 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                    CATEGORIES.find((c) => c.id === selectedPreset.category)?.color || 'bg-gray-100 text-gray-600'
                  }`}>
                    {CATEGORIES.find((c) => c.id === selectedPreset.category)?.label}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Caption & details */}
          <div className="col-span-7 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                  2
                </span>
                TikTok Caption
              </h2>
              {!selectedPreset ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="text-5xl mb-4">{'\u{1F961}'}</div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Pick a meal prep idea to get started</p>
                  <p className="text-xs text-gray-400">
                    {PRESETS.length} presets across {CATEGORIES.length} categories — from budget preps to family meals
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Selected preset header */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className="text-3xl">{selectedPreset.emoji}</span>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{selectedPreset.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{selectedPreset.desc}</p>
                    </div>
                  </div>

                  {/* Caption */}
                  <div className="relative">
                    <div className="p-4 bg-gray-900 rounded-xl text-sm text-gray-100 whitespace-pre-line leading-relaxed font-mono">
                      {TIKTOK_CAPTIONS[selectedPreset.id] || 'No caption available for this preset.'}
                    </div>
                    <button
                      onClick={copyCaption}
                      className={`absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        copiedCaption
                          ? 'bg-green-500 text-white'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {copiedCaption ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  {/* Hashtag breakdown */}
                  {TIKTOK_CAPTIONS[selectedPreset.id] && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Hashtags</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(TIKTOK_CAPTIONS[selectedPreset.id].match(/#\w+/g) || []).map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
