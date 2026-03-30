'use client';

import { useState } from 'react';
import Link from 'next/link';
import StreamCarouselGenerator from '@/components/StreamCarouselGenerator';

// ── Content presets (grouped by category) ────────────────────────────────────

interface ContentPreset {
  id: string;
  label: string;
  emoji: string;
  desc: string;
  category: string;
}

const CATEGORIES = [
  { id: 'anti_aesthetic', label: 'Anti-Aesthetic', emoji: '\u{1F645}', color: 'text-rose-600 bg-rose-50' },
  { id: 'real_food', label: 'Real Food', emoji: '\u{1F372}', color: 'text-amber-600 bg-amber-50' },
  { id: 'doom_scroll', label: 'Anti-Doom Scroll', emoji: '\u{1F4F1}', color: 'text-slate-600 bg-slate-50' },
  { id: 'hot_takes', label: 'Hot Takes', emoji: '\u{1F525}', color: 'text-orange-600 bg-orange-50' },
  { id: 'raw_honesty', label: 'Raw Honesty', emoji: '\u{1F9BE}', color: 'text-stone-600 bg-stone-50' },
  { id: 'counter_culture', label: 'Counter Culture', emoji: '\u270A', color: 'text-purple-600 bg-purple-50' },
] as const;

const PRESETS: ContentPreset[] = [
  // ── Anti-Aesthetic ──
  { id: 'food_doesnt_need_to_look_good', label: 'Your Food Doesn\'t Need to Look Good', emoji: '\u{1F644}', desc: 'Stop plating for the camera. Plate for your mouth.', category: 'anti_aesthetic' },
  { id: 'nobody_cares_garnish', label: 'Nobody Cares About Your Garnish', emoji: '\u{1F33F}', desc: 'The parsley isn\'t fooling anyone.', category: 'anti_aesthetic' },
  { id: 'overhead_shot_lie', label: 'The Overhead Shot Is a Lie', emoji: '\u{1F4F8}', desc: 'What the camera doesn\'t show you.', category: 'anti_aesthetic' },
  { id: 'ugly_food_tastes_better', label: 'Ugly Food Tastes Better', emoji: '\u{1F95F}', desc: 'The science of imperfect cooking.', category: 'anti_aesthetic' },
  { id: 'stop_cooking_for_content', label: 'Stop Cooking for Content', emoji: '\u{1F3AC}', desc: 'When the photo matters more than the meal.', category: 'anti_aesthetic' },
  { id: 'instagram_vs_reality', label: 'The Instagram vs Reality Plate', emoji: '\u{1F4F1}', desc: 'Same food, different angles. One is a lie.', category: 'anti_aesthetic' },
  { id: 'no_one_asked_for_drizzle', label: 'No One Asked for That Drizzle', emoji: '\u{1F35D}', desc: 'The sauce zigzag is not a personality.', category: 'anti_aesthetic' },

  // ── Real Food ──
  { id: 'what_dinner_looks_like', label: 'This Is What Dinner Actually Looks Like', emoji: '\u{1F37D}\uFE0F', desc: 'No styling. No filter. Just food on a plate.', category: 'real_food' },
  { id: 'weeknight_pasta_valid', label: 'Your Weeknight Pasta Is Valid', emoji: '\u{1F35D}', desc: 'Not everything needs to be special.', category: 'real_food' },
  { id: 'meal_nobody_posts', label: 'The Meal Nobody Posts', emoji: '\u{1F316}', desc: 'The 10pm fridge rummage deserves respect.', category: 'real_food' },
  { id: 'cooking_alone_tuesday', label: 'Cooking Alone on a Tuesday', emoji: '\u{1F9D1}\u200D\u{1F373}', desc: 'No audience needed. Just you and a pan.', category: 'real_food' },
  { id: 'leftovers_lifestyle', label: 'Leftovers Are a Lifestyle', emoji: '\u{1F4E6}', desc: 'Reheated food appreciation post.', category: 'real_food' },
  { id: 'three_ingredient_dinner', label: 'The 3-Ingredient Dinner', emoji: '\u2728', desc: 'Simplicity isn\'t lazy. It\'s efficient.', category: 'real_food' },
  { id: 'brown_food_delicious', label: 'Brown Food Is Delicious', emoji: '\u{1F35B}', desc: 'The most delicious food is the ugliest.', category: 'real_food' },

  // ── Anti-Doom Scroll ──
  { id: 'another_recipe_never_cook', label: 'Another Recipe to Save and Never Cook', emoji: '\u{1F516}', desc: 'The last thing you need is another saved recipe you\'ll forget.', category: 'doom_scroll' },
  { id: 'saved_847_cooked_3', label: 'You\'ve Saved 847 Recipes and Cooked 3', emoji: '\u{1F4DA}', desc: 'Saved does not equal cooked.', category: 'doom_scroll' },
  { id: 'stop_watching_cook', label: 'Stop Watching People Cook and Actually Cook', emoji: '\u{1F440}', desc: 'The scroll trap is real.', category: 'doom_scroll' },
  { id: 'food_content_worse_cooking', label: 'Food Content Is Making You Worse at Cooking', emoji: '\u{1F4C9}', desc: 'Hot take with data to back it up.', category: 'doom_scroll' },
  { id: 'phone_eats_first', label: 'Your Phone Eats First and That\'s the Problem', emoji: '\u{1F4F2}', desc: 'Performative eating is killing the meal.', category: 'doom_scroll' },
  { id: 'doom_scroll_11pm', label: 'Doom Scrolling Food Content at 11pm', emoji: '\u{1F319}', desc: 'We\'ve all been there. It helps nothing.', category: 'doom_scroll' },
  { id: 'recipe_youll_actually_make', label: 'The Recipe You\'ll Actually Make', emoji: '\u2705', desc: 'Your saved-to-cooked ratio is embarrassing.', category: 'doom_scroll' },

  // ── Hot Takes ──
  { id: 'meal_prep_toxic', label: 'Meal Prep Content Is Toxic', emoji: '\u{1F4A3}', desc: 'The Sunday meal prep lie needs to stop.', category: 'hot_takes' },
  { id: 'influencers_dont_cook', label: 'Food Influencers Don\'t Cook Like That', emoji: '\u{1F3AD}', desc: 'Behind the scenes of the perfect cooking reel.', category: 'hot_takes' },
  { id: 'cooking_no_audience', label: 'Your Cooking Doesn\'t Need an Audience', emoji: '\u{1F399}\uFE0F', desc: 'Cook for yourself. That\'s enough.', category: 'hot_takes' },
  { id: 'restaurant_overrated', label: 'Restaurant Food Is Overrated', emoji: '\u{1F37D}\uFE0F', desc: 'Home cooking supremacy.', category: 'hot_takes' },
  { id: 'nobody_needs_47_spices', label: 'Nobody Needs 47 Spices', emoji: '\u{1F9C2}', desc: 'Pantry minimalism. Salt, pepper, heat. Done.', category: 'hot_takes' },
  { id: 'reel_60s_cleanup_60m', label: 'The Reel Is 60 Seconds, The Cleanup Is 60 Minutes', emoji: '\u{1F9F9}', desc: 'Nobody shows the aftermath.', category: 'hot_takes' },

  // ── Raw Honesty ──
  { id: 'same_5_meals', label: 'Most People Eat the Same 5 Meals', emoji: '\u{1F503}', desc: 'And that\'s completely fine. Normalizing the rotation.', category: 'raw_honesty' },
  { id: 'dont_need_dutch_oven', label: 'You Don\'t Need a Dutch Oven', emoji: '\u{1F373}', desc: 'The gear lie is expensive. A pot is a pot.', category: 'raw_honesty' },
  { id: 'kitchen_is_fine', label: 'Your Kitchen Is Fine', emoji: '\u{1F3E0}', desc: 'Stop comparing it to renovated content kitchens.', category: 'raw_honesty' },
  { id: 'burnt_edges_seasoning', label: 'Burnt Edges Are Seasoning', emoji: '\u{1F525}', desc: 'Imperfection is flavour. Crispy bits are chef\'s kisses.', category: 'raw_honesty' },
  { id: 'recipe_didnt_fail', label: 'The Recipe Didn\'t Fail, Your Expectations Did', emoji: '\u{1F4A1}', desc: 'It doesn\'t have to look like the picture.', category: 'raw_honesty' },
  { id: 'cooking_tired', label: 'Cooking Tired Hits Different', emoji: '\u{1F634}', desc: 'End-of-day cooking is a different sport entirely.', category: 'raw_honesty' },

  // ── Counter Culture ──
  { id: 'built_because_broken', label: 'We Built BiteClub Because Food Apps Are Broken', emoji: '\u{1F6E0}\uFE0F', desc: 'The manifesto. Why everything else sucks.', category: 'counter_culture' },
  { id: 'anti_food_app', label: 'The Anti-Food-App Food App', emoji: '\u26A1', desc: 'BiteClub positioning in one sentence.', category: 'counter_culture' },
  { id: 'no_filters_no_followers', label: 'No Filters. No Followers. Just Food.', emoji: '\u{1F374}', desc: 'The BiteClub thesis.', category: 'counter_culture' },
  { id: 'history_over_aesthetic', label: 'Your Cooking History > Your Feed Aesthetic', emoji: '\u{1F4CA}', desc: 'What you\'ve actually cooked matters more.', category: 'counter_culture' },
  { id: 'no_trending_recipes', label: 'We Don\'t Do Trending Recipes', emoji: '\u{1F6AB}', desc: 'Against algorithmic cooking.', category: 'counter_culture' },
  { id: 'nobody_cares_kitchen', label: 'Nobody Cares What Your Kitchen Looks Like', emoji: '\u{1F3E1}', desc: 'BiteClub: where the food matters, not the backdrop.', category: 'counter_culture' },
  { id: 'world_doesnt_need_another', label: 'The World Doesn\'t Need Another App to Doom Scroll', emoji: '\u{1F30D}', desc: 'That\'s why we built something different.', category: 'counter_culture' },
];

// ── TikTok captions ──────────────────────────────────────────────────────────

const TIKTOK_CAPTIONS: Record<string, string> = {
  // ANTI-AESTHETIC
  food_doesnt_need_to_look_good: "your food doesn't need to look good. it needs to be eaten. by you. while it's hot. nobody on the internet needs to approve your dinner.\nBiteClub tracks what you actually cook, not what you plate for the camera — your Cooking History is yours, not content. link in bio.\n#antifoodculture #realfood #biteclub #stopplating #foodisntcontent #cookingtok #homecooking #foodtok",
  nobody_cares_garnish: "the microparsley on top isn't doing what you think it's doing. nobody has ever said \"this tastes amazing because of the garnish.\"\nBiteClub doesn't care how your food looks — just that you cooked it. your cooking streak counts every meal, garnished or not. download BiteClub.\n#garnishisalie #realcooking #biteclub #antifoodculture #honestfood #cookingtok #foodtok #stopgarnishing",
  overhead_shot_lie: "the overhead shot: clean counter, perfect lighting, ingredients in tiny bowls. the reality: flour everywhere, dog barking, smoke alarm going off.\nBiteClub lives in the reality. log what you actually made, not the styled version. your Cooking History is honest. link in bio.\n#overheadshot #foodphotography #biteclub #realcooking #antiaesthetic #cookingtok #foodvsreality #behindthescenes",
  ugly_food_tastes_better: "stews. curries. casseroles. braises. the ugliest foods on earth are the most delicious. you know this. instagram doesn't.\nBiteClub rates food by stars, not aesthetics. your Flavor Palate tracks taste, not presentation. try BiteClub free.\n#uglyfood #delicious #biteclub #antiaesthetic #brownfood #comfortfood #realfood #homecooking #foodtok",
  stop_cooking_for_content: "if you spend more time photographing your food than eating it, the food isn't the point anymore. you are performing. not cooking.\nBiteClub is for people who cook to eat. your cooking streak doesn't need proof — just consistency. download BiteClub.\n#stopcookingforcontent #performativecooking #biteclub #realcooking #antifoodculture #eatyourfood #cookingtok #foodtok",
  instagram_vs_reality: "left: the instagram version with natural light and linen napkins. right: the same food under kitchen fluorescents on a paper towel. both taste exactly the same.\nBiteClub doesn't have a photo requirement. log meals with or without pics — your Type of Cook badge is earned by cooking, not curating. link in bio.\n#instagramvsreality #foodvsreality #biteclub #antiaesthetic #honestcooking #cookingtok #realfood #foodtok",
  no_one_asked_for_drizzle: "the sauce zigzag across the plate. the balsamic reduction drizzle on everything. the edible flowers on tuesday night pasta. who asked for this.\nBiteClub: where nobody is drizzling anything for clout. log your actual meal and move on. your Cooking History respects simplicity. link in bio.\n#saucedrizzle #plating #biteclub #antiaesthetic #simplefood #realcooking #cookingtok #foodtok #stopit",

  // REAL FOOD
  what_dinner_looks_like: "this is what dinner actually looks like. no mise en place bowls. no marble countertop. just food, a fork, and maybe the TV on in the background.\nBiteClub was built for this. log real meals, build your Cooking History, earn your streak. no styling required. link in bio.\n#realdinner #honestfood #biteclub #realcooking #weeknightdinner #nofilter #homecooking #cookingtok #foodtok",
  weeknight_pasta_valid: "your weeknight pasta with jarred sauce and whatever cheese was already open is a valid meal. it fed you. that's the whole point.\nBiteClub counts every meal equally. pasta from a jar builds your cooking streak just like a 3-hour braise. download BiteClub.\n#weeknightpasta #validmeal #biteclub #realfood #jarredsauce #homecooking #cookingtok #noguilt #foodtok",
  meal_nobody_posts: "the 10pm fridge rummage. crackers with cheese. leftover rice with an egg on top. toast with whatever's in the fridge. this is the meal nobody posts but everyone eats.\nBiteClub is the only place this meal gets the respect it deserves. log it. it counts. your Cooking History sees you. link in bio.\n#fridgerummage #latenightsnack #biteclub #realfood #honestcooking #theunpostedmeal #cookingtok #foodtok",
  cooking_alone_tuesday: "cooking alone on a tuesday night. no story to post. no one to impress. just you, a pan, and whatever sounded good.\nBiteClub is built for solo cooks. your cooking streak is between you and the app. no followers, no likes, no performance. try BiteClub free.\n#solocooking #cookingalone #biteclub #realfood #tuesdaydinner #noaudience #cookingtok #homecooking #foodtok",
  leftovers_lifestyle: "leftovers are not failure. leftovers are strategy. yesterday's dinner is today's lunch and that's called efficiency.\nBiteClub tracks every meal, including the reheated ones. your Cuisines Cooked map doesn't discriminate against microwaved leftovers. link in bio.\n#leftovers #mealstrategy #biteclub #realfood #reheatedandproud #homecooking #cookingtok #foodtok #noshame",
  three_ingredient_dinner: "butter. pasta. parmesan. done. three ingredients. ten minutes. complete meal. this isn't lazy. this is cacio e pepe energy.\nBiteClub celebrates the simple meals. build a cookbook called \"3 Ingredients or Less\" and watch it become your most-used. download BiteClub.\n#3ingredients #simpledinner #biteclub #realfood #minimalistcooking #easymeals #cookingtok #foodtok #lessis more",
  brown_food_delicious: "the most delicious food in the world is brown. stews, curries, roasts, gravy, caramelized everything. brown food doesn't photograph well but it eats like a dream.\nBiteClub doesn't care about color theory. your Flavor Palate knows brown is beautiful. log every ugly delicious meal. link in bio.\n#brownfood #uglydelicious #biteclub #realfood #comfortfood #honestcooking #cookingtok #foodtok #stewseason",

  // ANTI-DOOM SCROLL
  another_recipe_never_cook: "the last thing you need right now is another recipe video to save and never look at again. you have hundreds already. you know this.\nBiteClub is the opposite of a scroll feed. your Discovery feed shows meals real people actually cooked — not content. and you'll actually make them. link in bio.\n#savedrecipes #nevercooked #biteclub #antidoomscroll #realcooking #stopscrolling #cookingtok #foodtok",
  saved_847_cooked_3: "you've saved 847 recipes on instagram. you've cooked 3 of them. maybe 2. the save button is not cooking. it's hoarding.\nBiteClub tracks what you actually cook, not what you save. your Cooking History is real meals, not bookmarks. try BiteClub free.\n#saved847cooked3 #recipehoarder #biteclub #antidoomscroll #actuallycooked #cookingtok #foodtok #realcooking",
  stop_watching_cook: "you've been watching people cook for 45 minutes. you could have cooked an entire meal in that time. put the phone down.\nBiteClub doesn't want your screen time. it wants your stove time. start a cooking streak and actually use your kitchen. download BiteClub.\n#stopscrolling #actuallycook #biteclub #antidoomscroll #putthephonedown #cookingtok #foodtok #homecooking",
  food_content_worse_cooking: "hot take: food content is making you a worse cook. you're comparing your tuesday dinner to a professional production with a team of 5 and wondering why yours looks different.\nBiteClub shows you real meals from real kitchens. your Discovery feed is actual cooking, not productions. link in bio.\n#hottake #foodcontent #biteclub #antidoomscroll #realexpectations #cookingtok #foodtok #comparisonisthethief",
  phone_eats_first: "your phone eats first. then you rearrange the plate. then you try a different angle. then the food is cold. then you eat cold food for a photo 4 people will see.\nBiteClub: where the food comes first. no photo required to log a meal. your cooking streak doesn't need proof. try BiteClub free.\n#phoneeats first #coldfood #biteclub #antidoomscroll #eatfirst #cookingtok #foodtok #performativeeating",
  doom_scroll_11pm: "it's 11pm. you're in bed. you're watching someone make a beautiful pasta from scratch. you will not make this pasta. you will never make this pasta. close the app.\nBiteClub doesn't do bedtime content. it's a cooking tool, not a scroll hole. your Cooking History updates when you cook, not when you watch. link in bio.\n#doomscrolling #11pm #biteclub #antidoomscroll #closethea pp #cookingtok #foodtok #scrolltrap",
  recipe_youll_actually_make: "here's a radical concept: a recipe you'll actually make. not save. not screenshot. actually walk into your kitchen and cook.\nBiteClub's cookbooks are built from meals you've actually cooked before. your Cooking History is your real recipe box. download BiteClub.\n#actuallymakeit #realrecipes #biteclub #antidoomscroll #cookdontscroll #cookingtok #foodtok #stophoarding",

  // HOT TAKES
  meal_prep_toxic: "meal prep content is toxic. no, you don't need to spend 6 hours on sunday cooking 35 containers of chicken and rice. that's not meal prep, that's a part-time job.\nBiteClub lets you cook day by day. your cooking streak rewards consistency, not marathon sunday sessions. link in bio.\n#mealprepistoxic #hottake #biteclub #antifoodculture #sundaylies #cookingtok #foodtok #realcooking",
  influencers_dont_cook: "food influencers don't cook like that when the camera is off. the perfect kitchen, the clean stovetop mid-cook, the ingredients pre-measured in matching bowls. it's a set. not a kitchen.\nBiteClub is for real kitchens. messy ones. your Type of Cook badge is earned by actually cooking, not performing. download BiteClub.\n#foodinfluencers #behindthescenes #biteclub #hottake #fakekitchens #cookingtok #foodtok #realcooking",
  cooking_no_audience: "you don't need an audience to cook. you don't need to narrate your process. you don't need to film it. just cook. eat. done.\nBiteClub is private by default. your Cooking History is for you. no followers, no likes, no comments section. try BiteClub free.\n#noaudience #cookforyourself #biteclub #hottake #privatecooking #cookingtok #foodtok #justcook",
  restaurant_overrated: "hot take: restaurant food is overrated. you're paying $24 for pasta that costs $3 to make at home. the ambiance is doing 80% of the work.\nBiteClub helps you build confidence in your own kitchen. your Cuisines Cooked map proves you don't need a reservation. link in bio.\n#restaurantfood #overrated #biteclub #hottake #homecookingsupremacy #cookingtok #foodtok #cookathome",
  nobody_needs_47_spices: "nobody needs 47 spices. salt, pepper, garlic, one chili, one acid. that's a kitchen. the rest is marketing.\nBiteClub doesn't require a stocked pantry. your Flavor Palate builds from what you actually use, not what you bought once and forgot about. download BiteClub.\n#spicerack #minimalism #biteclub #hottake #pantryminimalism #cookingtok #foodtok #keepitsimple",
  reel_60s_cleanup_60m: "the cooking reel is 60 seconds. the cleanup is 60 minutes. the grocery shopping was 45 minutes. the recipe testing was 3 failed attempts. but sure, it looks effortless.\nBiteClub respects the full process. your Cooking History includes the effort, not just the highlight reel. link in bio.\n#cleanuptok #behindthescenes #biteclub #hottake #thewholetruth #cookingtok #foodtok #honestcooking",

  // RAW HONESTY
  same_5_meals: "most people eat the same 5 meals on rotation and honestly that's completely fine. you found what works. you like it. it feeds you. rotation is strategy.\nBiteClub celebrates your rotation. your Cooking History shows your most-cooked meals with pride, not shame. link in bio.\n#mealrotation #same5meals #biteclub #rawhonesty #normalizerepetition #cookingtok #foodtok #homecooking",
  dont_need_dutch_oven: "you don't need a dutch oven. you don't need a stand mixer. you don't need a $300 knife. you need a pot, a pan, a sharp-enough knife, and the will to cook.\nBiteClub doesn't require gear. your cooking streak counts meals made with whatever you've got. try BiteClub free.\n#dutchoven #kitchengear #biteclub #rawhonesty #gearlies #cookingtok #foodtok #minimalistkitchen",
  kitchen_is_fine: "your kitchen is fine. the small one. the one with bad lighting. the one with 3 feet of counter space. professional content kitchens are sets. yours is real.\nBiteClub was built for every kitchen. your Type of Cook badge doesn't check your square footage. download BiteClub.\n#yourkitchenisfine #smallkitchen #biteclub #rawhonesty #realkitchens #cookingtok #foodtok #stopcomparing",
  burnt_edges_seasoning: "burnt edges are seasoning. the crispy bits at the bottom of the pan are flavour. the slightly charred cheese on top is perfect. stop calling it a mistake.\nBiteClub rates meals by taste, not appearance. your Flavor Palate appreciates the maillard reaction. log the crispy ones. link in bio.\n#burntedges #crispybits #biteclub #rawhonesty #imperfectcooking #cookingtok #foodtok #maillard",
  recipe_didnt_fail: "the recipe didn't fail. your expectations did. it doesn't look like the photo because the photo was styled by a professional with a $2000 camera and studio lighting.\nBiteClub doesn't do food styling. your Cooking History shows real results from real kitchens. that's the point. try BiteClub free.\n#recipefail #expectations #biteclub #rawhonesty #itsfinethough #cookingtok #foodtok #realresults",
  cooking_tired: "cooking tired hits different. the knife skills get sloppy. the measurements get approximate. the plating is \"food on plate.\" but you still cooked. and that counts.\nBiteClub counts tired cooking. your cooking streak doesn't care about your energy levels — it cares that you showed up. link in bio.\n#cookingtired #tiredcooking #biteclub #rawhonesty #endofday #cookingtok #foodtok #itstillcounts",

  // COUNTER CULTURE
  built_because_broken: "we built BiteClub because every food app is broken. they want your screen time, not your stove time. they want you scrolling, not cooking. we wanted the opposite.\nyour Cooking History, your Flavor Palate, your cookbooks — all built around actually cooking. not watching. not saving. cooking. download BiteClub.\n#biteclub #manifesto #antifoodculture #counterculture #foodapps #cookingtok #foodtok #webuiltsomethingdifferent",
  anti_food_app: "BiteClub is the anti-food-app food app. no endless scroll. no influencer content. no recipe hoarding. just a tool that tracks what you cook and helps you cook more.\nyour cooking streak, your Cuisines Cooked map, your Type of Cook badge — all earned by doing, not watching. link in bio.\n#biteclub #antifoodapp #counterculture #cookingtool #cookingtok #foodtok #differentbydesi gn #realcooking",
  no_filters_no_followers: "no filters. no followers. just food. that's BiteClub. your cooking is private. your meals aren't content. your kitchen isn't a set.\ntrack what you cook. build cookbooks from real meals. watch your Flavor Palate grow. no audience required. try BiteClub free.\n#biteclub #nofilters #nofollowers #justfood #counterculture #cookingtok #foodtok #privatecooking",
  history_over_aesthetic: "your cooking history is worth more than your feed aesthetic. what you've actually cooked over the last year matters. what your grid looks like doesn't.\nBiteClub tracks your real Cooking History — every meal, every cuisine, every experiment. that's your legacy, not a curated grid. download BiteClub.\n#cookinghistory #feedaesthetic #biteclub #counterculture #whatmatters #cookingtok #foodtok #reallegacy",
  no_trending_recipes: "we don't do trending recipes. we don't chase algorithms. we don't care what's viral this week. BiteClub helps you cook what you actually want to eat.\nyour Discovery feed shows real meals from real people — not what an algorithm decided you should see. link in bio.\n#notrendingrec ipes #antialgorithm #biteclub #counterculture #cookyourway #cookingtok #foodtok #realfood",
  nobody_cares_kitchen: "nobody at BiteClub cares what your kitchen looks like. small kitchen. messy kitchen. kitchen that's also your living room. doesn't matter. you cook in it. that's enough.\nyour Type of Cook badge, your Cuisines Cooked map, your cooking streak — none of them check your kitchen background. download BiteClub.\n#biteclub #yourkitchen #counterculture #realkitchens #cookingtok #foodtok #allkitchenswelcome #nocameraready",
  world_doesnt_need_another: "the world doesn't need another app to doom scroll food content in. it needs a tool that actually gets people cooking. so that's what we built.\nBiteClub: Cooking History, Flavor Palate, cookbooks, streaks, Cuisines Cooked map. all built to get you cooking, not scrolling. try BiteClub free.\n#biteclub #nodoomscroll #counterculture #cookingtool #cookingtok #foodtok #builtdifferent #actuallyuseful",
};

// ── Page component ───────────────────────────────────────────────────────────

export default function AntiFoodCulturePage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

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
          <span className="text-gray-700 font-medium">Anti-Food Culture</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{'\u270A'}</span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Anti-Food Culture</h1>
          </div>
          <p className="text-sm text-gray-500">
            Calling out performative cooking content. Against the aesthetic. For real food, real kitchens, real people.
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
            placeholder="Search anti-food culture presets..."
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
            No presets found for &ldquo;{search}&rdquo;
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
                    const isGenerating = generatingId === preset.id;
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
                              {isExpanded ? 'Hide' : 'Details'}
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

                        {isExpanded && (
                          <>
                            {caption && (
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

                            {!isGenerating ? (
                              <div className="border-t border-gray-100 px-4 py-3">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setGeneratingId(preset.id); }}
                                  className="w-full px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                                >
                                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                  </svg>
                                  Generate Carousel
                                </button>
                              </div>
                            ) : (
                              <StreamCarouselGenerator
                                preset={preset}
                                onClose={() => setGeneratingId(null)}
                              />
                            )}
                          </>
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
          <span>Anti-performative cooking content</span>
        </div>
      </main>
    </div>
  );
}
