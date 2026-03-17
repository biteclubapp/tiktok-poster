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
  { id: 'spring', label: 'Spring', emoji: '\u{1F33C}', color: 'text-green-600 bg-green-50' },
  { id: 'summer', label: 'Summer', emoji: '\u2600\uFE0F', color: 'text-yellow-600 bg-yellow-50' },
  { id: 'fall', label: 'Fall', emoji: '\u{1F342}', color: 'text-orange-600 bg-orange-50' },
  { id: 'winter', label: 'Winter', emoji: '\u2744\uFE0F', color: 'text-blue-600 bg-blue-50' },
  { id: 'trending', label: 'Trending Now', emoji: '\u{1F4C8}', color: 'text-pink-600 bg-pink-50' },
] as const;

const PRESETS: ContentPreset[] = [
  // ── Spring ──
  { id: 'spring_produce', label: 'Spring Produce Guide: What to Buy Right Now', emoji: '\u{1F33F}', desc: 'The freshest ingredients of the season and what to do with them', category: 'spring' },
  { id: 'easter_brunch', label: 'Easter Brunch That Actually Impresses', emoji: '\u{1F430}', desc: 'Beyond the chocolate eggs — real brunch dishes', category: 'spring' },
  { id: 'light_spring_meals', label: 'Light Meals for When It Finally Gets Warm', emoji: '\u{1F957}', desc: 'Goodbye heavy stews, hello fresh everything', category: 'spring' },
  { id: 'fresh_herbs', label: 'Fresh Herbs Are Back: Use Them in Everything', emoji: '\u{1F33F}', desc: 'Basil, cilantro, mint, dill — the spring herb guide', category: 'spring' },
  { id: 'spring_salads', label: 'Salads That Are Actually Meals', emoji: '\u{1F96C}', desc: 'Not sad desk salads — real filling spring salads', category: 'spring' },
  { id: 'asparagus_season', label: 'It\'s Asparagus Season and Nothing Else Matters', emoji: '\u{1F33F}', desc: '5 ways to cook asparagus that aren\'t boring', category: 'spring' },
  { id: 'spring_cleaning_kitchen', label: 'Spring Clean Your Kitchen (and Pantry)', emoji: '\u{1F9F9}', desc: 'Toss the expired stuff, organize the rest, cook better', category: 'spring' },
  { id: 'mothers_day_cook', label: 'Cook for Mom: Mother\'s Day Edition', emoji: '\u{1F490}', desc: 'Dishes that say "I love you" better than a card', category: 'spring' },

  // ── Summer ──
  { id: 'bbq_essentials', label: 'BBQ Season: The Only Guide You Need', emoji: '\u{1F525}', desc: 'Fire up the grill — marinades, timing, and sides', category: 'summer' },
  { id: 'no_cook_summer', label: 'No-Cook Meals for When It\'s Too Hot', emoji: '\u{1F975}', desc: 'Turning on the oven is not an option in August', category: 'summer' },
  { id: 'summer_fruits', label: 'Summer Fruits Are Unbeatable Right Now', emoji: '\u{1F353}', desc: 'Peaches, berries, watermelon — peak flavor season', category: 'summer' },
  { id: 'outdoor_cooking', label: 'Outdoor Cooking Beyond Burgers', emoji: '\u{1F3D5}\uFE0F', desc: 'Campfire meals, park picnics, beach snacks', category: 'summer' },
  { id: 'cold_soups', label: 'Cold Soups: Weird but Life-Changing', emoji: '\u{1F9CA}', desc: 'Gazpacho, cold cucumber, vichyssoise — trust the process', category: 'summer' },
  { id: 'ice_cream_homemade', label: 'Homemade Ice Cream Hits Different', emoji: '\u{1F366}', desc: 'No machine needed — 3-ingredient ice cream that works', category: 'summer' },
  { id: 'summer_drinks', label: 'Summer Drinks That Aren\'t Just Lemonade', emoji: '\u{1F379}', desc: 'Agua fresca, iced matcha, shrubs, and more', category: 'summer' },
  { id: 'fourth_july_spread', label: 'The Ultimate 4th of July Spread', emoji: '\u{1F1FA}\u{1F1F8}', desc: 'Red, white, and barbecue — the patriotic food guide', category: 'summer' },

  // ── Fall ──
  { id: 'comfort_food_szn', label: 'Comfort Food Season Has Officially Started', emoji: '\u{1F36D}', desc: 'Mac and cheese, pot pies, and everything warm', category: 'fall' },
  { id: 'thanksgiving_guide', label: 'Thanksgiving: The Complete Timeline', emoji: '\u{1F983}', desc: 'When to prep what — from 3 days out to serving', category: 'fall' },
  { id: 'pumpkin_everything', label: 'Pumpkin Everything (Beyond the Latte)', emoji: '\u{1F383}', desc: 'Pumpkin soup, pumpkin pasta, pumpkin bread — go all in', category: 'fall' },
  { id: 'soup_season', label: 'Soup Season Is Here and I\'m Not Leaving', emoji: '\u{1F35C}', desc: 'The best soups for every day of the week', category: 'fall' },
  { id: 'apple_picking', label: 'What to Actually Do With All Those Apples', emoji: '\u{1F34E}', desc: 'You picked 10 pounds of apples — now what?', category: 'fall' },
  { id: 'halloween_snacks', label: 'Halloween Snacks That Aren\'t Just Candy', emoji: '\u{1F383}', desc: 'Spooky food that kids and adults both love', category: 'fall' },
  { id: 'fall_baking', label: 'Fall Baking: Cinnamon Everything', emoji: '\u{1F36A}', desc: 'Apple pies, cinnamon rolls, spiced cookies — the essentials', category: 'fall' },

  // ── Winter ──
  { id: 'holiday_baking', label: 'Holiday Baking Marathon: Full Plan', emoji: '\u{1F384}', desc: 'Cookies, cakes, and gifts from the kitchen', category: 'winter' },
  { id: 'warm_drinks', label: 'Warm Drinks That Beat Any Coffee Shop', emoji: '\u2615', desc: 'Hot chocolate, chai, mulled wine, golden milk', category: 'winter' },
  { id: 'hearty_stews', label: 'Hearty Stews for the Coldest Days', emoji: '\u{1F372}', desc: 'One-pot meals that warm you from the inside out', category: 'winter' },
  { id: 'christmas_dinner', label: 'Christmas Dinner: The Full Menu', emoji: '\u{1F385}', desc: 'Starter, main, sides, dessert — the whole plan', category: 'winter' },
  { id: 'new_years_feast', label: 'New Year\'s Eve Feast', emoji: '\u{1F386}', desc: 'Ring in the new year with food that matches the energy', category: 'winter' },
  { id: 'batch_soups_winter', label: 'Batch Cook 5 Soups for the Week', emoji: '\u{1F963}', desc: 'Sunday afternoon, 5 soups, zero dinner stress all week', category: 'winter' },
  { id: 'slow_cooker_winter', label: 'Slow Cooker Season Is Peak Season', emoji: '\u{1F32C}\uFE0F', desc: 'Set it and forget it — come home to dinner', category: 'winter' },
  { id: 'valentines_dinner', label: 'Valentine\'s Dinner: Cook Instead of Reserve', emoji: '\u2764\uFE0F', desc: 'More romantic than any restaurant reservation', category: 'winter' },

  // ── Trending Now ──
  { id: 'viral_recipe', label: 'This Recipe Is Going Viral Right Now', emoji: '\u{1F4F1}', desc: 'The internet is obsessed — here\'s how to actually make it', category: 'trending' },
  { id: 'tiktok_trend', label: 'The TikTok Food Trend Everyone Is Trying', emoji: '\u{1F3B5}', desc: 'From For You page to your plate', category: 'trending' },
  { id: 'food_news', label: 'Food News This Week', emoji: '\u{1F4F0}', desc: 'What happened in the food world — condensed', category: 'trending' },
  { id: 'celebrity_recipe', label: 'We Tried the Celebrity Chef Recipe', emoji: '\u2B50', desc: 'Is it actually good or just famous?', category: 'trending' },
  { id: 'restaurant_copycat', label: 'Restaurant Copycats That Actually Work', emoji: '\u{1F354}', desc: 'Your favorite chain meals, made at home for 1/3 the price', category: 'trending' },
  { id: 'food_hack_viral', label: 'This Kitchen Hack Has 50M Views', emoji: '\u{1F4A5}', desc: 'Does it work? We tested it so you don\'t have to', category: 'trending' },
  { id: 'whats_everyone_eating', label: 'What Is Everyone Eating This Week?', emoji: '\u{1F37D}\uFE0F', desc: 'The most-cooked meals across social media right now', category: 'trending' },
  { id: 'comeback_food', label: 'This Forgotten Food Is Making a Comeback', emoji: '\u{1F504}', desc: 'Old-school dishes are trending again — here\'s why', category: 'trending' },
];

// ── TikTok captions ──────────────────────────────────────────────────────────

const TIKTOK_CAPTIONS: Record<string, string> = {
  // SPRING
  spring_produce: "spring produce is here and it's the cheapest, freshest food you'll find all year. here's what to buy.\ndiscover seasonal recipes on BiteClub's Discovery feed — people are cooking with these ingredients right now — link in bio.\n#springproduce #seasonal #freshfood #eatlocal #biteclub #homecooking #springtime",
  easter_brunch: "easter brunch that actually impresses. beyond the chocolate eggs. real food, real recipes.\nsave your best brunch recipes to a BiteClub cookbook — pull it up every year when Easter rolls around — download BiteClub.\n#easterbrunch #brunch #easter #springfood #biteclub #brunchideas #homecooking",
  light_spring_meals: "heavy stew season is over. these light spring meals are exactly what you need right now.\npost your spring meals on BiteClub — your Flavor Palate shifts with the seasons — try BiteClub free.\n#springmeals #lightmeals #fresheating #seasonal #biteclub #homecooking #eatfresh",
  fresh_herbs: "fresh herbs are back and they go in everything. basil, cilantro, mint, dill — the spring herb guide.\nfind herb-forward recipes on BiteClub's Discovery feed — spring cooking is just better with fresh herbs — link in bio.\n#freshherbs #herbs #springcooking #basil #biteclub #homecooking #cookingtips",
  spring_salads: "salads that are actually meals. not sad desk salads. real, filling, spring salads.\nlog your best spring salad on BiteClub with a photo — prove salads can be a whole meal — download BiteClub.\n#springsalad #saladmeal #healthyeating #freshfood #biteclub #homecooking #lunchideas",
  asparagus_season: "it's asparagus season and honestly nothing else matters right now. 5 ways to cook it that aren't boring.\nsave your asparagus recipes to a BiteClub cookbook — seasonal cookbooks are the move — try BiteClub free.\n#asparagus #seasonal #springproduce #vegetables #biteclub #homecooking #inseason",
  spring_cleaning_kitchen: "spring clean your kitchen. toss the expired stuff. organize the pantry. cook better because of it.\ntake stock of what you have and find recipes that use it on BiteClub's Discovery feed — link in bio.\n#springcleaning #kitchenorganization #pantry #cleanstart #biteclub #homecooking #organizedkitchen",
  mothers_day_cook: "cook for mom this Mother's Day. these dishes say 'I love you' better than any card ever could.\nsave the recipe you made for her on BiteClub — she'll want it again next year — download BiteClub.\n#mothersday #cookformom #mothersdayfood #familycooking #biteclub #homecooking #lovefood",

  // SUMMER
  bbq_essentials: "bbq season. fire up the grill. marinades, timing, sides — the only guide you need.\nsave your best grill recipes to a BBQ cookbook on BiteClub — that's your summer sorted — link in bio.\n#bbq #grillseason #summer #bbqtips #biteclub #homecooking #grilling",
  no_cook_summer: "it's too hot to cook. these no-cook meals are how you survive August without turning on the oven.\nlog your no-cook meals on BiteClub — they count for the cooking streak even without heat — try BiteClub free.\n#nocook #summerfood #toohot #nocooking #biteclub #homecooking #summermeals",
  summer_fruits: "summer fruits are peaking right now. peaches, berries, watermelon — eat them before they're gone.\npost your summer fruit creations on BiteClub — peak season content doesn't last forever — download BiteClub.\n#summerfruits #peaches #berries #seasonal #biteclub #homecooking #fruitseason",
  outdoor_cooking: "outdoor cooking beyond burgers. campfire meals, park picnics, beach snacks — level up.\nlog your outdoor cooking on BiteClub — park meals count — link in bio.\n#outdoorcooking #campfirecooking #picnic #summervibes #biteclub #homecooking #outside",
  cold_soups: "cold soup sounds weird. but gazpacho, cold cucumber soup, vichyssoise — trust the process. they're incredible.\nsave your cold soup recipes to BiteClub — the summer cookbook nobody knew they needed — try BiteClub free.\n#coldsoup #gazpacho #summerfood #weirdbutgood #biteclub #homecooking #chilled",
  ice_cream_homemade: "homemade ice cream with 3 ingredients, no machine. it hits different and you know it.\npost your homemade ice cream on BiteClub — flavor, photo, rating — your summer in a bowl — download BiteClub.\n#homemadeicecream #icecream #3ingredients #summer #biteclub #homecooking #dessert",
  summer_drinks: "summer drinks that aren't just lemonade. agua fresca, iced matcha, shrubs — real refreshment.\nlog your summer drink experiments on BiteClub — beverages count for the cooking streak — link in bio.\n#summerdrinks #aguafresca #icedmatcha #refreshing #biteclub #homecooking #drinkrecipes",
  fourth_july_spread: "the 4th of July spread. red, white, and barbecue. the full patriotic food guide.\npost your 4th spread on BiteClub — holiday cooking deserves to be remembered — try BiteClub free.\n#4thofjuly #bbq #patriotic #summerfood #biteclub #homecooking #america",

  // FALL
  comfort_food_szn: "comfort food season has officially started. mac and cheese, pot pies, and everything warm. we're in.\nsave your comfort food recipes to a BiteClub cookbook — that's your fall survival kit — link in bio.\n#comfortfood #fall #macaroni #potpie #biteclub #homecooking #cozyseason",
  thanksgiving_guide: "Thanksgiving timeline. when to prep what. from 3 days out to the moment you serve. the full plan.\nsave the Thanksgiving plan to BiteClub and stop panicking on Wednesday night — download BiteClub.\n#thanksgiving #thanksgivingprep #timeline #turkeyday #biteclub #homecooking #mealplan",
  pumpkin_everything: "pumpkin everything. pumpkin soup, pumpkin pasta, pumpkin bread — beyond the latte. go all in.\npost your pumpkin creations on BiteClub — fall is short, document every dish — try BiteClub free.\n#pumpkin #pumpkinseason #psl #fallcooking #biteclub #homecooking #pumpkineverything",
  soup_season: "soup season is here and I'm not leaving. the best soups for every day of the week.\nbuild a soup cookbook on BiteClub — 7 soups, 7 days, zero repeat fatigue — link in bio.\n#soupseason #soup #fallmeals #warmfood #biteclub #homecooking #souplovers",
  apple_picking: "you picked 10 pounds of apples. now what? apple pie, apple butter, apple crisp — the full guide.\nsave every apple recipe you try to a BiteClub cookbook — the fall apple archive — download BiteClub.\n#applepicking #applerecipes #fallbaking #seasonal #biteclub #homecooking #applepie",
  halloween_snacks: "halloween snacks that aren't just candy. spooky food that kids and adults both love.\npost your halloween creations on BiteClub — spooky food content is peak engagement — try BiteClub free.\n#halloween #halloweensnacks #spookyfood #halloweenfood #biteclub #homecooking #trickortreat",
  fall_baking: "fall baking: cinnamon everything. apple pies, cinnamon rolls, spiced cookies — the essential list.\nlog your fall baking on BiteClub — your Flavor Palate's Spice bar will climb all season — link in bio.\n#fallbaking #cinnamon #applepie #spicedcookies #biteclub #homecooking #bakingseason",

  // WINTER
  holiday_baking: "holiday baking marathon. cookies, cakes, and gifts from the kitchen. the full plan.\nsave your holiday baking recipes to a BiteClub cookbook — the one you open every December — download BiteClub.\n#holidaybaking #christmas #cookies #bakingmarathon #biteclub #homecooking #giftsfromkitchen",
  warm_drinks: "warm drinks that beat any coffee shop. hot chocolate, chai, mulled wine, golden milk — all homemade.\nlog your warm drink recipes on BiteClub — winter beverages deserve cookbook space — link in bio.\n#warmdrinks #hotchocolate #chai #mulledwine #biteclub #homecooking #winterdrinks",
  hearty_stews: "hearty stews for the coldest days. one-pot meals that warm you from the inside out.\nbuild a winter stew cookbook on BiteClub — one pot per week, all season long — try BiteClub free.\n#heartystew #winterfood #onepot #stew #biteclub #homecooking #coldweather",
  christmas_dinner: "Christmas dinner. starter, main, sides, dessert — the whole menu, planned and ready.\nsave your Christmas menu to BiteClub — next year you'll thank yourself — download BiteClub.\n#christmasdinner #christmas #holidaymenu #festive #biteclub #homecooking #christmasfood",
  new_years_feast: "New Year's Eve feast. ring in the new year with food that matches the energy.\npost your NYE spread on BiteClub — start the new year with a cooking streak already going — link in bio.\n#newyearseve #nyefood #newyearfeast #celebration #biteclub #homecooking #nye",
  batch_soups_winter: "batch cook 5 soups on Sunday. zero dinner stress all week. winter survival strategy.\nlog your Sunday soup prep on BiteClub — one session, five meals, the streak writes itself — try BiteClub free.\n#batchcook #soupprep #wintermeals #mealprep #biteclub #homecooking #sundayprep",
  slow_cooker_winter: "slow cooker season is peak season. set it in the morning, come home to dinner. every night.\nsave your best slow cooker recipes to a BiteClub cookbook — the winter autopilot collection — download BiteClub.\n#slowcooker #crockpot #winter #setandforget #biteclub #homecooking #easydinner",
  valentines_dinner: "cook Valentine's dinner instead of reserving. more romantic, more personal, way cheaper.\npost your Valentine's meal on BiteClub — date night cooking is the best kind — link in bio.\n#valentinesday #datenight #valentinesdinner #romanticcooking #biteclub #homecooking #cookathome",

  // TRENDING
  viral_recipe: "this recipe is going viral right now. the internet is obsessed. here's how to actually make it.\ntry the viral recipe and post your version on BiteClub — add your own rating — download BiteClub.\n#viralrecipe #trending #foodtrend #fyp #biteclub #homecooking #trendingfood",
  tiktok_trend: "the TikTok food trend everyone is trying this week. from the For You page to your plate.\npost your attempt on BiteClub — trend recipes deserve a permanent home — link in bio.\n#tiktokfood #foodtrend #trending #foryou #biteclub #homecooking #tiktokrecipe",
  food_news: "food news this week. what happened in the food world, condensed into the stuff that matters.\nstay connected to the food world on BiteClub's Discovery feed — see what real people are cooking right now — try BiteClub free.\n#foodnews #foodworld #thisweek #foodculture #biteclub #homecooking #foodmedia",
  celebrity_recipe: "we tried the celebrity chef recipe. is it actually good or just famous? honest review.\npost your celebrity recipe attempt on BiteClub with a real rating — no hype, just honesty — download BiteClub.\n#celebritychef #recipetest #honestReview #famous #biteclub #homecooking #foodreview",
  restaurant_copycat: "restaurant copycats that actually work. your favorite chain meals, made at home for 1/3 the price.\nsave your best copycat recipes to a BiteClub cookbook — the 'why order out' collection — link in bio.\n#copycat #restaurant #homemade #savemoney #biteclub #homecooking #copycatrecipe",
  food_hack_viral: "this kitchen hack has 50M views. does it actually work? we tested it so you don't have to.\npost your hack test on BiteClub — did it work? rate it honestly — try BiteClub free.\n#kitchenhack #viral #doesitwork #hacktested #biteclub #homecooking #lifehack",
  whats_everyone_eating: "what is everyone eating this week? the most-cooked meals across social media right now.\nbrowse BiteClub's Discovery feed to see what real home cooks are making — not just influencers — download BiteClub.\n#whatsfordinner #trending #mealideas #whattoeat #biteclub #homecooking #foodinspo",
  comeback_food: "this forgotten food is making a comeback. old-school dishes are trending again and here's why.\ntry the retro recipe and post it on BiteClub — some dishes deserve a second chance — link in bio.\n#comebackfood #retro #oldschool #foodtrend #biteclub #homecooking #throwback",
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
              placeholder="Search seasonal & trending ideas..."
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

export default function SeasonalStreamPage() {
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
          <span className="text-gray-700 font-medium">{'\u{1F342}'} Seasonal & Trending</span>
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
                  <div className="text-5xl mb-4">{'\u{1F342}'}</div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Pick a seasonal or trending idea to get started</p>
                  <p className="text-xs text-gray-400">
                    {PRESETS.length} presets across {CATEGORIES.length} categories — from spring produce to viral recipes
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
