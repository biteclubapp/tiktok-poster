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
  { id: 'thisorthat', label: 'This or That', emoji: '\u{1F914}', color: 'text-indigo-600 bg-indigo-50' },
  { id: 'hottakes', label: 'Hot Takes', emoji: '\u{1F525}', color: 'text-red-600 bg-red-50' },
  { id: 'wouldyourather', label: 'Would You Rather', emoji: '\u{1F9D0}', color: 'text-purple-600 bg-purple-50' },
  { id: 'guess', label: 'Guess Games', emoji: '\u{1F50D}', color: 'text-amber-600 bg-amber-50' },
  { id: 'rate', label: 'Rate It', emoji: '\u2B50', color: 'text-yellow-600 bg-yellow-50' },
] as const;

const PRESETS: ContentPreset[] = [
  // ── This or That ──
  { id: 'pizza_vs_tacos', label: 'Pizza vs Tacos: Final Answer', emoji: '\u{1F355}', desc: 'The debate that has ended friendships', category: 'thisorthat' },
  { id: 'pineapple_pizza', label: 'Pineapple on Pizza: Yes or Absolutely Not?', emoji: '\u{1F34D}', desc: 'There is no middle ground on this one', category: 'thisorthat' },
  { id: 'pasta_vs_rice', label: 'Pasta vs Rice: Pick One Forever', emoji: '\u{1F35D}', desc: 'You can only eat one carb for the rest of your life', category: 'thisorthat' },
  { id: 'breakfast_vs_dinner', label: 'Breakfast Food vs Dinner Food', emoji: '\u{1F373}', desc: 'Which meal category has the best food?', category: 'thisorthat' },
  { id: 'sweet_vs_savory', label: 'Sweet vs Savory: What Side Are You?', emoji: '\u{1F36C}', desc: 'Your answer says everything about you', category: 'thisorthat' },
  { id: 'homemade_vs_takeout', label: 'Homemade vs Takeout: Be Honest', emoji: '\u{1F3E0}', desc: 'Which one actually hits harder at 9pm?', category: 'thisorthat' },
  { id: 'crispy_vs_chewy', label: 'Crispy vs Chewy Cookies', emoji: '\u{1F36A}', desc: 'This is more divisive than politics', category: 'thisorthat' },
  { id: 'chopsticks_vs_fork', label: 'Chopsticks vs Fork', emoji: '\u{1F962}', desc: 'Your default utensil says a lot about you', category: 'thisorthat' },

  // ── Hot Takes ──
  { id: 'cereal_soup', label: 'Is Cereal a Soup?', emoji: '\u{1F963}', desc: 'Grain in liquid. That\'s a soup. Fight me.', category: 'hottakes' },
  { id: 'ketchup_eggs', label: 'Ketchup on Eggs Is Valid', emoji: '\u{1F95A}', desc: 'If you disagree, you\'re just wrong', category: 'hottakes' },
  { id: 'water_wet', label: 'Hot Dogs Are Sandwiches', emoji: '\u{1F32D}', desc: 'Bread on two sides of a filling. That\'s a sandwich.', category: 'hottakes' },
  { id: 'overrated_foods', label: 'The Most Overrated Food of All Time', emoji: '\u{1F644}', desc: 'Name it. Defend yourself in the comments.', category: 'hottakes' },
  { id: 'mayo_everything', label: 'Mayo Makes Everything Better', emoji: '\u{1FAD8}', desc: 'Unpopular? Maybe. Wrong? Never.', category: 'hottakes' },
  { id: 'well_done_steak', label: 'Well-Done Steak Deserves Respect', emoji: '\u{1F969}', desc: 'Not everyone wants to see pink. Get over it.', category: 'hottakes' },
  { id: 'instant_ramen', label: 'Instant Ramen Is Fine Dining', emoji: '\u{1F35C}', desc: 'With the right toppings, it\'s a 10/10 meal', category: 'hottakes' },

  // ── Would You Rather ──
  { id: 'one_cuisine_forever', label: 'One Cuisine Forever: Which One?', emoji: '\u{1F30D}', desc: 'You can only eat food from one country for life', category: 'wouldyourather' },
  { id: 'no_cheese_no_chocolate', label: 'Give Up Cheese or Chocolate?', emoji: '\u{1F9C0}', desc: 'One has to go. Forever. Choose wisely.', category: 'wouldyourather' },
  { id: 'cook_every_meal', label: 'Cook Every Meal or Never Cook Again?', emoji: '\u{1F468}\u200D\u{1F373}', desc: 'Homemade everything or restaurant life forever', category: 'wouldyourather' },
  { id: 'spicy_everything', label: 'Everything Is Spicy or Nothing Has Flavor', emoji: '\u{1F336}\uFE0F', desc: 'Both options are pain. Pick your version.', category: 'wouldyourather' },
  { id: 'no_dessert_no_snacks', label: 'No Dessert Forever or No Snacks Forever?', emoji: '\u{1F370}', desc: 'One entire food category disappears', category: 'wouldyourather' },
  { id: 'eat_same_breakfast', label: 'Same Breakfast Forever or Random Breakfast Daily?', emoji: '\u{1F950}', desc: 'Consistency vs chaos, every single morning', category: 'wouldyourather' },
  { id: 'unlimited_sushi_pizza', label: 'Unlimited Sushi or Unlimited Pizza?', emoji: '\u{1F363}', desc: 'Both are infinite. You only get one.', category: 'wouldyourather' },

  // ── Guess Games ──
  { id: 'guess_ingredient', label: 'Guess the Secret Ingredient', emoji: '\u{1F52E}', desc: 'One ingredient changes everything — can you spot it?', category: 'guess' },
  { id: 'guess_price', label: 'Guess Which Costs More: Homemade vs Restaurant', emoji: '\u{1F4B0}', desc: 'The price gap will shock you every time', category: 'guess' },
  { id: 'guess_country', label: 'Guess the Country by the Dish', emoji: '\u{1F5FA}\uFE0F', desc: 'Food geography quiz — harder than you think', category: 'guess' },
  { id: 'guess_calories', label: 'Guess the Calories', emoji: '\u{1F4CA}', desc: 'Two meals, one has double the calories. Which one?', category: 'guess' },
  { id: 'guess_ingredient_count', label: 'How Many Ingredients? Over/Under', emoji: '\u{1F3B2}', desc: 'Simple-looking dishes with surprisingly long ingredient lists', category: 'guess' },
  { id: 'guess_cooking_time', label: 'Guess the Cook Time', emoji: '\u23F0', desc: 'Some dishes take way longer (or shorter) than you think', category: 'guess' },
  { id: 'real_or_ai', label: 'Real Dish or AI Generated?', emoji: '\u{1F916}', desc: 'Can you tell the difference? It\'s getting harder.', category: 'guess' },
  { id: 'guess_the_chef', label: 'Guess Who Made It: Pro or Home Cook?', emoji: '\u{1F468}\u200D\u{1F373}', desc: 'Professional plating vs home kitchen — can you tell?', category: 'guess' },

  // ── Rate It ──
  { id: 'rate_fridge', label: 'Rate This Fridge on a Scale of 1-10', emoji: '\u{1F9CA}', desc: 'Fridge tours reveal everything about a person', category: 'rate' },
  { id: 'rate_combo', label: 'Rate This Food Combo', emoji: '\u{1F60B}', desc: 'Weird combos that might actually work. Rate them.', category: 'rate' },
  { id: 'rate_plating', label: 'Rate the Plating: Home Cook Edition', emoji: '\u{1F3A8}', desc: 'Real home cooks trying their best — be kind but honest', category: 'rate' },
  { id: 'rate_hack', label: 'Rate This Kitchen Hack', emoji: '\u{1F9E0}', desc: 'Genius or dangerous? You decide.', category: 'rate' },
  { id: 'rate_lunchbox', label: 'Rate My Lunchbox', emoji: '\u{1F371}', desc: 'Packed lunches from around the world — score them', category: 'rate' },
  { id: 'rate_pantry', label: 'Rate This Pantry Setup', emoji: '\u{1F3DA}\uFE0F', desc: 'Organized chaos or just chaos? Give it a number.', category: 'rate' },
  { id: 'rate_midnight_snack', label: 'Rate This Midnight Snack', emoji: '\u{1F319}', desc: 'Unhinged late-night food creations. No judgment. Just ratings.', category: 'rate' },
];

// ── TikTok captions ──────────────────────────────────────────────────────────

const TIKTOK_CAPTIONS: Record<string, string> = {
  // THIS OR THAT
  pizza_vs_tacos: "pizza vs tacos. there is a correct answer and it's yours. drop it in the comments.\nlog whichever one you make tonight on BiteClub — your Flavor Palate picks your real side — link in bio.\n#thisorthat #pizza #tacos #fooddebate #biteclub #foodtok #pickaside",
  pineapple_pizza: "pineapple on pizza. yes or absolutely not. there is no 'it depends.'\npost your version on BiteClub and let your followers roast you or respect you — download BiteClub.\n#pineapplepizza #fooddebate #hottake #pizzatoppings #biteclub #foodtok #controversial",
  pasta_vs_rice: "you can only eat one carb for the rest of your life. pasta or rice. choose now.\nwhatever you pick, save your best version to a BiteClub cookbook — that's your carb legacy — link in bio.\n#pastavsrice #thisorthat #fooddebate #carblife #biteclub #foodtok #pickaside",
  breakfast_vs_dinner: "breakfast food or dinner food. which meal category has the best food overall?\npost your answer as a meal on BiteClub — breakfast for dinner counts as both — try BiteClub free.\n#breakfastvsdinner #thisorthat #fooddebate #brunch #biteclub #foodtok #mealtime",
  sweet_vs_savory: "sweet or savory. your answer tells me everything I need to know about you.\nyour BiteClub Flavor Palate already knows the truth — check your Sweet vs Savory bars — download BiteClub.\n#sweetvssavory #thisorthat #flavorpalate #foodpersonality #biteclub #foodtok",
  homemade_vs_takeout: "homemade or takeout. be honest. which one actually hits harder at 9pm on a Tuesday?\ntrack your real ratio on BiteClub — your cooking history is the lie detector — link in bio.\n#homemadevstakeout #thisorthat #realfood #9pmmeals #biteclub #foodtok #behonest",
  crispy_vs_chewy: "crispy cookies or chewy cookies. this is more divisive than anything in politics right now.\nbake your preference and post it on BiteClub with a star rating — settle this with evidence — try BiteClub free.\n#crispyvschewy #cookies #fooddebate #baking #biteclub #foodtok #cookiedebate",
  chopsticks_vs_fork: "chopsticks or fork. your default utensil says everything about your food personality.\nwhatever you use, log the meal on BiteClub — your Cuisines Cooked map doesn't care about utensils — download BiteClub.\n#chopsticksvsfork #thisorthat #foodculture #utensils #biteclub #foodtok",

  // HOT TAKES
  cereal_soup: "cereal is a soup. grain in liquid. served in a bowl. that's a soup. I will not be taking questions.\npost your most controversial food take on BiteClub and watch the comments burn — link in bio.\n#cerealsoup #hottake #fooddebate #controversial #biteclub #foodtok #unpopularopinion",
  ketchup_eggs: "ketchup on eggs is valid and if you disagree you're just gatekeeping condiments.\nrate your egg-and-ketchup combo on BiteClub — 5 stars, no shame — try BiteClub free.\n#ketchupeggs #hottake #eggs #condiments #biteclub #foodtok #unpopularopinion",
  water_wet: "hot dogs are sandwiches. bread on two sides of a filling. explain how that's not a sandwich.\npost a hot dog on BiteClub and tag it as a sandwich — watch what happens — download BiteClub.\n#hotdogsandwich #hottake #fooddebate #technically #biteclub #foodtok #controversial",
  overrated_foods: "name the most overrated food of all time. I'll go first. defend yourself in the comments.\npost the food you think is overrated on BiteClub with a 1-star review — back it up — link in bio.\n#overratedfood #hottake #foodopinion #controversial #biteclub #foodtok #debate",
  mayo_everything: "mayo makes everything better. this is not an opinion. it's a lifestyle. join us.\nlog every mayo-enhanced meal on BiteClub — your Flavor Palate will reflect the truth — try BiteClub free.\n#mayo #hottake #condimentking #mayolife #biteclub #foodtok #unpopularopinion",
  well_done_steak: "well-done steak deserves respect. not everyone wants to see pink. get over it.\npost your well-done steak on BiteClub with a 5-star rating and watch the grill masters implode — download BiteClub.\n#welldonesteak #hottake #steakdebate #respectfully #biteclub #foodtok #controversial",
  instant_ramen: "instant ramen with the right toppings is fine dining. fight me on this one.\npost your elevated ramen on BiteClub — egg, scallions, chili oil — that's a 5-star meal — link in bio.\n#instantramen #hottake #ramen #elevatedfood #biteclub #foodtok #finedining",

  // WOULD YOU RATHER
  one_cuisine_forever: "you can only eat food from one country for the rest of your life. which country?\nyour BiteClub Cuisines Cooked map shows which one you'd actually survive on — check it — try BiteClub free.\n#wouldyourather #onecuisine #fooddilemma #worldcuisine #biteclub #foodtok #impossible",
  no_cheese_no_chocolate: "give up cheese or give up chocolate. forever. one has to go right now.\npost the one you're keeping on BiteClub — your Flavor Palate will mourn the one you lost — download BiteClub.\n#wouldyourather #cheese #chocolate #fooddilemma #biteclub #foodtok #hardchoice",
  cook_every_meal: "cook every single meal yourself or never cook again. which life do you choose?\nif you chose cooking — start your streak on BiteClub and prove it — link in bio.\n#wouldyourather #homecooking #nevercookagain #fooddilemma #biteclub #foodtok #cookinglife",
  spicy_everything: "everything you eat is spicy, or nothing you eat has any flavor at all. pick your pain.\nwhatever you choose, your BiteClub Flavor Palate's Spice bar already knows your tolerance — try BiteClub free.\n#wouldyourather #spicy #noflavor #fooddilemma #biteclub #foodtok #spicetolerance",
  no_dessert_no_snacks: "no dessert forever or no snacks forever. one entire food category disappears from your life.\nlog your last dessert (or snack) on BiteClub before it's gone forever — download BiteClub.\n#wouldyourather #dessert #snacks #fooddilemma #biteclub #foodtok #hardchoice",
  eat_same_breakfast: "same breakfast every day forever or completely random breakfast every morning. consistency or chaos?\ntrack your breakfast streak on BiteClub — are you a routine person or a chaos agent? — link in bio.\n#wouldyourather #breakfast #routine #chaos #biteclub #foodtok #morningroutine",
  unlimited_sushi_pizza: "unlimited sushi or unlimited pizza. both are infinite. you only get one. forever.\npost whichever you chose on BiteClub — your cooking history will reveal if you actually followed through — try BiteClub free.\n#wouldyourather #sushi #pizza #unlimited #biteclub #foodtok #infiniteFood",

  // GUESS GAMES
  guess_ingredient: "one secret ingredient changes this entire dish. can you guess what it is?\npost your secret ingredient dishes on BiteClub and make your followers guess — link in bio.\n#guesstheingredient #foodquiz #secretingredient #canyouguess #biteclub #foodtok #quiz",
  guess_price: "homemade vs restaurant. guess which one costs more. the gap will surprise you every single time.\ntrack what you actually spend by logging meals on BiteClub — your cooking history is the receipt — download BiteClub.\n#guessprice #homemadevsrestaurant #foodcost #pricecheck #biteclub #foodtok #savemoney",
  guess_country: "guess the country by the dish. food geography quiz. it's harder than you think.\nexpand your Cuisines Cooked map on BiteClub — cook the ones you got wrong — try BiteClub free.\n#guesscountry #foodgeography #worldfood #foodquiz #biteclub #foodtok #geography",
  guess_calories: "two meals. one has double the calories. which one? the answer is never what you expect.\nlog your meals on BiteClub and start paying attention to what you're actually eating — link in bio.\n#guesscalories #caloriecheck #foodquiz #healthyfood #biteclub #foodtok #nutrition",
  guess_ingredient_count: "how many ingredients in this dish? over or under 10? simple-looking dishes are lying to you.\nimport complex recipes to BiteClub and see the real ingredient count — download BiteClub.\n#overunder #ingredients #foodquiz #cookingtrivia #biteclub #foodtok #didyouknow",
  guess_cooking_time: "guess how long this takes to cook. some dishes are way faster (or slower) than they look.\ntrack your actual cooking times by logging meals on BiteClub — your history tells the truth — try BiteClub free.\n#guesscooktime #cookingquiz #foodtrivia #howlong #biteclub #foodtok #kitchentime",
  real_or_ai: "real dish or AI generated? it's getting genuinely hard to tell. test yourself.\npost your real home-cooked meals on BiteClub — no filters, no AI, just actual food — link in bio.\n#realorAI #aifood #foodquiz #canyoutell #biteclub #foodtok #realfood",
  guess_the_chef: "professional chef or home cook? can you tell from the plate alone?\npost your home-cooked plating on BiteClub — let people guess if you're a pro — download BiteClub.\n#provsHomecook #foodquiz #plating #canyoutell #biteclub #foodtok #homecooking",

  // RATE IT
  rate_fridge: "rate this fridge on a scale of 1-10. fridge tours reveal everything about a person.\nshow your own fridge on BiteClub — your cooking streak proves whether that fridge gets used — try BiteClub free.\n#ratemyfridge #fridgetour #fridgecheck #rateit #biteclub #foodtok #kitchentour",
  rate_combo: "rate this food combo. weird? maybe. delicious? possibly. you have to try it to judge.\npost your weirdest food combo on BiteClub with a star rating — let the people decide — link in bio.\n#ratefoodcombo #weirdcombo #foodcombo #rateit #biteclub #foodtok #wouldyoutry",
  rate_plating: "rate the plating. home cook edition. real people trying their best. be kind but honest.\npost your best plating attempt on BiteClub — star rating included — download BiteClub.\n#rateplating #homecookplating #platingskills #rateit #biteclub #foodtok #foodart",
  rate_hack: "rate this kitchen hack. genius or genuinely dangerous? you decide.\nshare your best kitchen hack on BiteClub — if it works, it deserves a 5-star rating — try BiteClub free.\n#kitchenhack #rateit #hackorwack #cookingtips #biteclub #foodtok #lifehack",
  rate_lunchbox: "rate this lunchbox. packed lunches from around the world. give it a score.\npost your own lunchbox on BiteClub — packed lunches deserve cooking streak credit too — link in bio.\n#ratemylunchbox #lunchbox #packedlunch #rateit #biteclub #foodtok #worldlunches",
  rate_pantry: "rate this pantry setup. organized chaos or just chaos? give it a number.\nshow your pantry on BiteClub — your cooking streak proves whether all those ingredients actually get used — download BiteClub.\n#ratemypantry #pantrysetup #kitchenorganization #rateit #biteclub #foodtok #organizedkitchen",
  rate_midnight_snack: "rate this midnight snack. unhinged late-night food creations. no judgment. just ratings.\npost your midnight snack on BiteClub — it counts for the streak — try BiteClub free.\n#midnightsnack #latenightfood #rateit #snacktime #biteclub #foodtok #nojudgment",
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
              placeholder="Search polls & quizzes..."
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

export default function PollsStreamPage() {
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
          <span className="text-gray-700 font-medium">{'\u{1F5F3}\uFE0F'} Polls & Quizzes</span>
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
                  <div className="text-5xl mb-4">{'\u{1F5F3}\uFE0F'}</div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Pick a poll or quiz idea to get started</p>
                  <p className="text-xs text-gray-400">
                    {PRESETS.length} presets across {CATEGORIES.length} categories — from hot takes to guess games
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
