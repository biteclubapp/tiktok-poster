'use client';

import { useState } from 'react';
import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────────────────────────

interface VersusPreset {
  id: string;
  label: string;
  emoji: string;
  desc: string;
  category: string;
}

// ── Categories ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'classic', label: 'Classic Showdowns', emoji: '🥊', color: 'text-red-600 bg-red-50' },
  { id: 'homemade', label: 'Homemade vs Store', emoji: '🏠', color: 'text-amber-600 bg-amber-50' },
  { id: 'budget', label: 'Budget vs Bougie', emoji: '💸', color: 'text-green-600 bg-green-50' },
  { id: 'cultural', label: 'Cultural Clashes', emoji: '🌍', color: 'text-blue-600 bg-blue-50' },
  { id: 'technique', label: 'Technique Wars', emoji: '⚙️', color: 'text-purple-600 bg-purple-50' },
] as const;

// ── Presets ───────────────────────────────────────────────────────────────────

const PRESETS: VersusPreset[] = [
  // ── Classic Showdowns ──
  { id: 'tacos_vs_burritos', label: 'Tacos vs Burritos', emoji: '🌮', desc: 'The eternal Mexican debate — pick a side and defend it', category: 'classic' },
  { id: 'pizza_vs_pasta', label: 'Pizza vs Pasta', emoji: '🍕', desc: 'Both Italian, both perfect — but which one wins dinner?', category: 'classic' },
  { id: 'burger_vs_sandwich', label: 'Burger vs Sandwich', emoji: '🍔', desc: 'Is a burger just a sandwich? And which one wins on flavour?', category: 'classic' },
  { id: 'ramen_vs_pho', label: 'Ramen vs Pho', emoji: '🍜', desc: 'Japan vs Vietnam — the noodle soup showdown nobody can settle', category: 'classic' },
  { id: 'fried_chicken_vs_grilled', label: 'Fried Chicken vs Grilled Chicken', emoji: '🍗', desc: 'Crispy indulgence vs clean protein — which actually wins?', category: 'classic' },
  { id: 'sushi_vs_sashimi', label: 'Sushi vs Sashimi', emoji: '🍣', desc: 'Rice or no rice? The purist argument you need to have', category: 'classic' },
  { id: 'tacos_vs_nachos', label: 'Tacos vs Nachos', emoji: '🌯', desc: 'Structured vs chaotic — the same ingredients, totally different experience', category: 'classic' },
  { id: 'steak_vs_ribs', label: 'Steak vs Ribs', emoji: '🥩', desc: 'Fork food vs finger food — the BBQ debate that ends friendships', category: 'classic' },

  // ── Homemade vs Store ──
  { id: 'homemade_bread_vs_store', label: 'Homemade Bread vs Store-Bought', emoji: '🍞', desc: 'Is the sourdough hype worth the 24-hour process? The data says yes', category: 'homemade' },
  { id: 'fresh_pasta_vs_dried', label: 'Fresh Pasta vs Dried Pasta', emoji: '🍝', desc: 'Eggs and flour vs a box — when does it actually make a difference?', category: 'homemade' },
  { id: 'homemade_sauce_vs_jar', label: 'Homemade Tomato Sauce vs Jar', emoji: '🍅', desc: 'The jar people will not like this one. The numbers are embarrassing', category: 'homemade' },
  { id: 'homemade_mayo_vs_hellmanns', label: 'Homemade Mayo vs Hellmann\'s', emoji: '🥚', desc: 'Three ingredients vs a factory — blind tasters can\'t always tell', category: 'homemade' },
  { id: 'stock_vs_cube', label: 'Homemade Stock vs Bouillon Cube', emoji: '🫙', desc: 'Six hours of simmering vs 30 seconds — is the effort justified?', category: 'homemade' },
  { id: 'homemade_hummus_vs_tub', label: 'Homemade Hummus vs Supermarket Tub', emoji: '🫘', desc: 'A blender and 5 minutes vs a £2 plastic tub. Settle this', category: 'homemade' },
  { id: 'homemade_pizza_vs_delivery', label: 'Homemade Pizza vs Delivery', emoji: '🍕', desc: '$4 of ingredients vs $22 delivery — and which one is actually better', category: 'homemade' },
  { id: 'homemade_granola_vs_box', label: 'Homemade Granola vs Boxed Cereal', emoji: '🥣', desc: 'Sugar, oats, oil vs a cereal box with 47 ingredients. Not even close', category: 'homemade' },

  // ── Budget vs Bougie ──
  { id: 'budget_steak_vs_wagyu', label: '$5 Steak vs $50 Wagyu', emoji: '🥩', desc: 'Can technique close the gap between chuck and A5? Let\'s find out', category: 'budget' },
  { id: 'instant_ramen_vs_fancy_ramen', label: 'Instant Ramen vs Restaurant Ramen', emoji: '🍜', desc: '$0.30 vs $18 — what you\'re actually paying for in that bowl', category: 'budget' },
  { id: 'dorm_food_vs_chef_food', label: 'Dorm Food vs Chef Food', emoji: '🎓', desc: 'Same ingredients, different skill level — the glow-up is real', category: 'budget' },
  { id: 'budget_pasta_vs_restaurant', label: '$2 Pasta Night vs $25 Pasta Dinner', emoji: '🍝', desc: 'Honest breakdown of what you\'re paying for when you eat out', category: 'budget' },
  { id: 'supermarket_wine_vs_sommelier', label: '$8 Wine vs $80 Wine With Food', emoji: '🍷', desc: 'Blind taste tests say you probably can\'t tell. We have receipts', category: 'budget' },
  { id: 'fast_food_vs_homemade_burger', label: 'Fast Food Burger vs Homemade', emoji: '🍔', desc: '$3 drive-through vs $6 ingredients — same time, wildly different result', category: 'budget' },
  { id: 'store_brand_vs_premium', label: 'Store Brand vs Premium Brand', emoji: '🛒', desc: 'Blind tests across 10 pantry staples — the results will sting a little', category: 'budget' },
  { id: 'meal_prep_vs_meal_kit', label: 'Meal Prep vs Meal Kit Delivery', emoji: '📦', desc: '$15/week vs $70/week — the real cost of convenience, itemised', category: 'budget' },

  // ── Cultural Clashes ──
  { id: 'italian_vs_french', label: 'Italian vs French Cuisine', emoji: '🇮🇹', desc: 'Rustic vs refined — the great European cuisine debate', category: 'cultural' },
  { id: 'thai_vs_indian', label: 'Thai vs Indian Cuisine', emoji: '🍛', desc: 'Two spice traditions with completely different philosophies. Pick one', category: 'cultural' },
  { id: 'american_vs_korean_bbq', label: 'American BBQ vs Korean BBQ', emoji: '🥓', desc: 'Low and slow vs tableside grill — same concept, entirely different culture', category: 'cultural' },
  { id: 'japanese_vs_chinese', label: 'Japanese vs Chinese Cuisine', emoji: '🥢', desc: 'Minimalist precision vs maximalist flavour — the East Asian showdown', category: 'cultural' },
  { id: 'mexican_vs_peruvian', label: 'Mexican vs Peruvian Cuisine', emoji: '🌶️', desc: 'Two Latin American cuisines with a serious argument for being the best', category: 'cultural' },
  { id: 'greek_vs_turkish', label: 'Greek vs Turkish Cuisine', emoji: '🫒', desc: 'Similar ingredients, fierce rivalry — who really invented what', category: 'cultural' },
  { id: 'ethiopian_vs_moroccan', label: 'Ethiopian vs Moroccan Cuisine', emoji: '🌍', desc: 'Two African food traditions that the world is finally paying attention to', category: 'cultural' },

  // ── Technique Wars ──
  { id: 'air_fryer_vs_oven', label: 'Air Fryer vs Oven', emoji: '🔌', desc: 'Does the air fryer actually win, or is it just a tiny noisy oven?', category: 'technique' },
  { id: 'cast_iron_vs_nonstick', label: 'Cast Iron vs Non-Stick', emoji: '🍳', desc: 'The pan debate that splits kitchens down the middle. Here\'s the data', category: 'technique' },
  { id: 'grill_vs_smoker', label: 'Grill vs Smoker', emoji: '💨', desc: 'Speed and char vs patience and smoke — when each one wins', category: 'technique' },
  { id: 'stovetop_vs_instant_pot', label: 'Stovetop vs Instant Pot', emoji: '🫕', desc: 'Traditional control vs set-and-forget — the braised short rib test', category: 'technique' },
  { id: 'mortar_vs_blender', label: 'Mortar & Pestle vs Blender', emoji: '🧄', desc: 'Does the old way actually make better curry paste? Yes. Here\'s why', category: 'technique' },
  { id: 'deep_fry_vs_shallow_fry', label: 'Deep Fry vs Shallow Fry', emoji: '🍟', desc: 'Submerged vs half-submerged — what actually makes the crispiest result', category: 'technique' },
  { id: 'raw_vs_cooked_garlic', label: 'Raw Garlic vs Cooked Garlic', emoji: '🧅', desc: 'Same ingredient, wildly different personality — when to use each', category: 'technique' },
];

// ── TikTok Captions ───────────────────────────────────────────────────────────

const TIKTOK_CAPTIONS: Record<string, string> = {
  // CLASSIC SHOWDOWNS
  tacos_vs_burritos:
    "tacos vs burritos. this is not a hypothetical. pick a side right now.\nwhen you decide, make the winning one and rate it on BiteClub — your Flavor Palate knows your real loyalty.\n#tacosvsburritos #fooddebate #taco #burrito #biteclub #foodtok",

  pizza_vs_pasta:
    "both Italian. both perfect. but if you could only eat one for the rest of your life — which one?\nlog your pick tonight on BiteClub and let your Cooking History settle the argument over time.\n#pizzavspasta #italianfood #fooddebate #homecooking #biteclub #foodtok",

  burger_vs_sandwich:
    "a burger IS a sandwich and I will not be taking questions. unless... it isn't?\nwhichever side you're on — make it tonight and save the recipe to your BiteClub cookbook.\n#burgerdebate #sandwich #fooddebate #homecooking #biteclub #foodtok",

  ramen_vs_pho:
    "ramen vs pho. Japan vs Vietnam. both deeply personal. both life-changing.\ncook the one you'd argue for and add it to your Cuisines Cooked map on BiteClub — which country gets the pin?\n#ramenvsphho #noodlesoup #fooddebate #japanesefood #vietnamesefood #biteclub",

  fried_chicken_vs_grilled:
    "fried chicken vs grilled chicken. one is clearly more fun. the other is clearly smarter. you can't have both.\npost your cook on BiteClub and check if your Flavor Palate is more Salty or more balanced than you thought.\n#friedchicken #grilledchicken #chickendebate #homecooking #biteclub #foodtok",

  sushi_vs_sashimi:
    "sashimi is just sushi without the carbs. or is sushi just sashimi with commitment.\nfish from a new Japanese recipe adds Japan to your Cuisines Cooked map on BiteClub — try both this week.\n#sushivssashimi #japanesefood #fooddebate #homecooking #biteclub #foodtok",

  tacos_vs_nachos:
    "tacos vs nachos. same ingredients. completely different experience. one requires effort. one requires chaos.\nwhichever wins, save the recipe to a \"Mexican Night\" cookbook on BiteClub before the group chat asks.\n#tacosvsnaachos #mexicanfood #fooddebate #homecooking #biteclub #foodtok",

  steak_vs_ribs:
    "steak or ribs. this tells you everything about a person. fork food vs the thing where napkins become useless.\npost your cook on BiteClub with a star rating and let your Cooking History show your true BBQ allegiance.\n#steakvsribs #bbq #fooddebate #homecooking #biteclub #foodtok",

  // HOMEMADE VS STORE
  homemade_bread_vs_store:
    "homemade sourdough vs store-bought sliced bread. one costs $0.80 to make. the other has 23 ingredients.\nsave your bread recipe to a BiteClub cookbook — \"Things Worth Making\" is a solid name for it.\n#sourdough #homebaked #homemadevsstore #breadtok #biteclub #baking",

  fresh_pasta_vs_dried:
    "fresh pasta vs dried pasta. eggs and flour vs a box that costs $1.50. when does it actually matter?\ncook both this week and rate them on BiteClub — your Cooking History will show you which one you keep coming back to.\n#freshpasta #homemadepasta #pastatok #homemadevsstore #biteclub #italianfood",

  homemade_sauce_vs_jar:
    "homemade tomato sauce: 4 ingredients, 20 minutes. jar sauce: 19 ingredients, $5. this isn't even close.\nsave the 4-ingredient version to your BiteClub cookbook and never buy the jar again — try BiteClub free.\n#tomatosauce #homemadevsstore #homecooking #italianfood #biteclub #cookingtips",

  homemade_mayo_vs_hellmanns:
    "homemade mayo: egg, oil, lemon, mustard. 90 seconds. blind tasters genuinely can't tell.\nimport the recipe to BiteClub from anywhere and pin it to your profile — it's the easiest flex in the kitchen.\n#homemademayo #hellmanns #homemadevsstore #cookinghacks #biteclub #foodtok",

  stock_vs_cube:
    "homemade chicken stock vs a bouillon cube. six hours vs 30 seconds. the flavour gap is real and it's large.\nsave a batch stock recipe to a \"Foundations\" cookbook on BiteClub — make it once on Sunday, cook better all week.\n#chickenstock #bouillon #homemadevsstore #batchcooking #biteclub #cookingtips",

  homemade_hummus_vs_tub:
    "homemade hummus: chickpeas, tahini, garlic, lemon. 5 minutes. the supermarket tub doesn't deserve your money.\npost your batch on BiteClub with a photo and star rating — it's genuinely one of the easiest pins on your profile.\n#hummus #homemadehummus #homemadevsstore #middleeasternfood #biteclub #foodtok",

  homemade_pizza_vs_delivery:
    "$4 of ingredients vs $22 delivery. same result. better result. and your kitchen smells incredible for 3 hours.\nsave your dough recipe to a BiteClub cookbook and add Italy to your Cuisines Cooked map every Friday night.\n#homemadepizza #pizzadelivery #homemadevsstore #pizzatok #biteclub #homecooking",

  homemade_granola_vs_box:
    "homemade granola: oats, honey, nuts, 20 minutes. boxed cereal: 47 ingredients, the first three are sugar.\nbuild a \"Meal Prep Breakfasts\" cookbook on BiteClub and add this — your streak starts with breakfast.\n#homemadegranola #cerealvsgraanola #homemadevsstore #mealprep #biteclub #healthyfood",

  // BUDGET VS BOUGIE
  budget_steak_vs_wagyu:
    "$5 chuck steak vs $50 wagyu. one of them shouldn't work. one of them clearly does. results incoming.\npost your budget cook on BiteClub and let your star rating do the talking — technique beats price more than you think.\n#budgetsteak #wagyu #budgetvsbougie #steaktok #biteclub #cookathome",

  instant_ramen_vs_fancy_ramen:
    "instant ramen: $0.30. restaurant ramen: $18. we're breaking down what you're actually paying for in that bowl.\nafter the video — find a proper tonkotsu recipe on BiteClub's Discovery feed and give it a go this weekend.\n#instantramen #ramentok #budgetvsbougie #noodles #biteclub #foodtok",

  dorm_food_vs_chef_food:
    "same ingredients. one was made in a dorm at 11pm. one was made by someone who watched a lot of YouTube.\nthe glow-up is real — track yours on BiteClub's weekly streak calendar and watch your Type of Cook badge change.\n#dormfood #cookinggrowth #budgetvsbougie #learntocook #biteclub #cookingjourney",

  budget_pasta_vs_restaurant:
    "$2 pasta at home vs $25 pasta at a restaurant. honest breakdown of what you're actually paying for.\nyour BiteClub Cooking History builds the case that home is better — every meal is a data point.\n#pastaathome #budgeteating #budgetvsbougie #italianfood #biteclub #savemoney",

  supermarket_wine_vs_sommelier:
    "$8 wine vs $80 wine. blind tasters in peer-reviewed studies pick the cheap one 50% of the time. 50%.\nfind a dinner recipe that makes the $8 bottle shine on BiteClub's Discovery feed — good food helps the wine.\n#winetok #budgetvsbougie #winewithfood #blindtasting #biteclub #homecooking",

  fast_food_vs_homemade_burger:
    "$3 drive-through vs $6 ingredients. same time. the homemade one has a better hit rate than you expect.\npost your homemade version on BiteClub and pin it — your followers need this recipe more than you know.\n#homemadeburger #fastfood #budgetvsbougie #burgertok #biteclub #cookathome",

  store_brand_vs_premium:
    "we blind-tested 10 pantry staples: store brand vs premium. the results are going to sting a little.\nbuy the winner versions and import the recipes that use them to BiteClub — your grocery list is your cookbook.\n#storebrand #premiumvscheap #budgetvsbougie #groceryhacks #biteclub #foodtok",

  meal_prep_vs_meal_kit:
    "$15/week meal prep vs $70/week meal kit delivery. we timed both. we priced both. the math is uncomfortable.\nbuild a meal prep cookbook on BiteClub and run your own experiment — your Cooking History is the receipt.\n#mealprep #mealkit #budgetvsbougie #savemoney #biteclub #mealprepideas",

  // CULTURAL CLASHES
  italian_vs_french:
    "Italian vs French cuisine. rustic vs refined. which country is actually winning the dinner table?\ncook from whichever wins and add another country to your BiteClub Cuisines Cooked map — the rivalry gets personal fast.\n#italianfood #frenchfood #culturalclash #cuisinedebate #biteclub #foodtok",

  thai_vs_indian:
    "Thai vs Indian. both spice traditions. both completely different. both people will fight you over.\ncook one from each cuisine this month — your BiteClub Flavor Palate Spice bar will never look the same.\n#thaifood #indianfood #spicefood #culturalclash #biteclub #foodtok",

  american_vs_korean_bbq:
    "American BBQ: low and slow, smoke, sauce. Korean BBQ: tableside, thin-cut, banchan. same word. different world.\ncook the one you'd argue for and add it to your BiteClub Cuisines Cooked map — the grill is the whole culture.\n#americanbbq #koreanbbq #bbqdebate #culturalclash #biteclub #grilling",

  japanese_vs_chinese:
    "Japanese food: minimalism, precision, restraint. Chinese food: maximalism, depth, abundance. pick your philosophy.\nboth add new pins to your BiteClub Cuisines Cooked map — cook from both this week and report back.\n#japanesefood #chinesefood #asianfood #culturalclash #biteclub #foodtok",

  mexican_vs_peruvian:
    "Mexican vs Peruvian. two of the most underrated serious food cultures on the planet. someone has to win.\nwhoever wins this one — save 3 recipes to a dedicated cookbook on BiteClub before the argument ends.\n#mexicanfood #peruvianfood #latinamerican #culturalclash #biteclub #foodtok",

  greek_vs_turkish:
    "Greek vs Turkish food. similar ingredients. long history. people have opinions. strong ones.\ncook from the one you'd defend and post it on BiteClub — your Discovery feed will show you both sides.\n#greekfood #turkishfood #mediterraneanfood #culturalclash #biteclub #foodtok",

  ethiopian_vs_moroccan:
    "Ethiopian vs Moroccan. two African food traditions that deserve more than one slide. the world is catching up.\neither one adds a new pin to your BiteClub Cuisines Cooked map — this is where your cooking identity gets interesting.\n#ethiopianfood #moroccanfood #africanfood #culturalclash #biteclub #worldcuisine",

  // TECHNIQUE WARS
  air_fryer_vs_oven:
    "air fryer vs oven. genuinely testing this. because the air fryer people are very confident and I want receipts.\npost your result on BiteClub with a star rating — your Cooking History will eventually pick a winner for you.\n#airfryer #ovenrecipes #techniquewars #cookinghacks #biteclub #kitchentok",

  cast_iron_vs_nonstick:
    "cast iron vs non-stick. this debate splits kitchens. someone is wrong and it's probably you.\nboth make great food when you know the rules — save the right technique to a BiteClub cookbook and end the argument.\n#castiron #nonstickpan #techniquewars #kitchengear #biteclub #cookingtips",

  grill_vs_smoker:
    "grill vs smoker. speed and char vs patience and bark. when each one actually wins — tested side by side.\npost your BBQ cook on BiteClub and save the winning method to your \"BBQ\" cookbook — your followers will thank you.\n#grilling #smokingmeat #techniquewars #bbq #biteclub #grillmaster",

  stovetop_vs_instant_pot:
    "stovetop braised short rib vs Instant Pot braised short rib. we timed both. we tasted both. here's the verdict.\nthe winning method gets a pin on your BiteClub profile — save it and cook it for someone worth impressing.\n#instantpot #stovetopbraised #techniquewars #slowcooking #biteclub #cookingtips",

  mortar_vs_blender:
    "mortar and pestle vs blender for curry paste. the old way takes 10 minutes longer. it genuinely tastes different.\ncook a Thai curry this week, add Thailand to your BiteClub Cuisines Cooked map, and use whatever you have.\n#mortarandpestle #blender #currypaste #techniquewars #thaicooking #biteclub",

  deep_fry_vs_shallow_fry:
    "deep fry vs shallow fry. submerged vs half-submerged. same oil, different result. here's when each one wins.\nwhichever gets crispier — post the result on BiteClub with a rating and let your followers weigh in on the texture.\n#deepfry #shallowfry #frying #techniquewars #homecooking #biteclub #foodtok",

  raw_vs_cooked_garlic:
    "raw garlic vs cooked garlic. same ingredient. completely different personality. knowing when to use each one is the difference.\nfind Discovery feed recipes on BiteClub that use both and cook them back to back — your Flavor Palate will shift.\n#garlic #rawvscooked #techniquewars #flavourtips #biteclub #cookingtips",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function VersusPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedPreset, setSelectedPreset] = useState<VersusPreset | null>(null);
  const [captionCopied, setCaptionCopied] = useState(false);

  const filteredPresets =
    activeCategory === 'all'
      ? PRESETS
      : PRESETS.filter((p) => p.category === activeCategory);

  const caption = selectedPreset ? TIKTOK_CAPTIONS[selectedPreset.id] || '' : '';

  function handleCopyCaption() {
    if (!caption) return;
    navigator.clipboard.writeText(caption).then(() => {
      setCaptionCopied(true);
      setTimeout(() => setCaptionCopied(false), 2000);
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* Back link */}
        <div className="mb-6">
          <Link
            href="/streams"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors"
          >
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M10 4L6 8l4 4" />
            </svg>
            Content Streams
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">⚔️</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Food Battles</h1>
              <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide">Pick a side</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 max-w-xl">
            Head-to-head comparisons that get people talking. Two dishes, two takes — the comments decide the winner. Pick a preset and grab the caption.
          </p>
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
            <span><strong className="text-gray-600">{PRESETS.length}</strong> battle presets</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span><strong className="text-gray-600">{CATEGORIES.length}</strong> categories</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>TikTok captions included</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left: category filter + preset grid */}
          <div className="flex-1 min-w-0">

            {/* Category filter pills */}
            <div className="flex flex-wrap gap-2 mb-5">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeCategory === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                }`}
              >
                All ({PRESETS.length})
              </button>
              {CATEGORIES.map((cat) => {
                const count = PRESETS.filter((p) => p.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      activeCategory === cat.id
                        ? 'bg-gray-900 text-white'
                        : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    {cat.label}
                    <span className={`text-[10px] ${activeCategory === cat.id ? 'text-gray-300' : 'text-gray-400'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Section label */}
            <div className="mb-3">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {activeCategory === 'all'
                  ? 'All Battles'
                  : CATEGORIES.find((c) => c.id === activeCategory)?.label}
              </h2>
            </div>

            {/* Preset grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
              {filteredPresets.map((preset) => {
                const isSelected = selectedPreset?.id === preset.id;
                const cat = CATEGORIES.find((c) => c.id === preset.category);
                return (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedPreset(isSelected ? null : preset)}
                    className={`group text-left rounded-xl border p-4 transition-all ${
                      isSelected
                        ? 'border-rose-400 bg-rose-50 ring-2 ring-rose-500/20 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0 mt-0.5">{preset.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isSelected ? 'text-rose-900' : 'text-gray-900'}`}>
                          {preset.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{preset.desc}</p>
                        {cat && (
                          <span className={`inline-block mt-2 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${cat.color}`}>
                            {cat.label}
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <svg viewBox="0 0 16 16" className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="3,8 6.5,11.5 13,5" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Right: caption panel */}
          <div className="lg:w-80 xl:w-96 flex-shrink-0">
            <div className="sticky top-6">

              {selectedPreset ? (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  {/* Panel header */}
                  <div className="h-1.5 bg-gradient-to-r from-rose-400 to-red-500" />
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{selectedPreset.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 leading-tight">{selectedPreset.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{selectedPreset.desc}</p>
                      </div>
                    </div>
                  </div>

                  {/* Caption */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">TikTok Caption</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 font-bold uppercase">TT</span>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3.5 mb-3">
                      <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-mono">
                        {caption}
                      </p>
                    </div>

                    <button
                      onClick={handleCopyCaption}
                      className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        captionCopied
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      {captionCopied ? 'Copied!' : 'Copy Caption'}
                    </button>
                  </div>

                  {/* Hashtag strip */}
                  <div className="px-5 pb-5">
                    <div className="flex flex-wrap gap-1">
                      {caption
                        .split('\n')
                        .filter((line) => line.startsWith('#'))
                        .join(' ')
                        .split(' ')
                        .filter((t) => t.startsWith('#'))
                        .map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-medium text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                  <span className="text-4xl block mb-3">⚔️</span>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Pick a battle</p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Click any preset to see the TikTok caption and hashtags — ready to copy and post.
                  </p>
                </div>
              )}

              {/* Stats footer */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`rounded-xl p-2.5 text-center border transition-all ${
                      activeCategory === cat.id
                        ? 'border-gray-300 bg-gray-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <span className="block text-lg mb-0.5">{cat.emoji}</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide leading-tight block">
                      {cat.label.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {PRESETS.filter((p) => p.category === cat.id).length}
                    </span>
                  </button>
                ))}
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
