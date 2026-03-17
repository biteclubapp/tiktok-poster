'use client';

import { useState } from 'react';
import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────────────────────────

interface StoryPreset {
  id: string;
  label: string;
  emoji: string;
  desc: string;
  category: string;
}

// ── Categories ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'family', label: 'Family Recipes', emoji: '👵', color: 'text-amber-700 bg-amber-50' },
  { id: 'origins', label: 'Cultural Origins', emoji: '🌍', color: 'text-blue-600 bg-blue-50' },
  { id: 'journey', label: 'Personal Journeys', emoji: '🛤️', color: 'text-emerald-600 bg-emerald-50' },
  { id: 'moments', label: 'Food Moments', emoji: '✨', color: 'text-purple-600 bg-purple-50' },
  { id: 'why', label: 'Why This Dish Matters', emoji: '❤️', color: 'text-rose-600 bg-rose-50' },
] as const;

// ── Presets ───────────────────────────────────────────────────────────────────

const PRESETS: StoryPreset[] = [
  // ── Family Recipes ──
  { id: 'grandma_secret', label: "Grandma's Secret Recipe", emoji: '👵', desc: "She never wrote it down. You watched, guessed, and finally got it right", category: 'family' },
  { id: 'dads_sunday_dish', label: "Dad's Sunday Dish", emoji: '👨‍🍳', desc: "Every Sunday, same pot, same smell. You didn't realize it was love language until later", category: 'family' },
  { id: 'moms_comfort_food', label: "Mom's Comfort Food", emoji: '🫂', desc: "The dish that appears every time something goes wrong. It still works", category: 'family' },
  { id: 'family_recipe_almost_lost', label: 'The Recipe That Almost Got Lost', emoji: '📜', desc: "She passed away before you thought to ask. This is how you reconstructed it", category: 'family' },
  { id: 'immigrant_kitchen', label: 'The Immigrant Kitchen', emoji: '🧳', desc: "The food they made when they couldn't find the ingredients back home — and what they substituted", category: 'family' },
  { id: 'holiday_dish_origin', label: "Why We Always Make That Holiday Dish", emoji: '🎄', desc: "Every family has the non-negotiable one. Here's where ours came from", category: 'family' },
  { id: 'teaching_the_next_one', label: 'Teaching a Kid to Cook Grandma\'s Recipe', emoji: '👧', desc: "Three generations in the kitchen at once. The recipe doesn't change. The people do", category: 'family' },

  // ── Cultural Origins ──
  { id: 'history_of_ramen', label: 'The Surprising History of Ramen', emoji: '🍜', desc: "It's not originally Japanese. The real origin story is more interesting than the dish", category: 'origins' },
  { id: 'where_pizza_came_from', label: 'Pizza Isn\'t What You Think It Is', emoji: '🍕', desc: "The flat bread from Naples looked nothing like what you order on Friday night", category: 'origins' },
  { id: 'how_curry_traveled', label: 'How Curry Traveled the World', emoji: '🍛', desc: "From India to Japan to Britain — how one word came to mean completely different things", category: 'origins' },
  { id: 'tacos_real_history', label: 'The Real History of Tacos', emoji: '🌮', desc: "Silver miners in Mexico, not Tex-Mex chains. The origin is more interesting than the chain version", category: 'origins' },
  { id: 'soy_sauce_origin', label: 'Soy Sauce: 2,500 Years Old and Still Here', emoji: '🫙', desc: "How fermented soybeans in ancient China became the most used condiment on the planet", category: 'origins' },
  { id: 'pasta_not_from_italy', label: 'Pasta Didn\'t Start in Italy', emoji: '🍝', desc: "Marco Polo didn't bring it from China either. The real story is messier and better", category: 'origins' },
  { id: 'how_hot_sauce_conquered', label: 'How Hot Sauce Conquered the World', emoji: '🌶️', desc: "From Mayan chiles to every table in America — capsaicin's global takeover took centuries", category: 'origins' },

  // ── Personal Journeys ──
  { id: 'cooking_changed_my_life', label: 'How Cooking Changed My Life', emoji: '🔄', desc: "Not in a cliché way. In a real, specific, embarrassingly small way that mattered enormously", category: 'journey' },
  { id: 'meal_that_started_it_all', label: 'The Meal That Started It All', emoji: '⚡', desc: "One dish. One moment. Before that you burned toast. After that you were a cook", category: 'journey' },
  { id: 'learning_to_cook_alone', label: 'Learning to Cook After Moving Out', emoji: '🏠', desc: "First attempt: questionable. Six months later: you had a signature dish. Here's what changed", category: 'journey' },
  { id: 'cooking_through_grief', label: 'Cooking Through Grief', emoji: '🌧️', desc: "When words don't work, the kitchen does. This is the honest version of that", category: 'journey' },
  { id: 'diet_change_story', label: 'Why I Changed How I Eat', emoji: '🥗', desc: "Not a conversion story. Just a slow, honest shift — and what actually stayed the same", category: 'journey' },
  { id: 'cooking_with_no_money', label: 'Cooking When There\'s No Money', emoji: '💰', desc: "Beans, rice, creativity, and the specific dignity of making something good from almost nothing", category: 'journey' },
  { id: 'restaurant_job_truth', label: 'What Working in a Restaurant Taught Me', emoji: '👨‍🍳', desc: "Six months in a professional kitchen changes how you see every meal you ever eat after it", category: 'journey' },

  // ── Food Moments ──
  { id: 'first_time_cooking_alone', label: 'The First Time I Cooked Alone', emoji: '🕯️', desc: "The kitchen was empty. You were scared. The thing you made was either terrible or magical — no middle ground", category: 'moments' },
  { id: 'dish_that_impressed_everyone', label: 'The Dish That Impressed Everyone', emoji: '🫢', desc: "You made it once and suddenly everyone thought you could cook. You were as surprised as they were", category: 'moments' },
  { id: 'cooking_fail_became_win', label: 'The Cooking Fail That Became a Win', emoji: '🔥', desc: "You burnt it, dropped it, or completely misread the recipe. What happened next was better", category: 'moments' },
  { id: 'cooking_for_someone_important', label: 'Cooking for Someone Who Mattered', emoji: '❤️', desc: "First dinner party, first date, the meal before a hard conversation — food as intent, not just food", category: 'moments' },
  { id: 'the_meal_i_remember_most', label: 'The Meal I Remember Most', emoji: '🎞️', desc: "It wasn't the fanciest. It wasn't even that good. But you remember every detail of it", category: 'moments' },
  { id: 'cooking_in_a_foreign_country', label: 'Cooking in a Foreign Kitchen', emoji: '✈️', desc: "Wrong ingredients, wrong equipment, no idea what the oven settings mean. Making it work anyway", category: 'moments' },
  { id: 'the_recipe_i_never_share', label: 'The Recipe I Never Share', emoji: '🤫', desc: "Everyone asks. You smile. You say it's just salt and time. It isn't just salt and time", category: 'moments' },

  // ── Why This Dish Matters ──
  { id: 'comfort_food_psychology', label: 'Why Comfort Food Actually Works', emoji: '🧠', desc: "The neuroscience is real. Taste and memory share the same brain real estate — that's not a metaphor", category: 'why' },
  { id: 'food_and_memory', label: 'Why Smell Is the Strongest Memory Trigger', emoji: '👃', desc: "One whiff and you're 9 years old again. There's a reason for that and it's kind of beautiful", category: 'why' },
  { id: 'taste_and_nostalgia', label: 'Why You\'ll Never Taste Childhood Food the Same Way', emoji: '🕰️', desc: "The food hasn't changed. Your palate has. The nostalgia is doing work the dish can't do alone", category: 'why' },
  { id: 'why_we_feed_grief', label: 'Why People Bring Food When Someone Dies', emoji: '🫶', desc: "Every culture does it. The psychology behind why feeding people is the oldest grief ritual we have", category: 'why' },
  { id: 'the_dish_that_means_home', label: 'The Dish That Means Home', emoji: '🏡', desc: "Not where you were born. The place that felt like being okay — food is how we map it in our bodies", category: 'why' },
  { id: 'why_we_eat_together', label: 'Why Eating Alone Feels Different', emoji: '🪑', desc: "The same meal. Different experience when eaten alone vs with someone. There's a biological reason for this", category: 'why' },
  { id: 'food_as_love_language', label: 'Food as a Love Language', emoji: '💌', desc: "Some people don't say it. They make it. They plate it. They watch you eat it. That counts", category: 'why' },
];

// ── TikTok Captions ───────────────────────────────────────────────────────────

const TIKTOK_CAPTIONS: Record<string, string> = {
  // FAMILY RECIPES
  grandma_secret:
    "she never wrote it down. you watched her hands, guessed the measurements, made it wrong the first six times.\nyou got it right eventually — save it to your BiteClub Cooking History so no one has to guess again.\n#grandmarecipe #familyrecipe #foodmemory #heirloomrecipe #biteclub #cookingheritage",

  dads_sunday_dish:
    "every sunday. same pot. same smell drifting down the hallway. you didn't know it was love language until you moved out.\nreconstruct it and post it on BiteClub with the story in the caption — that recipe deserves more than a group chat message.\n#dadscooking #sundaydinner #familyrecipe #foodnostalgia #biteclub #homecooking",

  moms_comfort_food:
    "she made it every time something was wrong. job interview, breakup, bad news. it still works.\npin it to your BiteClub profile — it's the dish that tells people who you are before you say a word.\n#momscooking #comfortfood #familyrecipe #foodmemory #biteclub #homecooking",

  family_recipe_almost_lost:
    "she passed before you thought to ask. you spent three years reconstructing it from memory, smell, and guesswork.\nimport the version you landed on to BiteClub — your Cooking History is where that story lives now.\n#lostrecipe #familyrecipe #recipeheritage #foodmemory #biteclub #cookingheritage",

  immigrant_kitchen:
    "they couldn't find the real ingredients. they used what was available and called it something else.\npost the adapted version on BiteClub's Discovery feed — someone out there is doing the same substitution right now.\n#immigrantfood #culturalcooking #foodheritage #adaptedrecipe #biteclub #worldcuisine",

  holiday_dish_origin:
    "every family has the non-negotiable one. the dish that isn't optional. someone brought it once in 1987 and now it's law.\ntell the story in your BiteClub post caption and save it to a \"Family Traditions\" cookbook — before the person who makes it can't.\n#holidayfood #familytraditions #foodheritage #festivecooking #biteclub #familyrecipe",

  teaching_the_next_one:
    "three generations in the kitchen. the recipe doesn't change. the hands do.\npost the cook session on BiteClub and tag the dish as a family recipe — that photo is the whole story.\n#cookingtogether #familyrecipe #generationalcooking #kitchenheritage #biteclub #cookingwithkids",

  // CULTURAL ORIGINS
  history_of_ramen:
    "ramen isn't originally Japanese. the full origin story crosses three countries and a World War. we're telling it.\nadd Japan to your BiteClub Cuisines Cooked map by making a bowl this weekend — the history tastes better when you cook it.\n#ramenhistory #foodhistory #japanesefood #culturalfood #biteclub #foodorigins",

  where_pizza_came_from:
    "the pizza that came out of Naples in the 1800s looked nothing like what you order on a Friday. nothing.\nfind a Neapolitan pizza recipe on BiteClub's Discovery feed and cook the original — add Italy to your map properly.\n#pizzahistory #napoletanapizza #foodhistory #italianfood #biteclub #foodorigins",

  how_curry_traveled:
    "from India to Japan to Jamaica to Britain — \"curry\" means completely different things in every country it landed in.\ncook one version this week and add a new pin to your BiteClub Cuisines Cooked map. then another. then another.\n#curryhistory #foodhistory #indianfood #globalfood #biteclub #foodorigins",

  tacos_real_history:
    "tacos didn't start in Tex-Mex restaurants. they started with Mexican silver miners and flatbreads you've never seen.\ncook a proper taco this week from someone who knows — find them on BiteClub's Discovery feed and add Mexico to your map.\n#tacohistory #mexicanfoodhistory #foodorigins #culturalfood #biteclub #tacos",

  soy_sauce_origin:
    "2,500 years old. started as a fermented soybean paste in China. ended up on every table in the world.\nfind a recipe on BiteClub's Discovery feed that lets soy sauce be the main character — your Flavor Palate's Umami bar will thank you.\n#soysaucehistory #foodhistory #fermentation #chinesefood #biteclub #foodorigins",

  pasta_not_from_italy:
    "pasta didn't start in Italy. Marco Polo didn't bring it from China either. the real story is messier and more interesting.\ncook a pasta dish this week, post it on BiteClub, and tell your followers what you just learned. the comments will go.\n#pastahistory #foodorigins #italianfood #foodmyths #biteclub #cookingtrivia",

  how_hot_sauce_conquered:
    "capsaicin went from Mayan chiles to every restaurant table in America over about 500 years. here's how.\ncook something with fresh chiles this week and watch your BiteClub Flavor Palate Spice bar climb. history in real time.\n#hotsaucehistory #foodhistory #spicyfood #capsaicin #biteclub #foodorigins",

  // PERSONAL JOURNEYS
  cooking_changed_my_life:
    "not in a dramatic way. in a specific, embarrassingly small way that turned out to matter more than anything big.\npost the dish that represents that shift on BiteClub — your Cooking History is where that story gets told honestly.\n#cookingchangedme #personalgrowth #homecooking #foodjourney #biteclub #cookingtok",

  meal_that_started_it_all:
    "before that meal you burned toast and called it dinner. after it, something was different. you were a cook now.\npin that dish to your BiteClub profile — it's the origin story every food person has and nobody asks about.\n#firstcook #cookingorigins #foodjourney #learntocook #biteclub #cookingtok",

  learning_to_cook_alone:
    "first attempt: concerning. six months later: a signature dish and an opinion about garlic quantity.\ntrack that growth on BiteClub — your weekly streak calendar and Type of Cook badge update as the gap between you and that first attempt gets bigger.\n#movingout #learntocook #cookingprogress #adultingfood #biteclub #cookingtok",

  cooking_through_grief:
    "when the words don't work, the kitchen does. the repetition helps. the outcome isn't the point.\nyour BiteClub Cooking History becomes the quiet record of the days you showed up anyway — post what you made.\n#cookingtherapy #grief #mentalhealth #kitchentherapy #biteclub #homecooking",

  diet_change_story:
    "it wasn't a sudden conversion. it was slow, messy, specific, and the pasta never actually went away.\nfollow people on BiteClub's Discovery feed who cook the way you want to eat — that feed becomes the path forward.\n#eatinghabits #dietchange #homecooking #realfood #biteclub #nutritionjourney",

  cooking_with_no_money:
    "beans, rice, one good knife, and the specific dignity of making something genuinely good from almost nothing.\nsave a \"Budget Builds\" cookbook on BiteClub — every recipe that works from the bottom of the pantry belongs there.\n#budgetcooking #cheapmeals #cookingwithless #pastanight #biteclub #savemoney",

  restaurant_job_truth:
    "six months in a professional kitchen changes how you see every plate you eat for the rest of your life.\npost what you cook now on BiteClub — your Type of Cook badge will start to reflect what that experience built.\n#restaurantlife #professionalcooking #kitchenlife #cookingtok #biteclub #foodindustry",

  // FOOD MOMENTS
  first_time_cooking_alone:
    "the kitchen was empty. nobody to help. nobody to blame. the thing you made was either terrible or actually magic.\npost the dish that was your version of that moment on BiteClub — everyone has one and nobody talks about it.\n#firstcook #cookingalone #kitchenconfidence #adultingfood #biteclub #cookingtok",

  dish_that_impressed_everyone:
    "you made it once. suddenly everyone assumed you could cook. you were as surprised as they were.\npin it to your BiteClub profile — the dish that built the reputation deserves to be there permanently.\n#impressivecooking #dinnerparty #cookingconfidence #homecook #biteclub #cookingtok",

  cooking_fail_became_win:
    "you burnt it, dropped it, misread tablespoons as cups, or all three at once. what came out was somehow better.\npost it on BiteClub with exactly what went wrong in the caption — your followers need to hear this one.\n#cookingfail #kitchenfail #happyaccident #cookingtok #biteclub #homecooking",

  cooking_for_someone_important:
    "first dinner for someone you wanted to impress. or the meal before a hard conversation. food as intention.\npin that recipe to your BiteClub profile — it's the dish that holds the most context of anything you've ever cooked.\n#cookingforlove #dinnerdate #specialmeal #foodandlove #biteclub #homecooking",

  the_meal_i_remember_most:
    "it wasn't the most expensive meal. it wasn't even that good technically. you remember every detail anyway.\nfind something close to it on BiteClub's Discovery feed and cook your own version — memory improves with the remake.\n#foodmemory #memorablemeal #nostalgiafood #homecooking #biteclub #foodstory",

  cooking_in_a_foreign_country:
    "wrong ingredients, wrong oven, the labelling makes no sense. you made it work anyway and it tasted different.\nwhen you get home — import the adapted version to BiteClub from wherever you found it. that variation is worth keeping.\n#cookingabroad #travelcooking #foreignkitchen #adaptedrecipe #biteclub #travelfood",

  the_recipe_i_never_share:
    "everyone asks. you smile. you say it's just salt and time. it isn't just salt and time.\nsave it to a private BiteClub cookbook — you don't have to share it, but you also shouldn't lose it.\n#secretrecipe #familysecret #signaturecook #homecooking #biteclub #cookingtok",

  // WHY THIS DISH MATTERS
  comfort_food_psychology:
    "comfort food isn't nostalgia. it's neurochemistry. the brain links taste to emotional memory at the cellular level.\nfind your comfort dishes in BiteClub's Discovery feed and save them to a \"Comfort Toolkit\" cookbook — for when you need them.\n#comfortfood #foodscience #foodpsychology #neuroscience #biteclub #foodtok",

  food_and_memory:
    "smell is the only sense with a direct line to the memory and emotion centres of the brain. no filter. full access.\npost a dish that unlocks a memory on BiteClub with the story in the caption — your Cooking History is a memory archive too.\n#smellmemory #foodmemory #nostalgiafood #foodscience #biteclub #foodtok",

  taste_and_nostalgia:
    "the food hasn't changed. your palate has changed. the nostalgia is doing heavy lifting the dish can't do alone. this is science.\nbuild the real version and post it on BiteClub — let your star rating be honest while the memory isn't.\n#tastememory #nostalgia #comfortfood #foodpsychology #biteclub #foodtok",

  why_we_feed_grief:
    "every culture on earth brings food when someone dies. this isn't coincidence. the psychology goes back to our oldest social rituals.\nif you cooked for someone going through something hard — post it on BiteClub. that recipe is doing real work.\n#grief #foodandemotion #culturalritual #comfortcooking #biteclub #foodtok",

  the_dish_that_means_home:
    "not the place you were born. the place that felt like being okay. food is how we carry that in our bodies.\nfind that dish on BiteClub's Discovery feed or import the recipe — add it to a \"Home\" cookbook. one recipe, that's all it takes.\n#homefood #foodnostalgia #comfortfood #foodmemory #biteclub #homecooking",

  why_we_eat_together:
    "the same meal tastes different alone. this isn't a feeling. it's biology. shared eating changes your neurochemistry.\npost what you cook with other people on BiteClub — your Cooking History quietly records the ones that mattered.\n#eatingtogether #sharedmeals #foodscience #socialcooking #biteclub #foodtok",

  food_as_love_language:
    "some people don't say it. they make it. they adjust the spice for you. they watch you eat before they eat.\npost a dish you made for someone on BiteClub and let the recipe tell the story — the caption can just say who it was for.\n#lovelanguage #cookingforlove #foodandlove #actsoflove #biteclub #foodtok",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function StoriesPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedPreset, setSelectedPreset] = useState<StoryPreset | null>(null);
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
            <span className="text-4xl">📖</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Food Stories</h1>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">The feels</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 max-w-xl">
            Emotional, cultural, personal food narratives. The story behind the dish. These are the posts people save and send to their mum. Pick a preset, grab the caption.
          </p>
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
            <span><strong className="text-gray-600">{PRESETS.length}</strong> story presets</span>
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
                  ? 'All Stories'
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
                        ? 'border-stone-400 bg-stone-50 ring-2 ring-stone-500/20 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0 mt-0.5">{preset.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isSelected ? 'text-stone-900' : 'text-gray-900'}`}>
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
                        <svg viewBox="0 0 16 16" className="w-4 h-4 text-stone-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5">
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
                  <div className="h-1.5 bg-gradient-to-r from-stone-400 to-stone-600" />
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
                            className="text-[10px] font-medium text-stone-600 bg-stone-50 px-1.5 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                  <span className="text-4xl block mb-3">📖</span>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Pick a story</p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Click any preset to see the TikTok caption and hashtags — ready to copy and post.
                  </p>
                </div>
              )}

              {/* Category quick-nav */}
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
