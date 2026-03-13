'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { InfoContentType, InfoTemplateStyle } from '@/templates/info-render';
import CarouselPreview from '@/components/CarouselPreview';

// ── Content presets (grouped by category) ────────────────────────────────────
// All presets are fully pre-filled infographic posts — pick one, generate, done.

interface ContentPreset {
  id: string;
  label: string;
  emoji: string;
  desc: string;
  category: string;
  rendersAs: InfoContentType;
}

const CATEGORIES = [
  { id: 'social', label: 'Cooking Together', emoji: '\u{1F468}\u200D\u{1F373}', color: 'text-amber-600 bg-amber-50' },
  { id: 'money', label: 'Save Money', emoji: '\u{1F4B0}', color: 'text-green-600 bg-green-50' },
  { id: 'health', label: 'Health & Body', emoji: '\u{1F957}', color: 'text-emerald-600 bg-emerald-50' },
  { id: 'mind', label: 'Mind & Happiness', emoji: '\u{1F9E0}', color: 'text-pink-600 bg-pink-50' },
  { id: 'progress', label: 'Getting Better', emoji: '\u{1F4C8}', color: 'text-indigo-600 bg-indigo-50' },
  { id: 'data', label: 'Building in Public', emoji: '\u{1F680}', color: 'text-cyan-600 bg-cyan-50' },
  { id: 'debate', label: 'Food Debates', emoji: '\u2694\uFE0F', color: 'text-purple-600 bg-purple-50' },
  { id: 'knowledge', label: 'Food Knowledge', emoji: '\u{1F4A1}', color: 'text-orange-600 bg-orange-50' },
] as const;

const PRESETS: ContentPreset[] = [
  // ── Cooking Together — why it matters ──
  { id: 'potluck_benefits', label: 'Why Potlucks Make You Happier', emoji: '\u{1F37D}\uFE0F', desc: 'The science behind sharing food with friends', category: 'social', rendersAs: 'biteclub_stats' },
  { id: 'couple_cooking', label: 'Couples Who Cook Together Stay Together', emoji: '\u{1F491}', desc: 'Relationship science meets the kitchen', category: 'social', rendersAs: 'biteclub_stats' },
  { id: 'family_benefits', label: 'Why Cooking With Kids Changes Everything', emoji: '\u{1F46A}', desc: 'Vocabulary, nutrition, confidence — all from the kitchen', category: 'social', rendersAs: 'biteclub_stats' },
  { id: 'dinner_party_science', label: 'The Science of Dinner Parties', emoji: '\u{1F37E}', desc: 'Oxytocin, laughter, and why hosting matters', category: 'social', rendersAs: 'biteclub_stats' },
  { id: 'loneliness_food', label: 'Shared Meals Beat Loneliness', emoji: '\u{1F91D}', desc: 'The #1 predictor of social wellbeing is eating together', category: 'social', rendersAs: 'biteclub_stats' },
  { id: 'cultural_bonding', label: 'Food Builds Empathy Across Cultures', emoji: '\u{1F30D}', desc: 'How cooking someone\'s food builds understanding', category: 'social', rendersAs: 'biteclub_stats' },

  // ── Save Money ──
  { id: 'cost_comparison', label: 'Homemade vs Takeout: The Real Numbers', emoji: '\u{1F4B8}', desc: 'Side-by-side cost per meal, monthly, annually', category: 'money', rendersAs: 'biteclub_stats' },
  { id: 'yearly_savings', label: 'The Annual Cooking Math', emoji: '\u{1F4B5}', desc: 'Full annual math with 10-year projection', category: 'money', rendersAs: 'biteclub_stats' },
  { id: 'meal_prep_roi', label: 'Meal Prep ROI: Time & Money Saved', emoji: '\u{1F4E6}', desc: 'Batch cooking is the cheat code for eating well on a budget', category: 'money', rendersAs: 'biteclub_stats' },
  { id: 'food_waste', label: 'Food Waste Is Costing You $1,500/Year', emoji: '\u{1F5D1}\uFE0F', desc: 'How meal planning slashes waste by 70%', category: 'money', rendersAs: 'biteclub_stats' },
  { id: 'coffee_comparison', label: 'Your Latte Habit vs Cooking', emoji: '\u2615', desc: 'Daily latte + lunch vs cooking, compounded over years', category: 'money', rendersAs: 'biteclub_stats' },
  { id: 'grocery_hacks', label: 'Planned vs Impulse Shopping', emoji: '\u{1F6D2}', desc: 'A grocery list saves you 23% per trip', category: 'money', rendersAs: 'biteclub_stats' },

  // ── Health & Body ──
  { id: 'calorie_truth', label: 'The Calorie Truth About Eating Out', emoji: '\u{1F525}', desc: 'Restaurant meals average 1,200 calories — home meals 550', category: 'health', rendersAs: 'biteclub_stats' },
  { id: 'portion_truth', label: 'Restaurant Portions Are 2.5x Too Big', emoji: '\u{1F37D}\uFE0F', desc: 'You control the plate when you cook at home', category: 'health', rendersAs: 'biteclub_stats' },
  { id: 'sodium_truth', label: 'The Hidden Sodium in Takeout', emoji: '\u{1F9C2}', desc: 'One restaurant meal = your entire daily sodium limit', category: 'health', rendersAs: 'biteclub_stats' },
  { id: 'hidden_ingredients', label: 'Know What You\'re Actually Eating', emoji: '\u{1F50D}', desc: 'The average packaged food has 15+ unpronounceable ingredients', category: 'health', rendersAs: 'biteclub_stats' },
  { id: 'gut_health', label: 'Home Cooking = Better Gut Health', emoji: '\u{1F9EC}', desc: 'Variety is key — home cooks eat 40% more diverse foods', category: 'health', rendersAs: 'biteclub_stats' },
  { id: 'weight_management', label: 'The Weight Management Cheat Code', emoji: '\u2696\uFE0F', desc: 'Cooking at home 5x/week = 2.5 kg lighter on average', category: 'health', rendersAs: 'biteclub_stats' },
  { id: 'immune_boost', label: 'Cook Your Way to a Stronger Immune System', emoji: '\u{1F6E1}\uFE0F', desc: 'Whole foods, fresh herbs, and real nutrition', category: 'health', rendersAs: 'biteclub_stats' },

  // ── Mind & Happiness ──
  { id: 'happiness_stats', label: 'Cooking Makes People Happier', emoji: '\u{1F60A}', desc: 'People who cook 5+ times/week report 47% higher life satisfaction', category: 'mind', rendersAs: 'biteclub_stats' },
  { id: 'stress_relief', label: 'Cooking Reduces Stress by 25%', emoji: '\u{1F9D8}', desc: 'Chopping onions is cheaper than therapy', category: 'mind', rendersAs: 'biteclub_stats' },
  { id: 'creativity_brain', label: 'Cooking Rewires Your Brain for Creativity', emoji: '\u{1F3A8}', desc: 'Novel flavour combinations activate the same circuits as art', category: 'mind', rendersAs: 'biteclub_stats' },
  { id: 'screen_detox', label: 'Cooking = The Best Screen Detox', emoji: '\u{1F4F5}', desc: '45 minutes of phone-free presence, every single day', category: 'mind', rendersAs: 'biteclub_stats' },
  { id: 'confidence_data', label: 'Cooking Builds Real Confidence', emoji: '\u{1F4AA}', desc: 'Every dish you nail is proof you can learn anything', category: 'mind', rendersAs: 'biteclub_stats' },
  { id: 'sleep_quality', label: 'Home Cooking Improves Sleep Quality', emoji: '\u{1F634}', desc: 'Lighter dinners, less sodium, better rest', category: 'mind', rendersAs: 'biteclub_stats' },
  { id: 'therapy_cooking', label: 'Therapeutic Cooking Is Real Science', emoji: '\u{1FA7A}', desc: 'Occupational therapists prescribe cooking for anxiety and depression', category: 'mind', rendersAs: 'biteclub_stats' },
  { id: 'flow_state', label: 'Cooking Puts You in Flow State', emoji: '\u{1F300}', desc: 'The same brain state as meditation, music, and sports', category: 'mind', rendersAs: 'biteclub_stats' },

  // ── Getting Better ──
  { id: 'seven_day_challenge', label: '7 Days of Cooking Changes Everything', emoji: '\u{1F4C5}', desc: 'What happens when you cook every day for a week', category: 'progress', rendersAs: 'biteclub_stats' },
  { id: 'skill_progression', label: 'The Cooking Skill Tree', emoji: '\u{1F333}', desc: 'From boiling water to hosting dinner parties', category: 'progress', rendersAs: 'biteclub_stats' },
  { id: 'speed_gains', label: 'You\'re Getting Faster Than You Think', emoji: '\u23F1\uFE0F', desc: 'Practice makes dinner — measurable speed improvements', category: 'progress', rendersAs: 'biteclub_stats' },
  { id: 'ten_recipes', label: '10 Recipes = Never Bored, Never Ordering In', emoji: '\u{1F4DA}', desc: 'Build your personal top 10 and eat well forever', category: 'progress', rendersAs: 'biteclub_stats' },
  { id: 'compound_effect', label: 'The Compound Effect of Cooking Daily', emoji: '\u{1F4C8}', desc: 'Small daily practice, massive yearly transformation', category: 'progress', rendersAs: 'biteclub_stats' },

  // ── Building in Public — startup journey, real numbers, TikTok growth ──
  { id: 'day_one', label: 'Day 1: Posting on TikTok to Grow Our App', emoji: '\u{1F680}', desc: 'The origin story — starting from zero', category: 'data', rendersAs: 'biteclub_stats' },
  { id: 'week_one_update', label: 'Week 1 Update: Here\'s What Happened', emoji: '\u{1F4C6}', desc: 'First week results — full transparency', category: 'data', rendersAs: 'biteclub_stats' },
  { id: 'growth_numbers', label: 'Our Real Numbers (No Cap)', emoji: '\u{1F4CA}', desc: 'Honest startup metrics — nothing hidden', category: 'data', rendersAs: 'biteclub_stats' },
  { id: 'tiktok_experiment', label: 'Can TikTok Grow a Cooking App?', emoji: '\u{1F9EA}', desc: 'The experiment — hypothesis, strategy, tracking', category: 'data', rendersAs: 'biteclub_stats' },
  { id: 'milestone_hit', label: 'We Just Hit a Milestone', emoji: '\u{1F3C6}', desc: 'Celebrating growth milestones from zero', category: 'data', rendersAs: 'biteclub_stats' },
  { id: 'content_strategy', label: 'Our Exact TikTok Content Strategy', emoji: '\u{1F3AF}', desc: 'Sharing the full playbook — automated content', category: 'data', rendersAs: 'biteclub_stats' },
  { id: 'where_chefs_cook', label: 'Where Our Chefs Are Cooking', emoji: '\u{1F4CD}', desc: 'A live map of BiteClub\'s global kitchen', category: 'data', rendersAs: 'biteclub_stats' },
  { id: 'top_cuisines', label: 'Top Cuisines on BiteClub Right Now', emoji: '\u{1F30D}', desc: 'What the community is cooking this week', category: 'data', rendersAs: 'biteclub_stats' },
  { id: 'global_kitchen', label: 'BiteClub\'s Global Kitchen', emoji: '\u{1F373}', desc: 'From Malm\u00F6 to Mumbai \u2014 real cooks, real food', category: 'data', rendersAs: 'biteclub_stats' },

  // ── Food Debates ──
  { id: 'this_or_that_food', label: 'This or That: Food Edition', emoji: '\u{1F914}', desc: 'Tacos vs Burritos, Pizza vs Pasta — pick your side', category: 'debate', rendersAs: 'this_or_that' },
  { id: 'unpopular_opinions', label: 'Unpopular Food Opinions', emoji: '\u{1F336}\uFE0F', desc: 'Hot takes that start comment wars', category: 'debate', rendersAs: 'this_or_that' },
  { id: 'homemade_vs_store', label: 'Homemade vs Store-Bought', emoji: '\u{1F3EA}', desc: 'Which foods are actually worth making from scratch?', category: 'debate', rendersAs: 'this_or_that' },
  { id: 'cuisine_battle', label: 'Cuisine Battle Royale', emoji: '\u{1F30D}', desc: 'Italian vs Mexican, Thai vs Japanese — food wars', category: 'debate', rendersAs: 'this_or_that' },

  // ── Food Knowledge ──
  { id: 'ingredient_science', label: 'Why Salt Makes Everything Better', emoji: '\u{1F9C2}', desc: 'The actual science of how salt enhances flavor', category: 'knowledge', rendersAs: 'biteclub_stats' },
  { id: 'seasonal_eating', label: 'Seasonal Eating is 3x Cheaper and Tastier', emoji: '\u{1F342}', desc: 'Why in-season produce wins on every metric', category: 'knowledge', rendersAs: 'biteclub_stats' },
  { id: 'pantry_power', label: '10 Pantry Staples = Infinite Meals', emoji: '\u{1FAD9}', desc: 'Stock these and you can always make dinner', category: 'knowledge', rendersAs: 'biteclub_stats' },
  { id: 'cooking_myths', label: '5 Cooking Myths That Are Actually Wrong', emoji: '\u{1F6AB}', desc: 'Searing doesn\'t lock in juices — and other lies', category: 'knowledge', rendersAs: 'biteclub_stats' },
  { id: 'fermentation', label: 'Why Fermented Foods Are a Superpower', emoji: '\u{1FAD9}', desc: 'Kimchi, yogurt, sourdough — what they do to your body', category: 'knowledge', rendersAs: 'biteclub_stats' },
  { id: 'protein_guide', label: 'The Home Cook\'s Protein Guide', emoji: '\u{1F969}', desc: 'How much protein is in everyday ingredients', category: 'knowledge', rendersAs: 'biteclub_stats' },
];

// ── Prefills: every preset gets a fully-loaded data object ──────────────────

type StatsPrefill = { title: string; callout: string; stats: { label: string; value: string; unit: string; nudge?: string }[]; cta?: string; ctaSub?: string; visual?: 'map' | 'bars' | 'ring'; barData?: { label: string; value: number; display?: string }[]; barTitle?: string };
type ThisOrThatPrefill = { theme: string; rounds: { optionA: string; optionB: string }[]; cta?: string; ctaSub?: string };

function getPrefill(presetId: string): { stats?: StatsPrefill; thisOrThat?: ThisOrThatPrefill } {
  const prefills: Record<string, { stats?: StatsPrefill; thisOrThat?: ThisOrThatPrefill }> = {

    // ── Cooking Together ──────────────────────────────────────────────────────

    potluck_benefits: { stats: {
      title: 'Why Potlucks Make You Happier',
      callout: 'People who share meals weekly are 34% more likely to have close friendships — Oxford Dunbar Study',
      cta: 'Save a "Potluck Ideas" cookbook on BiteClub before the next group chat',
      ctaSub: 'Pin your best potluck dish to your profile — friends can find the recipe and cook it themselves',
      stats: [
        { label: 'More close friendships', value: '34%', unit: 'potluck hosts vs non-hosts', nudge: 'Scroll the BiteClub Discovery feed before your next potluck — what other people are cooking is the fastest menu inspo you\'ll find' },
        { label: 'Oxytocin release vs eating alone', value: '2x', unit: 'higher', nudge: 'Post what you brought to the potluck on BiteClub — photo, recipe link, star rating — so the group chat can find it and cook it next time' },
        { label: 'Average guest savings vs eating out', value: '$25', unit: 'per person', nudge: 'Every potluck dish you cook adds to your BiteClub cooking streak — keep it alive every time you host' },
        { label: 'Conversations at shared meals vs solo', value: '3x', unit: 'more', nudge: 'Your BiteClub Flavor Palate builds every time you cook something new — potlucks are the fastest way to unlock new taste profiles' },
        { label: 'People who feel "belonging" after potlucks', value: '78%', unit: '', nudge: 'Create a "Potluck Ideas" cookbook on BiteClub — pull it up every time the group chat starts planning instead of panicking' },
        { label: 'Chance of making a new friend at a potluck', value: '62%', unit: '', nudge: 'Every potluck dish from a new cuisine adds another pin to your BiteClub Cuisines Cooked map — cook something from a new country this weekend' },
        { label: 'Average potluck group size', value: '8', unit: 'people', nudge: 'Pin your best potluck dish to your BiteClub profile — people who follow you can find the recipe without having to ask' },
        { label: 'Would host again within a month', value: '91%', unit: 'of first-time hosts', nudge: 'Import the recipe from anywhere to BiteClub before you forget it — your cooking history tracks every potluck dish you\'ve made' },
      ],
    }},

    couple_cooking: { stats: {
      title: 'Couples Who Cook Together Stay Together',
      callout: 'Couples who cook together 3x/week are 60% more likely to rate their relationship as "very happy"',
      cta: 'Follow each other on BiteClub and cook from the same feed tonight',
      ctaSub: 'Create a shared "Date Night" cookbook — every recipe you\'ve nailed together, in one place',
      stats: [
        { label: 'Rate relationship "very happy"', value: '60%', unit: 'more likely', nudge: 'Open BiteClub\'s Discovery feed together and let them pick tonight\'s recipe — that scroll is already a better date than most' },
        { label: 'Quality time per cooking session', value: '45', unit: 'min avg', nudge: 'Post the meal on BiteClub when you\'re done — photo, rating, caption — it goes straight into both your cooking histories' },
        { label: 'Feel more connected after cooking together', value: '82%', unit: '', nudge: 'Cook together 3x this week and watch your BiteClub streak climb — the weekly calendar makes the habit visible for both of you' },
        { label: 'Couples who cook together argue less about food', value: '3x', unit: '', nudge: 'Follow each other on BiteClub — your partner\'s Flavor Palate bars tell you exactly what they\'re into without anyone having to ask' },
        { label: 'Shared task completion boosts bond', value: '37%', unit: 'stronger', nudge: 'Create a "Date Night" cookbook on BiteClub and save the recipes you\'ve made together — that\'s a collection no one else has' },
        { label: 'Report better communication', value: '71%', unit: 'of couples', nudge: 'Try cooking each other\'s heritage cuisine — it adds a new country to your BiteClub Cuisines Cooked map and starts a real conversation' },
        { label: 'Average money saved vs date-night dining', value: '$40', unit: 'per evening', nudge: 'Pin your best couple\'s meal to your BiteClub profile — your "Type of Cook" identity gets built from moments exactly like this' },
        { label: 'Would rather cook together than eat out', value: '58%', unit: 'of surveyed couples', nudge: 'Import the recipes you\'ve perfected together to BiteClub from anywhere — that\'s your personal cookbook that lives forever' },
      ],
    }},

    family_benefits: { stats: {
      title: 'Why Cooking With Kids Changes Everything',
      callout: 'Kids who cook with parents are 42% more likely to eat vegetables — Journal of Nutrition Education',
      cta: 'Post tonight\'s family meal on BiteClub and keep the streak going',
      ctaSub: 'Save your family recipes to a "Family Classics" cookbook — their cooking history starts with yours',
      stats: [
        { label: 'More likely to eat vegetables', value: '42%', unit: '', nudge: 'Browse BiteClub\'s Discovery feed with your kids and let them pick — when they chose it, they\'ll actually eat it' },
        { label: 'Vocabulary boost per year', value: '1,000+', unit: 'words', nudge: 'Post the meal on BiteClub tonight — photo, what you made, who helped — that\'s the cooking history your kids look back on' },
        { label: 'Math skills from measuring/counting', value: '28%', unit: 'improvement', nudge: 'Keep your family cooking streak alive on BiteClub — the weekly calendar shows the kids their own consistency' },
        { label: 'Children develop healthier BMI', value: '35%', unit: 'more likely', nudge: 'Every new ingredient your kids cook with tweaks the Flavor Palate on their BiteClub profile — that\'s their taste story building' },
        { label: 'Kids who cook try new foods', value: '2.5x', unit: 'more often', nudge: 'Create a "Family Classics" cookbook on BiteClub — the recipes you make together, saved in one place they can use forever' },
        { label: 'Fine motor skill development', value: '40%', unit: 'faster', nudge: 'Cook from a new country\'s cuisine each week — every one adds a new pin to your BiteClub Cuisines Cooked map' },
        { label: 'Family bonding quality rating', value: '9.2/10', unit: 'avg', nudge: 'Pin your best family recipe to your BiteClub profile — that\'s the dish that defines your cooking identity to everyone who follows you' },
        { label: 'Kids who cook become adult home cooks', value: '87%', unit: '', nudge: 'Import the recipes from your own childhood to BiteClub — your cooking history is the bridge between generations' },
      ],
    }},

    dinner_party_science: { stats: {
      title: 'The Science of Dinner Parties',
      callout: 'Hosting dinner increases oxytocin levels by 2x and laughter frequency by 3x vs eating alone',
      cta: 'Build a "Dinner Party" cookbook on BiteClub before your next invite goes out',
      ctaSub: 'Post the full menu after — your guests can find every recipe and cook them at home',
      stats: [
        { label: 'Oxytocin increase from hosting', value: '2x', unit: 'vs eating alone', nudge: 'Find your next dinner party menu in BiteClub\'s Discovery feed — what people are actually cooking at home beats any restaurant idea' },
        { label: 'Laughter frequency', value: '3x', unit: 'more at shared meals', nudge: 'Post every dish you served on BiteClub — your guests can tap the recipe and cook it themselves before the week is out' },
        { label: 'Average conversation depth', value: '4x', unit: 'deeper than casual chat', nudge: 'Hosting counts as a cooking session — post it on BiteClub tonight and keep your weekly streak alive' },
        { label: 'Guests feel "socially fulfilled"', value: '89%', unit: '', nudge: 'Your BiteClub Flavor Palate explains your menu better than any description — share your profile with guests so they know what to expect' },
        { label: 'New social connections per dinner party', value: '2.3', unit: 'avg', nudge: 'Build a "Dinner Party" cookbook on BiteClub — the menu is planned before the invites go out' },
        { label: 'Endorphin release comparable to', value: '30min', unit: 'of exercise', nudge: 'Cook one new country\'s cuisine per dinner party — each one adds another pin to your BiteClub Cuisines Cooked map' },
        { label: 'Hosts report boosted mood for', value: '48', unit: 'hours after', nudge: 'Pin the dish that got the most compliments to your BiteClub profile — your "Type of Cook" badge updates as you do' },
        { label: 'People who host monthly are happier', value: '52%', unit: 'than non-hosts', nudge: 'Import the recipes that worked into BiteClub after the party — your cooking history is the reference for next time' },
      ],
    }},

    loneliness_food: { stats: {
      title: 'Shared Meals Beat Loneliness',
      callout: 'The #1 predictor of social wellbeing is the number of meals you eat with others per week',
      cta: 'Follow your friends on BiteClub and see what they\'ve been cooking',
      ctaSub: 'Someone in your network is already cooking — show up with the same dish and the invite writes itself',
      stats: [
        { label: '#1 predictor of social wellbeing', value: 'Shared meals', unit: 'per week', nudge: 'Open BiteClub\'s Discovery feed and follow someone whose cooking makes you want to eat — that\'s an invitation in the making' },
        { label: 'People eating alone daily feel lonely', value: '67%', unit: '', nudge: 'Post what you made tonight on BiteClub — someone in your feed sees it, comments, and suddenly dinner is a conversation' },
        { label: 'Loneliness reduction from 3 shared meals/wk', value: '39%', unit: '', nudge: 'Cook 3 meals with other people this week and your BiteClub streak reflects every one — 39% less lonely starts tonight' },
        { label: 'Mental health improvement', value: '28%', unit: 'lower depression risk', nudge: 'Each meal you post builds your BiteClub Flavor Palate — and quietly tells the story of who you cook for and with' },
        { label: 'Social support network size increase', value: '2x', unit: 'for regular sharers', nudge: 'Save a recipe from someone you want to cook with on BiteClub — "I made your recipe" is the best cold open there is' },
        { label: 'Life expectancy boost from social eating', value: '5+', unit: 'years', nudge: 'Cook from a new cultural background and it adds to your BiteClub Cuisines Cooked map — that\'s connection with a literal pin on the world' },
        { label: 'Sense of community belonging', value: '73%', unit: 'higher', nudge: 'Your BiteClub profile shows your "Type of Cook" badge and pinned dishes — that\'s a real cooking identity, not just an app page' },
        { label: 'Would accept a dinner invite today', value: '94%', unit: 'of people surveyed', nudge: '94% say yes to dinner — import a crowd-pleasing recipe to BiteClub and send it to someone before you even pick a date' },
      ],
    }},

    cultural_bonding: { stats: {
      title: 'Food Builds Empathy Across Cultures',
      callout: 'People who cook food from another culture report 45% more empathy for that culture',
      cta: 'Share a dish from your culture on BiteClub — post the recipe, tell the story',
      ctaSub: 'Every cuisine you cook adds a country to your Cuisines Cooked map — that\'s your heritage, visible',
      stats: [
        { label: 'Empathy increase from cooking another culture\'s food', value: '45%', unit: '', nudge: 'Browse BiteClub\'s Discovery feed and follow someone whose food you\'ve never cooked — that\'s what 45% more empathy looks like in practice' },
        { label: 'Cultural understanding after shared meal', value: '3x', unit: 'higher', nudge: 'Post what you made on BiteClub and link the recipe — someone will cook it and then ask you about it' },
        { label: 'Interest in learning about another culture', value: '67%', unit: 'boost', nudge: 'Cook one new country\'s recipe per week — your BiteClub streak and your Cuisines Cooked map grow at exactly the same rate' },
        { label: 'Cross-cultural friendships formed over food', value: '2.8x', unit: 'more likely', nudge: 'The more cuisines you cook, the richer your BiteClub Flavor Palate gets — Spice and Umami bars both shift as you explore' },
        { label: 'Reduction in stereotyping', value: '31%', unit: '', nudge: 'Save recipes from cuisines you\'re curious about into a dedicated BiteClub cookbook — that\'s a cultural education you can actually eat' },
        { label: 'People who tried a new cuisine this month', value: '52%', unit: '', nudge: 'Your BiteClub Cuisines Cooked map shows every country you\'ve cooked from — empty pins are just the to-do list' },
        { label: 'Food is the #1 gateway to cultural exchange', value: '#1', unit: 'ranked', nudge: 'Upload a recipe from your own culture to BiteClub — your profile is your heritage, and your followers can cook their way into understanding it' },
        { label: '"I understand their culture better now"', value: '78%', unit: 'agree', nudge: 'Comment on someone\'s BiteClub recipe from a culture different from yours — "I made this" starts the best conversations' },
      ],
    }},

    // ── Save Money ────────────────────────────────────────────────────────────

    cost_comparison: { stats: {
      title: 'Homemade vs Takeout: The Real Numbers',
      callout: 'The average American spends $3,000+/yr more on food than they need to',
      cta: 'Save the home version of your usual order to a BiteClub cookbook',
      ctaSub: 'Every recipe in your cookbook is $14 you don\'t hand to a delivery app — build the library once',
      stats: [
        { label: 'Average takeout dinner', value: '$18.50', unit: 'per meal', nudge: 'Browse BiteClub\'s Discovery feed and find the home version of whatever you were about to order — someone\'s already made it and posted the recipe' },
        { label: 'Same meal cooked at home', value: '$4.50', unit: 'per meal', nudge: 'Post your $4.50 home meal on BiteClub with a photo and star rating — your cooking history proves the habit is real' },
        { label: 'Savings per meal', value: '$14', unit: '', nudge: 'Every time you cook instead of ordering, your BiteClub streak gets a tick — $14 saved and the streak stays alive' },
        { label: 'Monthly savings (cooking 5x/week)', value: '$280', unit: '', nudge: 'Your BiteClub Flavor Palate updates every time you cook — cook more variety at home and watch new taste bars unlock' },
        { label: 'Annual savings', value: '$3,360', unit: '', nudge: 'Create a "Weeknight Dinners" cookbook on BiteClub — save the 7 recipes you rotate and you\'ll never open Uber Eats out of boredom again' },
        { label: 'Delivery fees + tips you skip', value: '$8', unit: 'avg per order', nudge: 'Every country\'s cuisine you cook at home adds to your BiteClub Cuisines Cooked map — and costs $8 less than the delivery version' },
        { label: 'Cost per serving: homemade pasta', value: '$1.20', unit: '', nudge: 'Pin your best budget meal to your BiteClub profile — $1.20 per serving is a flex worth showing off' },
        { label: 'Cost per serving: takeout pasta', value: '$16', unit: '', nudge: 'Import your cheapest go-to recipe to BiteClub from anywhere — that\'s the one you\'ll actually open next time you nearly ordered out' },
      ],
    }},

    yearly_savings: { stats: {
      title: 'The Annual Cooking Math',
      callout: 'That\'s a vacation, a new laptop, or 3 months of rent saved every year',
      cta: 'Build your recipe bank on BiteClub — the bigger it gets, the harder the habit is to break',
      ctaSub: 'Follow people who cook the $2,200/year version — their feed is the cheapest meal plan you\'ll find',
      stats: [
        { label: 'Annual cost eating out daily', value: '$7,300', unit: '/year', nudge: 'Follow home cooks in BiteClub\'s Discovery feed — people cooking the $2,200/year version post exactly what that looks like' },
        { label: 'Annual cost cooking at home', value: '$2,200', unit: '/year', nudge: 'Post your home meals on BiteClub — every one that goes on your cooking history is a receipt that the habit is actually sticking' },
        { label: 'You save per year', value: '$5,100', unit: '', nudge: 'Cook every day this week and your BiteClub streak does the accounting — every streak day is $14 you kept' },
        { label: 'Over 5 years', value: '$25,500', unit: '', nudge: 'Your BiteClub Flavor Palate builds as you cook more at home — the variety you develop there makes eating out less interesting anyway' },
        { label: 'Over 10 years', value: '$51,000', unit: '', nudge: 'Create a "Budget Meals" cookbook on BiteClub and add recipes as you find them — that cookbook is the infrastructure that makes $51k happen' },
        { label: 'Over 10 years invested at 7%', value: '$72,000+', unit: '', nudge: 'Cook dishes from different countries at home to grow your BiteClub Cuisines Cooked map — cheaper than flights and tastier than takeout' },
        { label: 'That\'s enough for', value: 'Down payment', unit: 'on a home', nudge: 'Pin your best budget meal to your BiteClub profile — that recipe is the one your followers need most' },
        { label: 'Break-even on learning to cook', value: '2', unit: 'weeks', nudge: 'Import your first recipe to BiteClub from anywhere right now — two weeks to break even, and you need the recipe anyway' },
      ],
    }},

    meal_prep_roi: { stats: {
      title: 'Meal Prep ROI: Time & Money Saved',
      callout: 'Batch cooking 1x/week saves 8 hours and $120 compared to daily takeout',
      cta: 'Post your Sunday prep on BiteClub — your followers can save the batch recipe and copy your system',
      ctaSub: 'Create a "Meal Prep" cookbook and pull it up every Sunday — $510/month starts with one saved recipe',
      stats: [
        { label: 'Cost per meal (no prep)', value: '$12', unit: '', nudge: 'Open BiteClub\'s Discovery feed and find someone who batch-cooks — their posts show the exact system behind $3.50 meals' },
        { label: 'Cost per meal (batch cook)', value: '$3.50', unit: '', nudge: 'Post your Sunday prep session on BiteClub with the recipe — your followers can save it and run the same $3.50/meal system' },
        { label: 'Savings per month', value: '$510', unit: '', nudge: 'Prep counts as cooking — tick the BiteClub streak every Sunday and your weekly calendar fills up without you doing anything extra on weeknights' },
        { label: 'Prep time per week', value: '2.5', unit: 'hours', nudge: 'Every batch-cook session you post adds to your cooking history on BiteClub — 2.5 hours on Sunday shows up as 5 days of meals in your profile' },
        { label: 'Daily cooking time saved', value: '40', unit: 'min/day', nudge: 'Create a "Meal Prep" cookbook on BiteClub — save the batch recipes that work and pull the same cookbook up every Sunday' },
        { label: 'Weekly time saved total', value: '3.5', unit: 'hours', nudge: 'Cook a different cuisine each prep session and your BiteClub Cuisines Cooked map grows while your grocery bill shrinks' },
        { label: 'Food waste reduction', value: '65%', unit: 'less', nudge: 'Pin your best batch recipe to your BiteClub profile — the one you make every Sunday is exactly the dish worth pinning' },
        { label: 'Meals prepped in one session', value: '10-12', unit: 'portions', nudge: 'Import your batch recipes to BiteClub from anywhere — when they\'re all in one place, Sunday prep takes planning instead of searching' },
      ],
    }},

    food_waste: { stats: {
      title: 'Food Waste Is Costing You $1,500/Year',
      callout: 'The average household throws away 30-40% of the food they buy',
      cta: 'Build your BiteClub recipe list before you shop, not after — then buy only what\'s in it',
      ctaSub: 'Save 5 recipes to a "This Week" cookbook and your grocery list writes itself',
      stats: [
        { label: 'Food wasted per household/year', value: '$1,500', unit: '', nudge: 'Browse BiteClub\'s Discovery feed for something that uses the vegetables already dying in your fridge — search by ingredient, find a recipe, go shopping with a plan' },
        { label: 'Food thrown away (no meal plan)', value: '40%', unit: '', nudge: 'Post your zero-waste use-it-up meals on BiteClub — the best no-waste recipes come from people who actually cooked through a full fridge' },
        { label: 'Food thrown away (with meal plan)', value: '10%', unit: '', nudge: 'Save 5 recipes to BiteClub before your weekly shop and your streak gets fed too — plan and habit in one move' },
        { label: 'Waste reduction from planning', value: '75%', unit: '', nudge: 'Your BiteClub Flavor Palate builds faster when you cook with variety — planning different cuisines each week beats throwing the same produce away' },
        { label: 'Most wasted foods', value: 'Produce', unit: 'fruits & veggies', nudge: 'Create a "This Week" cookbook on BiteClub — save the week\'s 5 recipes in it, then shop from the ingredient lists. Done.' },
        { label: 'Avg groceries that go bad untouched', value: '1 in 4', unit: 'items', nudge: 'Each cuisine you cook through your BiteClub cookbook adds a country to your Cuisines Cooked map — waste less, explore more' },
        { label: 'CO2 from food waste globally', value: '8%', unit: 'of emissions', nudge: 'Pin your best zero-waste recipe to your BiteClub profile — the fridge-clear dish is exactly the one your followers need to see' },
        { label: 'Freezing extends food life by', value: '3-6', unit: 'months', nudge: 'Import freeze-friendly recipes to BiteClub from anywhere — cook once, eat four times, waste nothing, and your cooking history shows all of it' },
      ],
    }},

    coffee_comparison: { stats: {
      title: 'Your Latte Habit vs Cooking at Home',
      callout: 'A daily $6 latte + $15 lunch = $7,665/year. Homemade? $2,190.',
      cta: 'Find your packed lunch recipe in BiteClub\'s Discovery feed and save it to a "Work Lunches" cookbook',
      ctaSub: 'One saved recipe is $15 back tomorrow — do that five days a week and the math gets interesting',
      stats: [
        { label: 'Daily latte', value: '$6', unit: '', nudge: 'Open BiteClub\'s Discovery feed and search for quick breakfast recipes — someone has already cracked a version that costs less than the tip on a coffee' },
        { label: 'Daily bought lunch', value: '$15', unit: '', nudge: 'Post your packed lunch on BiteClub — photo, what\'s in it, how long it took — your cooking history makes the habit feel real' },
        { label: 'Annual cost (latte + lunch)', value: '$7,665', unit: '', nudge: 'Pack lunch every weekday this month and your BiteClub streak stays green — that\'s the visual feedback that makes the $7,665 gap feel personal' },
        { label: 'Homemade coffee + packed lunch', value: '$6/day', unit: 'total', nudge: 'Every different lunch you make shifts your BiteClub Flavor Palate — boring desk lunch or not, the taste profile knows' },
        { label: 'Annual cost (homemade)', value: '$2,190', unit: '', nudge: 'Create a "Work Lunches" cookbook on BiteClub and add every packable recipe you find — pull it up on Sunday before you shop' },
        { label: 'You save per year', value: '$5,475', unit: '', nudge: 'Pack a lunch from a different cuisine each week — it adds to your BiteClub Cuisines Cooked map and costs about $12 less than eating out' },
        { label: 'Over 10 years invested at 7%', value: '$78,000+', unit: '', nudge: 'Pin your best under-$3 lunch to your BiteClub profile — that\'s the recipe your followers actually need, not another fancy dinner' },
        { label: 'Time to make coffee at home', value: '5', unit: 'min', nudge: 'Import your 5-minute breakfast recipe to BiteClub from wherever you found it — it\'s faster than the coffee queue and you\'ll have it forever' },
      ],
    }},

    grocery_hacks: { stats: {
      title: 'Planned vs Impulse Shopping',
      callout: 'A grocery list saves you 23% per trip and 40 minutes of wandering',
      cta: 'Save this week\'s recipes to a BiteClub cookbook before you set foot in a store',
      ctaSub: 'Your cookbook becomes the shopping list — shop once, cook all week, save 23% without thinking about it',
      stats: [
        { label: 'Savings per trip with a list', value: '23%', unit: '', nudge: 'Open BiteClub\'s Discovery feed and follow people who cook seasonally — their posts tell you what\'s cheap and worth buying right now' },
        { label: 'Impulse purchases avoided', value: '60%', unit: 'fewer', nudge: 'Post your planned-shop meals on BiteClub — your cooking history is proof that "I had a list" is a habit, not just an intention' },
        { label: 'Time saved per trip', value: '40', unit: 'min', nudge: 'Save this week\'s recipes to BiteClub before Thursday and your Saturday shop takes 40 fewer minutes — the streak gets a tick either way' },
        { label: 'Annual savings from list shopping', value: '$1,200+', unit: '', nudge: 'Every cuisine you plan and cook from adds to your BiteClub Flavor Palate — plan variety into your shopping list and your taste profile actually evolves' },
        { label: 'Food waste reduction', value: '50%', unit: '', nudge: 'Create a "This Week" cookbook on BiteClub — save exactly 7 recipes and buy exactly what\'s in them. That\'s the 50% waste reduction.' },
        { label: 'Buying in-season saves', value: '30-50%', unit: 'per item', nudge: 'Cook seasonal produce from different countries and your BiteClub Cuisines Cooked map grows alongside your grocery savings' },
        { label: 'Store brand vs name brand savings', value: '25%', unit: 'cheaper', nudge: 'Pin your best budget-shop meal to your BiteClub profile — "I made this for $4.50" is exactly the post your followers need to see' },
        { label: 'Trips per month reduced', value: '2-3', unit: 'fewer', nudge: 'Import recipes from anywhere into BiteClub and build a full week\'s plan — shop once, don\'t open the delivery app again until next Saturday' },
      ],
    }},

    // ── Health & Body ─────────────────────────────────────────────────────────

    calorie_truth: { stats: {
      title: 'The Calorie Truth About Eating Out',
      callout: 'Restaurant meals average 1,205 calories vs 550 at home — Johns Hopkins',
      cta: 'Find the home version of your usual order in BiteClub\'s Discovery feed — same dish, half the calories',
      ctaSub: 'Someone in your feed has already made it — save it to your cookbook and cook it tonight',
      stats: [
        { label: 'Avg restaurant meal', value: '1,205', unit: 'calories', nudge: 'Open BiteClub\'s Discovery feed and search for the home version of whatever you were about to order — it exists, it\'s 550 calories, and someone already posted the recipe' },
        { label: 'Avg home-cooked meal', value: '550', unit: 'calories', nudge: 'Post your home-cooked meals on BiteClub with a star rating — your cooking history becomes the visible proof that eating well at home is actually possible' },
        { label: 'Extra calories per meal', value: '655', unit: '', nudge: 'Cook at home every day this week — your BiteClub streak calendar fills up and 655 extra calories per meal stop being your default' },
        { label: 'Extra calories per week (eating out 5x)', value: '3,275', unit: '', nudge: 'Your BiteClub Flavor Palate tracks what you cook — home cooking builds Salty and Umami bars your way, not a restaurant\'s' },
        { label: 'That equals per month', value: '1.4 kg', unit: 'potential weight gain', nudge: 'Save a "Lighter Dinners" cookbook on BiteClub and add recipes as you find them — having options kills the impulse to order out' },
        { label: 'Hidden fats in restaurant food', value: '2-3x', unit: 'more butter/oil', nudge: 'Cook a different cuisine\'s lighter version each week — every new country you add to your BiteClub Cuisines Cooked map is a restaurant meal you skipped' },
        { label: 'People who underestimate restaurant calories', value: '92%', unit: '', nudge: 'Pin your best under-600-calorie meal to your BiteClub profile — show what "eating well" actually looks like on a home plate' },
        { label: 'Home cooks consume daily', value: '130', unit: 'fewer cal avg', nudge: 'Import your go-to lighter recipes to BiteClub from anywhere — when they\'re all in one place, 130 fewer calories per day stops being an effort' },
      ],
    }},

    portion_truth: { stats: {
      title: 'Restaurant Portions Are 2.5x Too Big',
      callout: 'Portion sizes have tripled since the 1950s. You control the plate at home.',
      cta: 'Cook your own portions and post what a real serving actually looks like on BiteClub',
      ctaSub: 'Pin your best home plate to your profile — your followers need the reference point more than another restaurant photo',
      stats: [
        { label: 'Restaurant pasta serving', value: '480g', unit: '', nudge: 'Find properly portioned pasta recipes in BiteClub\'s Discovery feed — people who cook at home post what 200g actually looks like on a plate' },
        { label: 'Recommended pasta serving', value: '200g', unit: '', nudge: 'Post your home pasta on BiteClub with the recipe — show your followers what a real serving looks like compared to what a restaurant puts in front of you' },
        { label: 'Portion increase since 1950s', value: '3x', unit: 'larger', nudge: 'Post every home meal on BiteClub this week — the streak proves you\'re eating on your own terms, not a restaurant\'s' },
        { label: 'Extra calories per oversized meal', value: '500+', unit: '', nudge: 'Your BiteClub Flavor Palate is built from what you cook, not what a restaurant decides to put in front of you — every home meal is a vote' },
        { label: 'Average restaurant plate diameter', value: '12"', unit: 'vs 9" recommended', nudge: 'Save proper-portion recipes to a "Lighter Meals" cookbook on BiteClub — 500 fewer calories starts with having the recipe, not the willpower' },
        { label: 'People who finish entire restaurant portions', value: '73%', unit: '', nudge: 'Cook a properly sized version of your usual restaurant dish from a different cuisine — new pin on your BiteClub Cuisines Cooked map, better portions' },
        { label: 'Home cooks who serve proper portions', value: '4x', unit: 'more likely', nudge: 'Pin your best home-portioned meal to your BiteClub profile — that photo is more honest than anything on a restaurant menu' },
        { label: '"Cleaning your plate" adds per year', value: '15+ kg', unit: 'potential gain', nudge: 'Import your lighter home versions of restaurant dishes to BiteClub from anywhere — that\'s your cooking history telling a better story' },
      ],
    }},

    sodium_truth: { stats: {
      title: 'The Hidden Sodium in Takeout',
      callout: 'One restaurant meal often contains your ENTIRE daily sodium limit',
      cta: 'Find a low-sodium version of your usual order in BiteClub\'s Discovery feed and cook it tonight',
      ctaSub: 'Post your home-seasoned meals — your cooking history shows the pattern, and it\'s a better one',
      stats: [
        { label: 'Avg restaurant meal sodium', value: '2,300', unit: 'mg', nudge: 'Find low-sodium home versions of your usual orders in BiteClub\'s Discovery feed — people who cook this way have already figured out what actually tastes good' },
        { label: 'Daily recommended limit', value: '2,300', unit: 'mg', nudge: 'Post your home-cooked meals on BiteClub — your cooking history at 800mg per meal looks very different from 2,300mg, and the difference is visible' },
        { label: 'Home-cooked meal sodium', value: '800', unit: 'mg avg', nudge: 'Cook at home every day this week and your BiteClub streak calendar fills green — 65% less sodium and a streak you can see' },
        { label: 'Reduction cooking at home', value: '65%', unit: 'less sodium', nudge: 'Your BiteClub Flavor Palate is built from what you actually season — cook at home and the Salty bar reflects your choices, not a restaurant\'s defaults' },
        { label: 'Fast food sodium per meal', value: '3,000+', unit: 'mg', nudge: 'Save homemade sauce recipes to a "From Scratch" cookbook on BiteClub — that\'s where the hidden 3,000mg swap actually happens' },
        { label: 'High sodium linked to hypertension', value: '45%', unit: 'higher risk', nudge: 'Cook one low-sodium version of a high-sodium takeout dish from each cuisine type — each one adds to your BiteClub Cuisines Cooked map' },
        { label: 'You control seasoning at home', value: '100%', unit: '', nudge: 'Pin your best homemade sauce recipe to your BiteClub profile — that\'s the one post that saves your followers from a hidden sodium source they\'d never think to check' },
        { label: 'Hidden sodium sources', value: 'Sauces', unit: 'bread, dressings', nudge: 'Import your from-scratch sauce and dressing recipes to BiteClub from anywhere — when they\'re saved, you\'ll actually make them instead of reaching for the bottle' },
      ],
    }},

    hidden_ingredients: { stats: {
      title: 'Know What You\'re Actually Eating',
      callout: 'The average packaged food has 15+ ingredients you can\'t pronounce',
      cta: 'Post your best 6-ingredient meal on BiteClub — short lists are the ones people actually cook from',
      ctaSub: 'Save clean, simple recipes to a "Real Ingredients" cookbook and you\'ll always know what\'s for dinner',
      stats: [
        { label: 'Ingredients in a takeout burger', value: '40+', unit: '', nudge: 'Find a 6-ingredient burger in BiteClub\'s Discovery feed — someone has already made the clean version and posted the recipe' },
        { label: 'Ingredients in a homemade burger', value: '6', unit: '', nudge: 'Post your 6-ingredient meal on BiteClub with the recipe listed — that ingredient count is the best marketing copy you\'ll write today' },
        { label: 'Preservatives in fast food', value: '12+', unit: 'per meal', nudge: 'Cook at home every day this week — your BiteClub streak grows and preservatives stop being your problem at exactly the same rate' },
        { label: 'Preservatives at home', value: '0', unit: '', nudge: 'Every clean meal you cook shifts your BiteClub Flavor Palate — Sweet and Umami bars built from real ingredients, not additives' },
        { label: 'Added sugars in packaged food', value: '73%', unit: 'of products', nudge: 'Create a "Real Ingredients" cookbook on BiteClub and save every clean recipe you find — that\'s your reference list for when the supermarket tries to sell you 40 ingredients' },
        { label: 'Food dyes in restaurant food', value: '5-8', unit: 'common ones', nudge: 'Cook clean dishes from different cuisines and add countries to your BiteClub Cuisines Cooked map — a world map built from real food is a good one' },
        { label: 'Emulsifiers linked to gut issues', value: 'Yes', unit: 'multiple studies', nudge: 'Pin your cleanest recipe to your BiteClub profile — that post tells your followers exactly the kind of cook you are' },
        { label: 'Home cooking: you read every label', value: '100%', unit: 'transparency', nudge: 'Import your cleanest recipes to BiteClub from any source — when they\'re saved, cooking from scratch takes less thought than reading a packaged food label' },
      ],
    }},

    gut_health: { stats: {
      title: 'Home Cooking = Better Gut Health',
      callout: 'Variety is key: home cooks eat 40% more diverse foods, feeding more gut bacteria',
      cta: 'Follow people in BiteClub\'s Discovery feed who cook differently from you — that variety is gut health',
      ctaSub: 'Post a different cuisine every week — your Cuisines Cooked map and your gut bacteria both get more interesting',
      stats: [
        { label: 'More diverse food intake', value: '+40%', unit: 'vs takeout eaters', nudge: 'Open BiteClub\'s Discovery feed and follow people who cook cuisines you never have — their recipes are the 40% food diversity your gut is missing' },
        { label: 'More fiber per day', value: '2x', unit: '', nudge: 'Post your plant-heavy home meals on BiteClub — your cooking history at 2x the fiber looks completely different from a takeout-first diet' },
        { label: 'Processed food reduction', value: '-60%', unit: '', nudge: 'Cook at home every day this week and your BiteClub streak builds — 60% less processed food is just what happens when the streak forces the habit' },
        { label: 'Gut bacteria diversity increase', value: '30%', unit: 'higher', nudge: 'Every new ingredient you cook with shifts your BiteClub Flavor Palate — a diverse gut and a diverse taste profile are built the same way' },
        { label: 'Fermented foods per week (home cooks)', value: '3.2', unit: 'servings', nudge: 'Save kimchi, miso, and kefir recipes to a "Fermentation" cookbook on BiteClub — 3.2 servings per week sounds daunting until it\'s on a saved list' },
        { label: 'Immune system strength linked to gut', value: '70%', unit: 'of immune system', nudge: 'Cook one dish from a new country\'s cuisine each week — every pin on your BiteClub Cuisines Cooked map is a new food culture feeding your gut' },
        { label: 'Mood improvement from gut health', value: '95%', unit: 'serotonin made in gut', nudge: 'Pin your best gut-health meal to your BiteClub profile — the recipe that tastes good AND makes you feel good is the one worth showing off' },
        { label: 'Prebiotics from home cooking', value: '4x', unit: 'more', nudge: 'Import your highest-fiber, most varied recipes to BiteClub from anywhere — 4x more prebiotics from home cooking starts with having the recipes actually saved' },
      ],
    }},

    weight_management: { stats: {
      title: 'The Weight Management Cheat Code',
      callout: 'People who cook at home 5+x/week weigh 2.5 kg less on average',
      cta: 'Post your home meals on BiteClub — your cooking history is the weight management plan that actually sticks',
      ctaSub: 'Find vegetable-forward recipes in Discovery, save them to a cookbook, and cook 5x this week',
      stats: [
        { label: 'Lower body weight (cooking 5x/wk)', value: '2.5 kg', unit: 'less avg', nudge: 'Browse BiteClub\'s Discovery feed and follow people who cook the way you want to eat — their recipes are the 2.5 kg difference in action' },
        { label: 'Fewer calories consumed daily', value: '130', unit: '', nudge: 'Post every home meal on BiteClub this week — your cooking history at 130 fewer calories per day looks like a very different pattern than ordering out' },
        { label: 'Less sugar intake', value: '40%', unit: '', nudge: 'Cook at home every day this week — your BiteClub streak tracks it and 40% less sugar is just what happens when the habit stays alive' },
        { label: 'More vegetables per day', value: '2.5', unit: 'extra servings', nudge: 'Every vegetable-heavy recipe you cook updates your BiteClub Flavor Palate — more plant cooking means more Umami and Bitter bars, and your gut notices' },
        { label: 'Better BMI on average', value: '1.7', unit: 'points lower', nudge: 'Save a "Weeknight Healthy" cookbook on BiteClub and add 7 recipes — having options is the only thing standing between you and the delivery app at 7pm' },
        { label: 'Mindful eating increase', value: '3x', unit: 'more aware', nudge: 'Cook dishes from different countries at home — every new cuisine you try adds to your BiteClub Cuisines Cooked map and swaps a restaurant meal for one you controlled' },
        { label: 'Snacking reduction', value: '45%', unit: 'less', nudge: 'Pin your best filling dinner to your BiteClub profile — 45% less snacking starts with a meal that was actually satisfying, and yours deserves a pin' },
        { label: 'Sustained weight management success', value: '78%', unit: 'vs 23% dieting', nudge: 'Import the recipes you come back to on BiteClub from anywhere — the habit that gets 78% vs 23% is just a saved recipe collection that you actually use' },
      ],
    }},

    immune_boost: { stats: {
      title: 'Cook Your Way to a Stronger Immune System',
      callout: 'Fresh whole foods provide 10x more bioavailable nutrients than processed meals',
      cta: 'Find your immune-boosting recipes in BiteClub\'s Discovery feed — save the ones with fresh garlic and turmeric first',
      ctaSub: 'Follow people who cook with fresh herbs and whole spices — their cooking history is basically a wellness plan',
      stats: [
        { label: 'Nutrient bioavailability (fresh vs processed)', value: '10x', unit: 'higher', nudge: 'Find whole-food, from-scratch recipes in BiteClub\'s Discovery feed — people who cook this way post what 10x more bioavailable nutrients actually looks like on a plate' },
        { label: 'Vitamin C from fresh cooking', value: '3x', unit: 'more retained', nudge: 'Post your fresh-ingredient meals on BiteClub — your cooking history at 3x Vitamin C retention is a very different story than a diet built on packaged food' },
        { label: 'Zinc absorption from home meals', value: '45%', unit: 'better', nudge: 'Cook whole foods every day this week — your BiteClub streak ticks up and 45% better zinc absorption comes along for free' },
        { label: 'Antioxidants from fresh herbs/spices', value: '5x', unit: 'more', nudge: 'Every herb-forward recipe you cook builds your BiteClub Flavor Palate — Bitter and Umami bars both shift when you start cooking with fresh turmeric and ginger' },
        { label: 'Sick days per year (home cooks)', value: '4.2', unit: 'vs 7.8 avg', nudge: 'Save your immune-boosting recipes to a "Winter Wellness" cookbook on BiteClub — 4.2 sick days vs 7.8 starts with having those recipes ready before you need them' },
        { label: 'Garlic compounds that boost immunity', value: 'Allicin', unit: 'lost in processing', nudge: 'Cook garlic-heavy dishes from different cuisines and add countries to your BiteClub Cuisines Cooked map — Korean, Levantine, Italian, all running fresh allicin' },
        { label: 'Turmeric absorption with fresh black pepper', value: '2,000%', unit: 'better', nudge: 'Pin your best turmeric + pepper recipe to your BiteClub profile — that combination detail is the one your followers will remember' },
        { label: 'Home cooks who meet daily vitamin needs', value: '72%', unit: 'vs 34%', nudge: 'Import your immune-supporting recipes to BiteClub from anywhere — 72% vs 34% is just the math on having the right recipes saved and actually using them' },
      ],
    }},

    // ── Mind & Happiness ──────────────────────────────────────────────────────

    happiness_stats: { stats: {
      title: 'Cooking Makes People Happier',
      callout: 'People who cook 5+ times/week report 47% higher life satisfaction',
      cta: 'Post what you cooked tonight on BiteClub — that feeling lasts 6+ hours and your profile deserves the proof',
      ctaSub: 'Cook 5x this week and your streak calendar fills up — that visual alone is 47% more satisfying than you\'d think',
      stats: [
        { label: 'Higher life satisfaction', value: '47%', unit: '', nudge: 'Browse BiteClub\'s Discovery feed and find something genuinely worth cooking tonight — that scroll sets the 6-hour mood boost in motion' },
        { label: 'Feel more in control of their life', value: '68%', unit: '', nudge: 'Post every meal on BiteClub this week — your cooking history is the most honest proof that the "more in control" feeling is actually compounding' },
        { label: 'Enjoy meals more than takeout', value: '3x', unit: '', nudge: 'Cook at home 5x this week and watch your BiteClub streak calendar fill up — the streak is the habit made visible, and the habit is the 47% satisfaction gap' },
        { label: 'Feel proud after cooking', value: '91%', unit: '', nudge: 'Your BiteClub Flavor Palate updates every time you cook — the profile that emerges from 91% proud cooking sessions is a very different one from takeout defaults' },
        { label: 'Positive mood boost duration', value: '6+', unit: 'hours', nudge: 'Save the recipes that you genuinely looked forward to cooking in a BiteClub cookbook — those are the only ones that reliably deliver the 6-hour mood boost' },
        { label: 'Sense of accomplishment', value: '85%', unit: 'report it', nudge: 'Every cuisine you cook from adds to your BiteClub Cuisines Cooked map — cooking something unfamiliar and nailing it is exactly the accomplishment 85% are describing' },
        { label: 'Would choose cooking over other hobbies', value: '42%', unit: '', nudge: 'Pin your best cooked meal to your BiteClub profile — the "Type of Cook" badge that emerges from cooking you love is different from one built from obligation' },
        { label: 'Report cooking as "meditative"', value: '63%', unit: '', nudge: 'Import tonight\'s recipe to BiteClub from anywhere and close every other app before you start — that\'s the meditative session, and the recipe was the only setup it needed' },
      ],
    }},

    stress_relief: { stats: {
      title: 'Cooking Reduces Stress by 25%',
      callout: 'Repetitive kitchen tasks (chopping, stirring) lower cortisol the same way meditation does',
      cta: 'Save tonight\'s de-stress recipe to BiteClub before 6pm — then put the phone down and cook it',
      ctaSub: 'Open BiteClub, pick a recipe, close every other app — that\'s the meditation with a better ending',
      stats: [
        { label: 'Cortisol reduction from cooking', value: '25%', unit: '', nudge: 'Find a 30-minute recipe in BiteClub\'s Discovery feed before the end of the workday — knowing what you\'re cooking at 6pm cuts cortisol before the chopping even starts' },
        { label: 'Anxiety reduction after 30 min cooking', value: '31%', unit: '', nudge: 'Post the meal you cooked when you needed it most on BiteClub — that recipe is in someone else\'s De-Stress folder and they don\'t know it yet' },
        { label: 'Comparable stress relief to', value: 'Meditation', unit: '', nudge: 'Cook every day this week — your BiteClub streak calendar fills up and 25% less cortisol becomes a habit pattern, not a one-off' },
        { label: 'Screen-free time per session', value: '45', unit: 'min avg', nudge: 'Save your recipe on BiteClub before you start — then set the phone face-down and let your Flavor Palate update on its own while you cook' },
        { label: 'Tactile engagement reduces tension', value: '40%', unit: '', nudge: 'Find bread or pasta recipes in a BiteClub cookbook — save them to a "Therapy Kitchen" collection and pull it up every time the day was rough' },
        { label: 'Heart rate decreases while cooking', value: '12%', unit: 'avg', nudge: 'Cook from a cuisine you\'ve never tried — new ingredients, new techniques, new country on your BiteClub Cuisines Cooked map, and 12% lower heart rate' },
        { label: 'Therapists who recommend cooking', value: '78%', unit: 'of surveyed OTs', nudge: 'Pin your most calming recipe to your BiteClub profile — the one you cook when you need it is the one worth showing other people' },
        { label: '"Cooking is my therapy"', value: '66%', unit: 'of regular cooks agree', nudge: 'Import your go-to de-stress recipe to BiteClub from wherever you found it — 66% of your followers are cooking for the same reason and need exactly that recipe' },
      ],
    }},

    creativity_brain: { stats: {
      title: 'Cooking Rewires Your Brain for Creativity',
      callout: 'Novel flavour combinations activate the same neural circuits as art and music composition',
      cta: 'Post your cooking experiments on BiteClub — your followers can save the improvised version and riff on it too',
      ctaSub: 'Your "Type of Cook" badge on BiteClub gets built from what you actually make, not what you planned to',
      stats: [
        { label: 'Same brain circuits as art/music', value: 'Yes', unit: 'confirmed by fMRI', nudge: 'Find creative cooks in BiteClub\'s Discovery feed and follow them — their experiments are the brief you didn\'t know you needed' },
        { label: 'Feel more creative overall', value: '73%', unit: 'of home cooks', nudge: 'Post your cooking experiments on BiteClub — every improvised meal that goes on your cooking history is the 73% creative boost, documented' },
        { label: 'New recipes tried per month', value: '4+', unit: 'avg', nudge: 'Cook 4+ new recipes per month and your BiteClub streak calendar reflects the habit — each new attempt is a neural circuit that didn\'t exist before' },
        { label: 'Improvisation builds neural pathways', value: '38%', unit: 'stronger', nudge: 'Every cuisine you experiment with shifts your BiteClub Flavor Palate — the Bitter and Spice bars that grow from improvisation are the good kind of unpredictable' },
        { label: 'Problem-solving skills improvement', value: '29%', unit: '', nudge: 'Save recipes that are just above your current skill level into a "Next Level" cookbook on BiteClub — the challenge is the whole point' },
        { label: 'Dopamine from successful new dish', value: '2x', unit: 'vs routine meal', nudge: 'Try cooking from a cuisine you\'ve never touched before — the new country on your BiteClub Cuisines Cooked map is the 2x dopamine made tangible' },
        { label: 'Cross-domain creativity transfer', value: 'Yes', unit: 'cooking to work', nudge: 'Pin your most interesting improvised dish to your BiteClub profile — your "Type of Cook" badge reflects the cooking that surprises even you' },
        { label: 'Express personality through food', value: '89%', unit: 'agree', nudge: 'Import your best improvised recipe to BiteClub from memory or notes — 89% express personality through food, and yours is the one worth preserving' },
      ],
    }},

    screen_detox: { stats: {
      title: 'Cooking = The Best Screen Detox',
      callout: '45 minutes of phone-free presence every single day, and you eat better too',
      cta: 'Save tonight\'s recipe to BiteClub — then put the phone face-down and cook it',
      ctaSub: 'BiteClub is the only screen time that ends with you putting the phone down for 45 minutes',
      stats: [
        { label: 'Avg phone-free time per cooking session', value: '45', unit: 'min', nudge: 'Browse BiteClub\'s Discovery feed before dinner, pick a recipe, save it — then the phone goes on the counter face-down for 45 minutes' },
        { label: 'Screen time reduction per week', value: '5.25', unit: 'hours', nudge: 'Post your finished meal on BiteClub after you cook — that\'s the only screen interaction the session needs, and your cooking history gets the credit' },
        { label: 'Mindfulness score increase', value: '34%', unit: '', nudge: 'Cook every day this week — your BiteClub streak calendar fills up and 5.25 hours of phone-free time per week happens automatically alongside it' },
        { label: 'Hands too busy for scrolling', value: '100%', unit: '', nudge: 'Every cuisine you cook while offline still adds to your BiteClub Flavor Palate when you post it — the Spice and Umami bars don\'t care that your phone was face-down' },
        { label: 'Present-moment awareness boost', value: '3x', unit: '', nudge: 'Save tonight\'s recipe to a BiteClub cookbook before you start — once your hands are in the dough, the cookbook was all you ever needed' },
        { label: 'Better sleep from less screen time', value: '27%', unit: 'improvement', nudge: 'Cook something from a new country tonight — new pin on your BiteClub Cuisines Cooked map, no delivery scroll, 27% better sleep' },
        { label: 'Eye strain reduction', value: '40%', unit: '', nudge: 'Pin your best "I put the phone down to make this" meal to your BiteClub profile — that\'s the post that tells other people it\'s worth trying' },
        { label: 'People who feel "refreshed" after cooking', value: '71%', unit: '', nudge: 'Import your go-to recipe to BiteClub from wherever it lives — when it\'s saved, one tap is all the screen time the session needs before the phone disappears for 45 minutes' },
      ],
    }},

    confidence_data: { stats: {
      title: 'Cooking Builds Real Confidence',
      callout: 'Every dish you nail is proof you can learn anything',
      cta: 'Post what you made on BiteClub — even if it wasn\'t perfect. That\'s the post that builds confidence most.',
      ctaSub: 'Your cooking history on BiteClub is your confidence journey — scroll back 6 months and the difference is obvious',
      stats: [
        { label: 'Feel more capable in life', value: '78%', unit: '', nudge: 'Browse BiteClub\'s Discovery feed and find someone cooking slightly above your current skill — follow them and cook one of their recipes this week' },
        { label: 'Try harder recipes each month', value: '+1', unit: 'per month', nudge: 'Post every meal on BiteClub — your cooking history is the 78% more capable version of you, documented in real time' },
        { label: 'More likely to host dinners', value: '3x', unit: '', nudge: 'Cook every day this week and watch your BiteClub streak calendar fill — 3x more likely to host starts with a streak that proves you actually cook' },
        { label: 'Self-rated confidence increase', value: '+35%', unit: '', nudge: 'Every recipe you try shifts your BiteClub Flavor Palate — scroll back through your cooking history after 3 months and the bars tell a completely different story' },
        { label: 'Transfer confidence to other skills', value: '62%', unit: 'report it', nudge: 'Save one recipe per month that\'s just above your skill level into a "Next Level" cookbook on BiteClub — that one save is the confidence compound' },
        { label: '"I can figure things out" mindset', value: '4x', unit: 'more common', nudge: 'Cook something from a cuisine you\'ve never tried — the new country on your BiteClub Cuisines Cooked map is proof you figured something new out' },
        { label: 'Reduced fear of failure', value: '45%', unit: '', nudge: 'Pin the recipe you\'re most proud of to your BiteClub profile — that\'s your "Type of Cook" badge in a single dish' },
        { label: 'Comfortable improvising', value: '83%', unit: 'after 6 months', nudge: 'Import your improvised recipes to BiteClub as you make them — 83% comfortable improvising after 6 months, and your cooking history tracks the whole arc' },
      ],
    }},

    sleep_quality: { stats: {
      title: 'Home Cooking Improves Sleep Quality',
      callout: 'Lighter dinners + less sodium + no late-night delivery = better rest',
      cta: 'Find your lighter dinner recipe in BiteClub\'s Discovery feed and save it before 5pm',
      ctaSub: 'Good dinner saved, phone down, no delivery scroll — that\'s the pipeline to 32% better sleep',
      stats: [
        { label: 'Sleep quality improvement', value: '32%', unit: '', nudge: 'Browse BiteClub\'s Discovery feed for light dinner recipes — search "soup" or "salad" and follow the people who cook for how they want to feel in the morning' },
        { label: 'Fall asleep faster', value: '15', unit: 'min sooner', nudge: 'Post your lighter home dinners on BiteClub — your cooking history at under-600-calorie evenings tells a very different story than delivery receipts' },
        { label: 'Less bloating at night', value: '60%', unit: 'reduction', nudge: 'Cook a light dinner every night this week — your BiteClub streak tracks the habit that gets you to 60% less bloating without a single rule to follow' },
        { label: 'Sodium reduction (less water retention)', value: '65%', unit: '', nudge: 'Every low-sodium dinner you cook shifts your BiteClub Flavor Palate — less Salty, more Umami, and you\'ll feel the difference in the morning' },
        { label: 'Lighter dinner portions', value: '40%', unit: 'smaller vs eating out', nudge: 'Save lighter versions of your favourite comfort foods to a "Light Dinners" cookbook on BiteClub — having them ready kills the 7pm delivery impulse' },
        { label: 'No late-night delivery temptation', value: '100%', unit: '', nudge: 'Cook from a different cuisine\'s lighter tradition each evening — new pin on your BiteClub Cuisines Cooked map, no delivery app, better sleep' },
        { label: 'Tryptophan-rich meals at home', value: '2x', unit: 'more often', nudge: 'Pin your best light dinner to your BiteClub profile — the recipe that makes you feel good the next morning is the most useful thing you can share' },
        { label: 'Report feeling "well-rested" in morning', value: '68%', unit: '', nudge: 'Import your go-to evening meals to BiteClub from wherever you found them — when the recipe is saved, dinner takes 20 minutes and you skip the delivery scroll entirely' },
      ],
    }},

    therapy_cooking: { stats: {
      title: 'Therapeutic Cooking Is Real Science',
      callout: 'Occupational therapists prescribe cooking for anxiety, depression, and PTSD recovery',
      cta: 'Cook one thing tonight — then post it on BiteClub. Small wins compound.',
      ctaSub: 'Your cooking streak on BiteClub is the visible proof you showed up — check the weekly calendar',
      stats: [
        { label: 'OTs who prescribe cooking therapy', value: '78%', unit: 'in mental health', nudge: 'Browse BiteClub\'s Discovery feed for a simple, methodical recipe — clear steps and repetitive technique are exactly what 78% of therapists are pointing people toward' },
        { label: 'Anxiety reduction in studies', value: '37%', unit: '', nudge: 'Post every meal on BiteClub, even the simple ones — your cooking history is the streak of small wins that adds up to 37% less anxiety' },
        { label: 'Depression symptom improvement', value: '29%', unit: '', nudge: 'Cook something every day this week — your BiteClub streak calendar fills green and the daily win is visible in a way a journal entry never quite manages' },
        { label: 'PTSD recovery programs using cooking', value: '150+', unit: 'worldwide', nudge: 'Every meal you cook builds your BiteClub Flavor Palate — a profile that shifts over time because you chose what went into it' },
        { label: 'Sense of agency and control', value: '4x', unit: 'higher after cooking', nudge: 'Save an approachable recipe to BiteClub before tonight — just having it ready is the first act of agency the 4x feeling is built on' },
        { label: 'Group cooking therapy effectiveness', value: '83%', unit: 'report benefit', nudge: 'Cook a dish from a new cultural background and add a pin to your BiteClub Cuisines Cooked map — each new country is a small act of curiosity that builds its own momentum' },
        { label: 'Cooking engages all 5 senses', value: '5/5', unit: 'grounding technique', nudge: 'Pin the recipe you cook on hard days to your BiteClub profile — that pinned dish is better than any description of who you are' },
        { label: 'Recommended by WHO for wellbeing', value: 'Yes', unit: '', nudge: 'Import the recipe you cook for yourself when you need it to BiteClub from wherever it lives — that one saved recipe is the WHO recommendation made personal' },
      ],
    }},

    flow_state: { stats: {
      title: 'Cooking Puts You in Flow State',
      callout: 'The same brain state as meditation, music performance, and peak athletic moments',
      cta: 'Find a recipe worth losing yourself in — search BiteClub\'s Discovery feed for something slightly above your skill',
      ctaSub: 'Save something just challenging enough, then cook until time disappears and post it when you come back',
      stats: [
        { label: 'Flow state achievability in cooking', value: '68%', unit: 'of sessions', nudge: 'Find someone in BiteClub\'s Discovery feed who cooks one skill level above you — follow them and cook from their posts' },
        { label: 'Time perception distortion', value: '45 min', unit: 'feels like 15', nudge: 'Post what you made after the session on BiteClub — your cooking history is full of meals that felt like 15 minutes and took 45, and that contrast is the point' },
        { label: 'Same brain state as', value: 'Meditation', unit: '& music', nudge: 'Cook every day this week — your BiteClub streak calendar fills up and near-zero stress hormones become a daily default' },
        { label: 'Dopamine increase during flow', value: '5x', unit: '', nudge: 'Every complex recipe you cook builds a more interesting BiteClub Flavor Palate — the Umami and Spice bars that come from ambitious cooking are different from weeknight defaults' },
        { label: 'Productivity boost after flow', value: '500%', unit: 'Csikszentmihalyi', nudge: 'Save an engrossing recipe to a "Flow Kitchen" cookbook on BiteClub — the kind with enough steps that you stop thinking about everything else' },
        { label: 'Stress hormones during flow', value: 'Near zero', unit: '', nudge: 'Cook a complex dish from a cuisine you\'ve never tried — new technique, new country on your BiteClub Cuisines Cooked map, near-zero stress while you\'re doing it' },
        { label: 'Perfect challenge/skill balance', value: 'Cooking scales', unit: 'with your level', nudge: 'Pin the dish that put you in flow to your BiteClub profile — your "Type of Cook" badge gets shaped by the cooking that made you lose track of time' },
        { label: '"I lost track of time cooking"', value: '74%', unit: 'of regular cooks', nudge: 'Import the recipe that triggered your best cooking session to BiteClub from wherever you found it — 74% of your followers want to try it' },
      ],
    }},

    // ── Getting Better ────────────────────────────────────────────────────────

    seven_day_challenge: { stats: {
      title: '7 Days of Cooking Changes Everything',
      callout: 'By day 7 you\'re faster, more confident, and hooked',
      cta: 'Save 7 recipes to a BiteClub cookbook before day 1 — not having to search is the only thing that makes it stick',
      ctaSub: 'Post every day this week — your cooking history will tell a visible story by day 7',
      stats: [
        { label: 'Day 1-2', value: 'Hard', unit: 'but exciting', nudge: 'Browse BiteClub\'s Discovery feed before you start and save 7 beginner-friendly recipes to a "7 Day Challenge" cookbook — day 1 needs a plan, not a search' },
        { label: 'Day 3-4', value: 'Getting faster', unit: '30% quicker', nudge: 'Post every meal on BiteClub — by day 4 your cooking history has a visible streak and the 30% speed gain is already in the timestamps' },
        { label: 'Day 5-6', value: 'Feeling proud', unit: 'improvising starts', nudge: 'Your BiteClub Flavor Palate has already shifted by day 5 — cook something different from days 1-4 and watch the bars move' },
        { label: 'Day 7', value: 'Hooked', unit: 'new habit formed', nudge: 'Day 7 meal on BiteClub, posted, streaked — your cooking history now has a week-long story visible to everyone who follows you' },
        { label: 'Grocery bill reduction by day 7', value: '25%', unit: '', nudge: 'Cook from your 7-day cookbook all week — by day 7 you\'ve shopped from your BiteClub saves and spent 25% less because you bought only what was in them' },
        { label: 'Confidence increase after 7 days', value: '48%', unit: '', nudge: 'Try a different cuisine each day this week — by day 7 your BiteClub Cuisines Cooked map has 7 new pins and your confidence has 48% more evidence behind it' },
        { label: 'Continue cooking after challenge', value: '86%', unit: '', nudge: 'Pin the best meal from your 7-day week to your BiteClub profile — that pinned dish is your "Type of Cook" badge updating in real time' },
        { label: 'Recommend it to a friend', value: '92%', unit: '', nudge: 'Share your BiteClub profile link at the end of the week — your cooking history makes the recommendation for you, and 92% of people who try it tell someone else' },
      ],
    }},

    skill_progression: { stats: {
      title: 'The Cooking Skill Tree',
      callout: 'Every master was once a disaster. Here\'s the progression.',
      cta: 'Post every skill unlock on BiteClub — your cooking history is the skill tree, not a to-do list',
      ctaSub: 'Find someone 6 levels above you in Discovery and follow them — their cooking history is your roadmap',
      stats: [
        { label: 'Level 1: Boil water, make toast', value: 'Week 1', unit: '', nudge: 'Browse BiteClub\'s Discovery feed for the simplest recipes on there — follow someone at level 5 and save their easiest post to start' },
        { label: 'Level 5: Stir fry, basic pasta', value: 'Month 1', unit: '', nudge: 'Post your month-1 stir fry on BiteClub — the first entry in your cooking history is the one you\'ll scroll back to when you\'re at level 20' },
        { label: 'Level 10: Season by taste, multi-dish', value: 'Month 3', unit: '', nudge: 'Cook every day and your BiteClub streak tracks the sessions that got you from "following a recipe" to "seasoning by feel"' },
        { label: 'Level 15: 3-course dinner, no recipe', value: 'Month 6', unit: '', nudge: 'At month 6, your BiteClub Flavor Palate reflects 6 months of intentional cooking — Salty, Umami, and Spice bars that you actually built' },
        { label: 'Level 20: Baking from scratch', value: 'Month 9', unit: '', nudge: 'Save baking recipes to a "Baking" cookbook on BiteClub at month 9 — your saved list at this point is a serious personal cookbook' },
        { label: 'Level 25: International cuisines', value: 'Year 1', unit: '', nudge: 'By year 1 your BiteClub Cuisines Cooked map has pins from multiple countries — that world map is the most honest measure of a level-25 cook' },
        { label: 'Level 30: Dinner party host', value: 'Year 1-2', unit: '', nudge: 'At level 30, pin your dinner party menu to your BiteClub profile — your followers are saving your recipes to use themselves, which is the only "Type of Cook" badge that actually means something' },
        { label: 'Each level unlocks the next faster', value: 'Compound effect', unit: '', nudge: 'Import every recipe you\'ve mastered to BiteClub from wherever it lives — your cooking history is the compound effect, visible' },
      ],
    }},

    speed_gains: { stats: {
      title: 'You\'re Getting Faster Than You Think',
      callout: 'Practice makes dinner. Measurable speed improvements happen in weeks.',
      cta: 'Post your meals on BiteClub every time — the cooking history timestamps tell the speed story',
      ctaSub: 'Cook the same recipe 5 times and watch yourself get faster — your profile is tracking it whether you notice or not',
      stats: [
        { label: 'First pasta attempt', value: '90', unit: 'min', nudge: 'Browse BiteClub\'s Discovery feed and find a pasta recipe posted by someone who looks like they cook it fast — follow them and save that recipe for attempt one' },
        { label: 'After 5 tries', value: '45', unit: 'min', nudge: 'Post every attempt on BiteClub — by attempt 5, your cooking history has two posts on the same recipe and the timestamps are 45 minutes apart for a reason' },
        { label: 'After 20 tries', value: '20', unit: 'min', nudge: 'Cook the same recipe 20 times and your BiteClub streak barely notices — the habit is invisible by then, and so is the 20-minute gap from where you started' },
        { label: 'Knife skills improvement', value: '3x', unit: 'faster in 30 days', nudge: 'Your BiteClub Flavor Palate builds faster when you cook more prep-heavy dishes — Salty and Umami bars shift when you stop buying pre-chopped everything' },
        { label: 'Mise en place saves per session', value: '15', unit: 'min', nudge: 'Save multi-component recipes to a "Level Up" cookbook on BiteClub — the ones with overlapping timers are where the 15-minute-per-session prep habit actually forms' },
        { label: 'Parallel cooking (multitask) by month 2', value: 'Yes', unit: '', nudge: 'Try a cuisine that requires parallel cooking by month 2 — every new country you add to your BiteClub Cuisines Cooked map came with a technique you didn\'t have before' },
        { label: 'Grocery shopping time reduction', value: '50%', unit: 'with practice', nudge: 'Pin the recipe you cook fastest to your BiteClub profile — that\'s your "Type of Cook" proof in dish form' },
        { label: 'Cleanup time reduction', value: '40%', unit: 'clean-as-you-go habit', nudge: 'Import every recipe you\'ve sped up dramatically to BiteClub from wherever it lives — that\'s the cooking history that shows "faster" is real, not imagined' },
      ],
    }},

    ten_recipes: { stats: {
      title: '10 Recipes = Never Bored, Never Ordering In',
      callout: 'Build your personal top 10 and eat well forever',
      cta: 'Start a "My Top 10" cookbook on BiteClub right now — add 3 you\'ve already made and find the rest in Discovery',
      ctaSub: 'Build it once, cook from it forever — your saved recipes are your permanent collection',
      stats: [
        { label: 'Recipes to feel confident', value: '5', unit: '', nudge: 'Open BiteClub\'s Discovery feed and save 5 recipes that make you think "I\'d genuinely eat that" — those 5 saves are the foundation, everything else is optional' },
        { label: 'Recipes to never be bored', value: '10', unit: '', nudge: 'Post every recipe you master on BiteClub — your cooking history is the running record of which 10 you actually come back to' },
        { label: 'Recipes to impress anyone', value: '15', unit: '', nudge: 'Cook one new recipe from your BiteClub cookbook per week — 10 weeks gets you to 10, and the weekly streak tracks every one' },
        { label: 'Avg tries to master a recipe', value: '3', unit: '', nudge: 'Every recipe you master shifts your BiteClub Flavor Palate — after 10 different dishes your Sweet, Salty, and Umami bars are genuinely yours' },
        { label: 'Weeks to build your top 10', value: '6-8', unit: '', nudge: 'Create a "My Top 10" cookbook on BiteClub and add recipes as you find and master them — pull it up every time the "what\'s for dinner" panic starts' },
        { label: 'Meals covered per week', value: '7', unit: 'with rotation', nudge: 'Make your top 10 span as many countries as possible — every cuisine you include adds another pin to your BiteClub Cuisines Cooked map' },
        { label: 'Boredom level with 10 recipes', value: '0', unit: '', nudge: 'Pin your best recipe to your BiteClub profile — the one that made it to the top 10 is the one worth putting front and center' },
        { label: 'Takeout orders after building top 10', value: '-80%', unit: '', nudge: 'Import your mastered recipes to BiteClub from wherever they live — a top 10 in one place gives you 10 answers to "what\'s for dinner?" before you even open the delivery app' },
      ],
    }},

    compound_effect: { stats: {
      title: 'The Compound Effect of Cooking Daily',
      callout: 'Small daily practice, massive yearly transformation. 1% better every day.',
      cta: 'Post every meal on BiteClub — 365 meals is a cooking history that tells a year-long story',
      ctaSub: 'Start tonight and check back in 6 months — the difference in your cooking history will be obvious',
      stats: [
        { label: '1 month of daily cooking', value: '30', unit: 'meals practiced', nudge: 'Browse BiteClub\'s Discovery feed each week and follow someone who cooks differently from you — 30 varied meals in month one is what diversity looks like' },
        { label: '6 months', value: '180', unit: 'meals — real confidence', nudge: 'Post every meal on BiteClub from day one — at 180 meals, your cooking history is the compound effect made visible in a scroll' },
        { label: '1 year', value: '365', unit: 'meals — teaching others', nudge: 'Cook every day and your BiteClub streak calendar never lies — 365 weekly ticks is the habit in its most honest form' },
        { label: 'Skills gained per month', value: '2-3', unit: 'new techniques', nudge: 'At month 3 your BiteClub Flavor Palate looks completely different from month 1 — 2-3 new cuisines per month is what a shifting taste profile actually means' },
        { label: 'Money saved year 1', value: '$5,100', unit: '', nudge: 'Save 2-3 new recipes per month to your BiteClub cookbooks — the techniques come free with the recipes and the $5,100 comes free with the habit' },
        { label: 'Health improvement', value: 'Measurable', unit: 'by month 3', nudge: 'By month 6, your BiteClub Cuisines Cooked map has pins from multiple countries — that map is the most honest measure of compound cooking progress' },
        { label: 'Social meals hosted in year 1', value: '12+', unit: '', nudge: 'At 12+ meals hosted, pin your best dinner party dish to your BiteClub profile — your "Type of Cook" badge by year 1 was built from 365 days of decisions' },
        { label: 'Confidence level after 1 year', value: 'Unrecognizable', unit: '', nudge: 'Import every recipe you\'ve mastered over the year to BiteClub — your cooking history at 365 is the compound effect, and it\'s worth preserving' },
      ],
    }},

    // ── BiteClub Live (placeholder data — replaced by PostHog) ────────────────

    day_one: { stats: {
      title: 'Day 1: Posting on TikTok to Grow Our App',
      callout: 'Follow the journey. We\'re posting every day to see if TikTok can grow a cooking app.',
      cta: 'Download BiteClub — post your first meal and start your Cooking History today',
      ctaSub: 'We\'re at 0 followers and you\'re at 0 posts — we\'re both building from day one',
      stats: [
        { label: 'Followers', value: '0', unit: '' },
        { label: 'Posts', value: '3', unit: '' },
        { label: 'Views', value: '798', unit: '' },
        { label: 'Downloads from TikTok', value: '0', unit: '' },
        { label: 'Goal', value: '1,000', unit: 'followers' },
        { label: 'Time spent building', value: '6', unit: 'months' },
        { label: 'Meals logged in BiteClub', value: '847', unit: '' },
        { label: 'Team size', value: '2', unit: 'founders' },
      ],
    }},

    week_one_update: { stats: {
      title: 'Week 1 Update: Here\'s What Happened',
      callout: 'Transparency is the strategy. Here\'s exactly how it\'s going.',
      cta: 'Try BiteClub this week — post a meal, start a streak, see what a week of cooking looks like',
      ctaSub: 'Post your meals while we post our numbers — your Cooking History and our follower count both start at zero',
      stats: [
        { label: 'New followers', value: '12', unit: '' },
        { label: 'Total views', value: '2,341', unit: '' },
        { label: 'Best performing post', value: '1,104', unit: 'views' },
        { label: 'Meals logged this week', value: '63', unit: '' },
        { label: 'New app signups from TikTok', value: '0', unit: '' },
        { label: 'Hours spent creating content', value: '8', unit: '' },
        { label: 'Biggest lesson', value: 'Consistency > perfection', unit: '' },
        { label: 'Next week\'s goal', value: '50', unit: 'followers' },
      ],
    }},

    growth_numbers: { stats: {
      title: 'Our Real Numbers (No Cap)',
      callout: 'Most startups hide their numbers. We\'re sharing ours.',
      cta: 'Try BiteClub — post your first meal, add it to your Cooking History, keep the streak alive',
      ctaSub: 'Those 847 meals were logged by real people — your Cooking History starts with meal number one',
      stats: [
        { label: 'Total app users', value: '84', unit: '' },
        { label: 'Monthly active cooks', value: '31', unit: '' },
        { label: 'Meals logged all-time', value: '847', unit: '' },
        { label: 'TikTok followers', value: '0', unit: '' },
        { label: 'Revenue', value: '$0', unit: '(pre-revenue)' },
        { label: 'Burn rate', value: 'Coffee + servers', unit: '' },
        { label: 'Countries with users', value: '4', unit: '' },
        { label: 'Most cooked dish', value: 'Chicken Tikka Masala', unit: '' },
      ],
    }},

    tiktok_experiment: { stats: {
      title: 'Can TikTok Grow a Cooking App?',
      callout: 'We\'re running the experiment so you don\'t have to. Follow to see the results.',
      cta: 'Download BiteClub and be part of the experiment — post your meals while we post our results',
      ctaSub: 'Share recipes, build your Cooking History, follow people in Discovery — and help us find out if this works',
      stats: [
        { label: 'Hypothesis', value: 'Recipe carousels', unit: '-> app downloads' },
        { label: 'Posts per week', value: '5-7', unit: '' },
        { label: 'Content types', value: 'Recipes, tips, data, debates', unit: '' },
        { label: 'Target', value: '10K followers', unit: 'in 90 days' },
        { label: 'Budget', value: '$0', unit: '(organic only)' },
        { label: 'Strategy', value: 'Value-first content', unit: '' },
        { label: 'Tracking', value: 'Weekly updates here', unit: '' },
        { label: 'Follow along', value: '@getbiteclub', unit: '' },
      ],
    }},

    milestone_hit: { stats: {
      title: 'We Just Hit a Milestone',
      callout: 'Every milestone matters when you\'re building from zero.',
      cta: 'Download BiteClub — post your meals, keep a streak, help us hit the next milestone',
      ctaSub: 'Post what you cook, follow people in Discovery, save recipes to cookbooks — that\'s the product we\'re building',
      stats: [
        { label: 'Milestone', value: '100', unit: 'followers' },
        { label: 'Days it took', value: '14', unit: '' },
        { label: 'Total posts', value: '18', unit: '' },
        { label: 'Best post views', value: '4,200', unit: '' },
        { label: 'App downloads this month', value: '7', unit: '' },
        { label: 'Top content type', value: 'Recipe carousels', unit: '' },
        { label: 'Community meals logged', value: '912', unit: '' },
        { label: 'What\'s next', value: '500 followers', unit: '' },
      ],
    }},

    content_strategy: { stats: {
      title: 'Our Exact TikTok Content Strategy',
      callout: 'We built a tool to automate our content. This post was made with it.',
      cta: 'Download BiteClub — post your meals, save recipes to cookbooks, keep your streak going',
      ctaSub: 'Cooking History, Flavor Palate, Cuisines Cooked map, Cooking Streaks — that\'s the product we\'re posting all this to grow',
      stats: [
        { label: 'Recipe carousels', value: '3x/week', unit: '' },
        { label: 'Infographics (like this)', value: '2x/week', unit: '' },
        { label: 'Food debates', value: '1x/week', unit: '' },
        { label: 'Building in public', value: '1x/week', unit: '' },
        { label: 'Time to create each', value: '15 min', unit: '(automated)' },
        { label: 'Secret weapon', value: 'BiteClub Poster tool', unit: '' },
        { label: 'Cost', value: '$0', unit: '' },
        { label: 'Results so far', value: '0 followers in 3 days', unit: '' },
      ],
    }},

    where_chefs_cook: { stats: {
      title: 'Where Our Chefs Are Cooking',
      callout: 'BiteClub has cooks in 4 countries and counting \u2014 here\'s what the kitchen looks like right now',
      cta: 'Add your city to the map',
      ctaSub: 'Post your first meal and your Cuisines Cooked map starts building',
      visual: 'map',
      stats: [
        { label: 'Countries with active cooks', value: '4', unit: '', nudge: 'Every meal you post adds to BiteClub\'s global kitchen \u2014 your city shows up on the map' },
        { label: 'Top city', value: 'Malm\u00F6', unit: 'Sweden', nudge: 'Your Cuisines Cooked map fills in as you cook dishes from around the world' },
        { label: 'Meals posted this week', value: '63', unit: '', nudge: 'Each meal post builds your cooking streak \u2014 the weekly calendar tracks your consistency' },
        { label: 'Most active cooking day', value: 'Sunday', unit: '', nudge: 'Pin your Sunday cook to your BiteClub profile \u2014 let people see your best work' },
        { label: 'New cooks this month', value: '7', unit: '', nudge: 'Find new cooks near you in the Discovery feed \u2014 follow them and cook what they\'re making' },
        { label: 'Recipes shared across borders', value: '12', unit: '', nudge: 'Import a recipe from a cook in another country \u2014 it saves straight to your Cookbooks' },
        { label: 'Most cooked cuisine', value: 'Indian', unit: '', nudge: 'Your Flavor Palate bars shift every time you cook a new cuisine \u2014 watch the Spice bar climb' },
        { label: 'Cooks with 4+ week streaks', value: '8', unit: '', nudge: 'Your cooking streak is visible on your profile \u2014 4 weeks puts you in the top tier of BiteClub' },
      ],
    }},

    top_cuisines: { stats: {
      title: 'Top Cuisines on BiteClub Right Now',
      callout: 'This week\'s most cooked cuisines across the BiteClub community',
      cta: 'Cook something new this week',
      ctaSub: 'Every new cuisine adds a pin to your Cuisines Cooked map',
      visual: 'bars',
      barTitle: 'TOP CUISINES THIS WEEK',
      barData: [
        { label: 'Indian', value: 100 },
        { label: 'Italian', value: 80 },
        { label: 'American', value: 70 },
        { label: 'Mexican', value: 45 },
        { label: 'Thai', value: 35 },
        { label: 'Japanese', value: 30 },
      ],
      stats: [
        { label: '#1 cuisine this week', value: 'Indian', unit: '', nudge: 'Your BiteClub Cuisines Cooked map lights up every time you try a new origin \u2014 how many countries are on yours?' },
        { label: '#2 cuisine this week', value: 'Italian', unit: '', nudge: 'Save Italian recipes to a "Weeknight Pasta" cookbook on BiteClub \u2014 pull it up when you need dinner in 20 minutes' },
        { label: '#3 cuisine this week', value: 'American', unit: '', nudge: 'Post your version with a star rating and a caption \u2014 the Discovery feed shows it to cooks who follow that cuisine' },
        { label: 'Unique cuisines cooked this week', value: '9', unit: '', nudge: 'Your Flavor Palate bars evolve with every new dish \u2014 Sweet, Sour, Salty, Bitter, Umami, Spice all shift as you cook' },
        { label: 'Most adventurous cook', value: '6', unit: 'cuisines in 7 days', nudge: 'The more cuisines you cook, the richer your BiteClub Cooking Styles tags get \u2014 from Simmering to Grilling' },
        { label: 'New recipes uploaded this week', value: '14', unit: '', nudge: 'Import recipes from anywhere \u2014 a cookbook, a blog, a friend\'s text message \u2014 it all goes into your BiteClub recipe library' },
        { label: 'Community\'s top dish', value: 'Chicken Tikka', unit: '', nudge: 'Pin your best version of a trending dish to your profile \u2014 that\'s how people find you on BiteClub' },
        { label: 'Cooks who tried a new cuisine', value: '11', unit: 'this week', nudge: 'Your Cooking History tab shows every dish you\'ve ever made \u2014 the timeline of your food journey' },
      ],
    }},

    global_kitchen: { stats: {
      title: 'BiteClub\'s Global Kitchen',
      callout: 'From Malm\u00F6 to Mumbai \u2014 real cooks posting real food from real kitchens around the world',
      cta: 'Join the global kitchen',
      ctaSub: 'Your cooking profile starts with one meal \u2014 post it and see where you stand',
      visual: 'map',
      stats: [
        { label: 'Total meals posted', value: '847', unit: 'all-time', nudge: 'Every meal you post lives in your Cooking History \u2014 a permanent record of what you\'ve made' },
        { label: 'Countries represented', value: '4', unit: '', nudge: 'Your Cuisines Cooked map shows which countries\' food you\'ve actually cooked \u2014 not just eaten, cooked' },
        { label: 'Active weekly cooks', value: '31', unit: '', nudge: 'Your weekly cooking streak puts you in the company of 31 other people who cook consistently \u2014 that\'s the BiteClub core' },
        { label: 'Recipes in the library', value: '200+', unit: '', nudge: 'Search BiteClub recipes by Cuisine, Protein, or Dietary \u2014 find exactly what fits your kitchen tonight' },
        { label: 'Average streak length', value: '5', unit: 'weeks', nudge: 'The streak calendar on your Home feed keeps you honest \u2014 miss a week and it resets' },
        { label: 'Most shared recipe', value: 'Potato Salad', unit: '', nudge: 'Save trending recipes to your Cookbooks and cook them this weekend \u2014 your version might become the next most-shared' },
        { label: 'Cooks who post weekly', value: '40%', unit: '', nudge: 'Post a meal with a star rating and your honest caption \u2014 that\'s what makes the Discovery feed real' },
        { label: 'Favorite stores tagged', value: 'LIDL, ICA, Farmer\'s Market', unit: '', nudge: 'Tag your Favorite Stores on your BiteClub Kitchen profile \u2014 other local cooks will find you through them' },
      ],
    }},

    // ── Food Debates (this_or_that) ───────────────────────────────────────────

    this_or_that_food: { thisOrThat: { theme: 'Food Edition', cta: 'Cook your pick and post it on BiteClub with a rating — let your followers vote with their saves', ctaSub: 'The winning option deserves a pinned recipe on your profile. Make it, post it, pin it.', rounds: [
      { optionA: 'Tacos', optionB: 'Burritos' },
      { optionA: 'Pizza', optionB: 'Pasta' },
      { optionA: 'Sushi', optionB: 'Ramen' },
      { optionA: 'Burger', optionB: 'Hot Dog' },
      { optionA: 'Ice Cream', optionB: 'Cake' },
    ] }},

    unpopular_opinions: { thisOrThat: { theme: 'Unpopular Opinions', cta: 'Post your hot take as a meal on BiteClub — add it to your Cooking History and dare your followers to try it', ctaSub: 'Your followers can comment, save the recipe, and prove you wrong — the Cooking History doesn\'t lie', rounds: [
      { optionA: 'Pineapple on pizza', optionB: 'No pineapple ever' },
      { optionA: 'Ketchup on eggs', optionB: 'Hot sauce on eggs' },
      { optionA: 'Cereal is a soup', optionB: 'Cereal is NOT a soup' },
      { optionA: 'Well-done steak', optionB: 'Medium-rare only' },
      { optionA: 'Mayo on fries', optionB: 'Ketchup on fries' },
    ] }},

    homemade_vs_store: { thisOrThat: { theme: 'Homemade vs Store-Bought', cta: 'Import the homemade recipe to BiteClub from wherever you found it — save it once, cook it forever', ctaSub: 'Pin the best homemade version to your profile — your followers save it and the store-bought version loses a customer', rounds: [
      { optionA: 'Homemade bread', optionB: 'Store bread' },
      { optionA: 'Homemade pasta', optionB: 'Dried pasta' },
      { optionA: 'Fresh salsa', optionB: 'Jar salsa' },
      { optionA: 'Homemade mayo', optionB: 'Hellmann\'s' },
      { optionA: 'Homemade pizza dough', optionB: 'Store-bought dough' },
    ] }},

    cuisine_battle: { thisOrThat: { theme: 'Cuisine Battle', cta: 'Cook your winning cuisine and post it on BiteClub — every cuisine you try adds a new country to your Cuisines Cooked map', ctaSub: 'Save a recipe from the winning cuisine to your cookbook — and follow someone on Discovery who cooks it for real', rounds: [
      { optionA: 'Italian', optionB: 'Mexican' },
      { optionA: 'Thai', optionB: 'Japanese' },
      { optionA: 'Indian', optionB: 'Ethiopian' },
      { optionA: 'French', optionB: 'Chinese' },
      { optionA: 'Korean', optionB: 'Vietnamese' },
    ] }},

    // ── Food Knowledge ────────────────────────────────────────────────────────

    ingredient_science: { stats: {
      title: 'Why Salt Makes Everything Better',
      callout: 'Salt doesn\'t just "add saltiness" — it suppresses bitterness and amplifies sweetness',
      cta: 'Cook something tonight using the real science — post it on BiteClub with your star rating',
      ctaSub: 'Find a recipe in your Discovery feed, season it properly from the start, and share what actually changed',
      stats: [
        { label: 'Salt suppresses bitterness by', value: '80%', unit: '' },
        { label: 'Amplifies sweetness perception', value: '2x', unit: '' },
        { label: 'Releases volatile aromas by', value: '40%', unit: 'more' },
        { label: 'Optimal salting: 1% of food weight', value: '10g', unit: 'per kg' },
        { label: 'Salting pasta water matters', value: 'Yes', unit: 'it seasons from inside' },
        { label: 'Salt draws moisture for better sear', value: '100%', unit: '' },
        { label: 'Types of salt that matter', value: '3', unit: 'kosher, flaky, table' },
        { label: 'Biggest seasoning mistake', value: 'Too late', unit: 'salt early & often' },
      ],
    }},

    seasonal_eating: { stats: {
      title: 'Seasonal Eating is 3x Cheaper and Tastier',
      callout: 'In-season produce wins on every metric: price, taste, nutrition, and sustainability',
      cta: 'Save a seasonal recipe to a "This Season" cookbook on BiteClub before you shop this week',
      ctaSub: 'Follow people in Discovery who cook seasonally — their feed tells you what\'s cheap and good right now better than any app',
      stats: [
        { label: 'Cost savings (in-season vs out)', value: '3x', unit: 'cheaper' },
        { label: 'Taste score improvement', value: '2.5x', unit: 'better rated' },
        { label: 'Nutrient density', value: '45%', unit: 'higher in-season' },
        { label: 'Carbon footprint reduction', value: '60%', unit: 'less transport' },
        { label: 'Spring stars', value: 'Asparagus', unit: 'peas, radishes' },
        { label: 'Summer stars', value: 'Tomatoes', unit: 'berries, corn' },
        { label: 'Autumn stars', value: 'Squash', unit: 'apples, pears' },
        { label: 'Winter stars', value: 'Citrus', unit: 'root veg, kale' },
      ],
    }},

    pantry_power: { stats: {
      title: '10 Pantry Staples = Infinite Meals',
      callout: 'Stock these 10 items and you can always make dinner, no excuses',
      cta: 'Save a "Pantry Only" cookbook on BiteClub and add every recipe you can make without shopping',
      ctaSub: 'Follow people in Discovery who post "made with what I had" meals — their Cooking History is where the real ones live',
      stats: [
        { label: '#1-3: Olive oil, salt, pepper', value: 'The foundation', unit: '' },
        { label: '#4-5: Rice, pasta', value: 'The base', unit: '' },
        { label: '#6-7: Canned tomatoes, beans', value: 'Instant meals', unit: '' },
        { label: '#8-9: Garlic, onions', value: 'Flavour base', unit: '' },
        { label: '#10: Soy sauce', value: 'The secret weapon', unit: '' },
        { label: 'Meals possible with these 10', value: '50+', unit: '' },
        { label: 'Total cost to stock', value: '$25', unit: '' },
        { label: 'Shelf life', value: '6-12', unit: 'months' },
      ],
    }},

    cooking_myths: { stats: {
      title: '5 Cooking Myths That Are Actually Wrong',
      callout: 'Searing doesn\'t "lock in juices" and other lies the internet told you',
      cta: 'Cook using the real science tonight — post it on BiteClub and note the difference in your caption',
      ctaSub: 'Your Cooking History is where technique actually shows — pin the recipe that proves a myth wrong',
      stats: [
        { label: 'Myth: Searing locks in juices', value: 'FALSE', unit: 'it\'s for flavour (Maillard)' },
        { label: 'Myth: Rinse pasta after cooking', value: 'FALSE', unit: 'starch helps sauce stick' },
        { label: 'Myth: Oil in pasta water helps', value: 'FALSE', unit: 'it prevents sauce adhesion' },
        { label: 'Myth: Cold water boils faster', value: 'FALSE', unit: 'hot water boils faster' },
        { label: 'Myth: Alcohol cooks off completely', value: 'FALSE', unit: '5-85% remains' },
        { label: 'Bonus: MSG is bad for you', value: 'FALSE', unit: 'FDA says it\'s safe' },
        { label: 'Sources', value: 'Food Lab', unit: 'Harold McGee, Kenji' },
        { label: 'Knowledge = better cooking', value: 'Always', unit: '' },
      ],
    }},

    fermentation: { stats: {
      title: 'Why Fermented Foods Are a Superpower',
      callout: 'Kimchi, yogurt, sourdough, miso — trillions of probiotics in every bite',
      cta: 'Save a fermentation recipe to your BiteClub cookbook this weekend — kimchi first, then work out from there',
      ctaSub: 'Follow people in Discovery who ferment at home — their Cooking History makes it look far less intimidating than you think',
      stats: [
        { label: 'Probiotics per serving', value: 'Billions', unit: '' },
        { label: 'Gut bacteria diversity increase', value: '40%', unit: '' },
        { label: 'Immune system support', value: '70%', unit: 'of immune cells in gut' },
        { label: 'Nutrient absorption improvement', value: '3x', unit: 'better' },
        { label: 'B-vitamin production', value: '2x', unit: 'more' },
        { label: 'Anti-inflammatory compounds', value: 'Significant', unit: 'multiple studies' },
        { label: 'Shelf life of fermented foods', value: 'Months', unit: 'to years' },
        { label: 'Easy to make at home', value: 'Yes', unit: 'just salt + time' },
      ],
    }},

    protein_guide: { stats: {
      title: 'The Home Cook\'s Protein Guide',
      callout: 'How much protein is actually in the ingredients you already have',
      cta: 'Save a "High Protein" cookbook on BiteClub and find recipes in Discovery that use these exact ingredients',
      ctaSub: 'Follow people who cook for protein — their Cooking History shows what hitting 50-70g actually looks like as real meals',
      stats: [
        { label: 'Chicken breast (100g)', value: '31g', unit: 'protein' },
        { label: 'Eggs (2 large)', value: '12g', unit: 'protein' },
        { label: 'Greek yogurt (170g)', value: '17g', unit: 'protein' },
        { label: 'Lentils (1 cup cooked)', value: '18g', unit: 'protein' },
        { label: 'Salmon (100g)', value: '25g', unit: 'protein' },
        { label: 'Tofu (100g)', value: '17g', unit: 'protein' },
        { label: 'Daily target (average adult)', value: '50-70g', unit: '' },
        { label: 'Easy to hit with home cooking', value: 'Yes', unit: '2-3 meals does it' },
      ],
    }},
  };

  return prefills[presetId] || {};
}

const TEMPLATE_OPTIONS: { id: InfoTemplateStyle; name: string; swatch: string }[] = [
  { id: 'A', name: 'Clean & Modern', swatch: 'bg-gray-50 border-t-4 border-t-red-500' },
  { id: 'B', name: 'Dark & Premium', swatch: 'bg-gray-900 border-l-4 border-l-red-500' },
  { id: 'C', name: 'Warm & Friendly', swatch: 'bg-orange-50 border-b-4 border-b-red-500' },
  { id: 'D', name: 'Bold Editorial', swatch: 'bg-gray-950 border-t-4 border-t-red-500' },
  { id: 'E', name: 'Clean Minimal', swatch: 'bg-stone-50 border-t-2 border-t-stone-900' },
  { id: 'F', name: 'Playful Retro', swatch: 'bg-orange-50 border-t-4 border-t-pink-500' },
];

// Presets that support live PostHog data
const LIVE_DATA_PRESET_IDS = new Set(['growth_numbers', 'week_one_update', 'milestone_hit', 'where_chefs_cook', 'top_cuisines', 'global_kitchen']);

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
            <p className="text-sm text-gray-400">Choose a content type...</p>
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
              placeholder="Search content types..."
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
                No content types found for &ldquo;{search}&rdquo;
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
                          <p className="text-sm font-medium text-gray-900 truncate flex items-center gap-1.5">
                            {preset.label}
                            {LIVE_DATA_PRESET_IDS.has(preset.id) && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200 flex-shrink-0">
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                                </span>
                                LIVE
                              </span>
                            )}
                          </p>
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
              {PRESETS.length} content types across {CATEGORIES.length} categories
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-form components (stats + this-or-that, for power-user editing) ───────

type StatsFormValue = {
  title: string; callout: string; stats: { label: string; value: string; unit: string }[]; cta: string; ctaSub: string;
  visual: 'map' | 'bars' | 'ring' | undefined;
  barData: { label: string; value: number; display?: string }[] | undefined;
  barTitle: string | undefined;
};

function BiteClubStatsForm({
  value,
  onChange,
}: {
  value: StatsFormValue;
  onChange: (v: StatsFormValue) => void;
}) {
  function setStat(i: number, field: 'label' | 'value' | 'unit', text: string) {
    const next = value.stats.map((s, idx) => (idx === i ? { ...s, [field]: text } : s));
    onChange({ ...value, stats: next });
  }
  function addStat() {
    onChange({ ...value, stats: [...value.stats, { label: '', value: '', unit: '' }] });
  }
  function removeStat(i: number) {
    onChange({ ...value, stats: value.stats.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Title</label>
        <input
          type="text"
          value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          placeholder="e.g. BiteClub This Week"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Callout (optional)</label>
        <input
          type="text"
          value={value.callout}
          onChange={(e) => onChange({ ...value, callout: e.target.value })}
          placeholder="e.g. Most popular dish: Chicken Couscous"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-2">
          Stats ({value.stats.length})
        </label>
        <div className="space-y-2">
          {value.stats.map((stat, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="flex-1 grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={stat.label}
                  onChange={(e) => setStat(i, 'label', e.target.value)}
                  placeholder="Label (e.g. Meals cooked)"
                  className="px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                />
                <input
                  type="text"
                  value={stat.value}
                  onChange={(e) => setStat(i, 'value', e.target.value)}
                  placeholder="Value (e.g. 847)"
                  className="px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                />
                <input
                  type="text"
                  value={stat.unit}
                  onChange={(e) => setStat(i, 'unit', e.target.value)}
                  placeholder="Unit (optional)"
                  className="px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                />
              </div>
              {value.stats.length > 1 && (
                <button
                  onClick={() => removeStat(i)}
                  className="w-6 h-6 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors mt-1.5"
                >
                  x
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addStat}
          disabled={value.stats.length >= 8}
          className="mt-2 text-sm text-red-500 hover:text-red-600 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + Add stat
        </button>
      </div>
    </div>
  );
}

function ThisOrThatForm({
  value,
  onChange,
}: {
  value: { theme: string; rounds: { optionA: string; optionB: string }[]; cta: string; ctaSub: string };
  onChange: (v: { theme: string; rounds: { optionA: string; optionB: string }[]; cta: string; ctaSub: string }) => void;
}) {
  function setRound(i: number, field: 'optionA' | 'optionB', text: string) {
    const next = value.rounds.map((r, idx) => (idx === i ? { ...r, [field]: text } : r));
    onChange({ ...value, rounds: next });
  }
  function addRound() {
    onChange({ ...value, rounds: [...value.rounds, { optionA: '', optionB: '' }] });
  }
  function removeRound(i: number) {
    onChange({ ...value, rounds: value.rounds.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Theme (optional)</label>
        <input
          type="text"
          value={value.theme}
          onChange={(e) => onChange({ ...value, theme: e.target.value })}
          placeholder="e.g. Breakfast Edition, Date Night, Comfort Food"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-2">
          Rounds ({value.rounds.length} -- one slide each)
        </label>
        <div className="space-y-3">
          {value.rounds.map((round, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">Round {i + 1}</span>
                {value.rounds.length > 1 && (
                  <button
                    onClick={() => removeRound(i)}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={round.optionA}
                  onChange={(e) => setRound(i, 'optionA', e.target.value)}
                  placeholder="Option A (e.g. Tacos)"
                  className="px-3 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                />
                <input
                  type="text"
                  value={round.optionB}
                  onChange={(e) => setRound(i, 'optionB', e.target.value)}
                  placeholder="Option B (e.g. Burritos)"
                  className="px-3 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                />
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addRound}
          disabled={value.rounds.length >= 8}
          className="mt-2 text-sm text-red-500 hover:text-red-600 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + Add round
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function InfoCarouselPage() {
  const [selectedPreset, setSelectedPreset] = useState<ContentPreset | null>(null);
  const [contentType, setContentType] = useState<InfoContentType>('biteclub_stats');
  const [style, setStyle] = useState<InfoTemplateStyle>('A');
  const [slides, setSlides] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Per-type form state (stats + thisOrThat only)
  const [stats, setStats] = useState({
    title: '',
    callout: '',
    stats: [{ label: '', value: '', unit: '' }],
    cta: '',
    ctaSub: '',
    visual: undefined as 'map' | 'bars' | 'ring' | undefined,
    barData: undefined as { label: string; value: number; display?: string }[] | undefined,
    barTitle: undefined as string | undefined,
  });
  const [thisOrThat, setThisOrThat] = useState({
    theme: '',
    rounds: [{ optionA: '', optionB: '' }],
    cta: '',
    ctaSub: '',
  });

  // Edit data toggle (collapsed by default — zero-input flow)
  const [showEditForm, setShowEditForm] = useState(false);

  // Schedule state
  const [scheduling, setScheduling] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [scheduleCaption, setScheduleCaption] = useState('');

  // PostHog live stats
  const [posthogLoading, setPosthogLoading] = useState(false);
  const [posthogError, setPosthogError] = useState<string | null>(null);
  const [posthogLoaded, setPosthogLoaded] = useState(false);

  async function fetchPosthogStats() {
    setPosthogLoading(true);
    setPosthogError(null);
    setPosthogLoaded(false);
    try {
      const res = await fetch('/api/posthog/stats');
      const data = await res.json();
      if (!res.ok) {
        setPosthogError(data.message || data.error || 'Failed to fetch stats');
        return;
      }
      // Populate the stats form with live data
      setStats({
        title: data.title || stats.title,
        callout: data.callout || stats.callout,
        cta: stats.cta,
        ctaSub: stats.ctaSub,
        visual: stats.visual,
        barData: stats.barData,
        barTitle: stats.barTitle,
        stats: (data.stats || []).map((s: { label: string; value: string; unit?: string }) => ({
          label: s.label,
          value: s.value,
          unit: s.unit || '',
        })),
      });
      setPosthogLoaded(true);
    } catch (e) {
      setPosthogError(e instanceof Error ? e.message : 'Failed to connect');
    } finally {
      setPosthogLoading(false);
    }
  }

  function handlePresetSelect(preset: ContentPreset) {
    setSelectedPreset(preset);
    setContentType(preset.rendersAs);
    setSlides([]);
    setScheduleCaption(preset.label);
    setScheduleSuccess(false);
    setScheduleError(null);
    setShowEditForm(false);
    setPosthogLoaded(false);
    setPosthogError(null);

    // Apply prefill
    const prefill = getPrefill(preset.id);
    if (prefill.stats) setStats({ ...prefill.stats, cta: prefill.stats.cta || '', ctaSub: prefill.stats.ctaSub || '', visual: prefill.stats.visual, barData: prefill.stats.barData, barTitle: prefill.stats.barTitle });
    if (prefill.thisOrThat) setThisOrThat({ ...prefill.thisOrThat, cta: prefill.thisOrThat.cta || '', ctaSub: prefill.thisOrThat.ctaSub || '' });
  }

  function buildPayload() {
    switch (contentType) {
      case 'biteclub_stats':
        return {
          type: 'biteclub_stats' as const,
          title: stats.title,
          callout: stats.callout || undefined,
          cta: stats.cta || undefined,
          ctaSub: stats.ctaSub || undefined,
          visual: stats.visual || undefined,
          barData: stats.barData || undefined,
          barTitle: stats.barTitle || undefined,

          stats: stats.stats
            .filter((s) => s.label.trim() && s.value.trim())
            .map((s) => ({ label: s.label, value: s.value, unit: s.unit || undefined })),
        };
      case 'this_or_that':
        return {
          type: 'this_or_that' as const,
          theme: thisOrThat.theme || undefined,
          cta: thisOrThat.cta || undefined,
          ctaSub: thisOrThat.ctaSub || undefined,
          rounds: thisOrThat.rounds.filter((r) => r.optionA.trim() && r.optionB.trim()),
        };
      default:
        // Fallback for any legacy content types — send as biteclub_stats
        return {
          type: 'biteclub_stats' as const,
          title: stats.title,
          callout: stats.callout || undefined,
          cta: stats.cta || undefined,
          ctaSub: stats.ctaSub || undefined,
          visual: stats.visual || undefined,
          barData: stats.barData || undefined,
          barTitle: stats.barTitle || undefined,

          stats: stats.stats
            .filter((s) => s.label.trim() && s.value.trim())
            .map((s) => ({ label: s.label, value: s.value, unit: s.unit || undefined })),
        };
    }
  }

  function isValid(): boolean {
    switch (contentType) {
      case 'biteclub_stats':
        return stats.title.trim().length > 0 && stats.stats.some((s) => s.label.trim() && s.value.trim());
      case 'this_or_that':
        return thisOrThat.rounds.some((r) => r.optionA.trim() && r.optionB.trim());
      default:
        return stats.title.trim().length > 0 && stats.stats.some((s) => s.label.trim() && s.value.trim());
    }
  }

  async function generate() {
    setGenerating(true);
    setSlides([]);
    setError(null);

    try {
      const payload = buildPayload();
      const res = await fetch('/api/streams/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: payload, style }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Generation failed');
      }
      const data = await res.json();
      setSlides(data.slides);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setGenerating(false);
    }
  }

  function downloadAllSlides() {
    slides.forEach((url, i) => {
      const a = document.createElement('a');
      a.href = url;
      a.download = `biteclub-carousel-slide-${i + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }

  async function handleSendToQueue() {
    if (!selectedPreset || !scheduleCaption.trim()) return;

    setScheduling(true);
    setScheduleError(null);
    setScheduleSuccess(false);

    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dishData: {
            recipeName: selectedPreset.label,
            contentType,
            presetId: selectedPreset.id,
          },
          template: style,
          caption: scheduleCaption,
          scheduledAt: 0,
          slideUrls: slides,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add to queue');
      }

      setScheduleSuccess(true);
    } catch (e) {
      setScheduleError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setScheduling(false);
    }
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
          <span className="text-gray-700 font-medium">BiteClub Content</span>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left panel */}
          <div className="col-span-5 space-y-5">
            {/* Step 1: Content type dropdown */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                  1
                </span>
                Choose Content Type
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
                  <span className="text-[10px] text-gray-400">
                    {stats.stats.filter(s => s.label.trim() && s.value.trim()).length || thisOrThat.rounds.filter(r => r.optionA.trim() && r.optionB.trim()).length} data points loaded
                  </span>
                </div>
              )}

              {/* PostHog button for BiteClub Live category */}
              {selectedPreset?.category === 'data' && (
                <div className="mt-3">
                  <button
                    onClick={fetchPosthogStats}
                    disabled={posthogLoading}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      posthogLoaded
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-cyan-50 border border-cyan-200 text-cyan-700 hover:bg-cyan-100'
                    }`}
                  >
                    {posthogLoading ? (
                      <>
                        <span className="animate-spin w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-600 rounded-full" />
                        Pulling stats...
                      </>
                    ) : posthogLoaded ? (
                      <>
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                        </span>
                        Live data loaded &mdash; pull again to refresh
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        Fetch Live Stats from PostHog
                      </>
                    )}
                  </button>
                  {posthogError && (
                    <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      PostHog not available &mdash; using static fallback data. {posthogError}
                    </p>
                  )}
                </div>
              )}

              {/* Edit data toggle */}
              {selectedPreset && (
                <button
                  onClick={() => setShowEditForm(!showEditForm)}
                  className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showEditForm ? 'Hide editor' : 'Edit data'} &rarr;
                </button>
              )}

              {/* Collapsible edit form */}
              {selectedPreset && showEditForm && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {contentType === 'this_or_that' ? (
                    <ThisOrThatForm value={thisOrThat} onChange={setThisOrThat} />
                  ) : (
                    <BiteClubStatsForm value={stats} onChange={setStats} />
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Template */}
            {selectedPreset && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  Pick a Template
                </h2>
                <div className="grid grid-cols-3 gap-2">
                  {TEMPLATE_OPTIONS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setStyle(t.id)}
                      className={`p-2.5 rounded-xl border-2 transition-all text-left ${
                        style === t.id
                          ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-full h-8 rounded-lg mb-2 ${t.swatch}`} />
                      <p className="text-xs font-semibold text-gray-900 leading-tight">{t.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Generate button */}
            {selectedPreset && (
              <button
                onClick={generate}
                disabled={!isValid() || generating}
                className="w-full px-4 py-3.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {generating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    Generating slides...
                  </span>
                ) : (
                  'Generate Carousel'
                )}
              </button>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* Right panel: Preview */}
          <div className="col-span-7 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                  {selectedPreset ? '3' : '2'}
                </span>
                Preview
              </h2>
              {!selectedPreset ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="text-5xl mb-4">{'\u{1F446}'}</div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Pick a content type to get started</p>
                  <p className="text-xs text-gray-400">
                    {PRESETS.length} presets across {CATEGORIES.length} categories -- from health stats to food debates
                  </p>
                </div>
              ) : (
                <CarouselPreview slides={slides} loading={generating} />
              )}
            </div>

            {/* Download section */}
            {slides.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Download Slides</h3>
                <div className="flex flex-wrap gap-2">
                  {slides.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      download={`biteclub-carousel-slide-${i + 1}.jpg`}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors"
                    >
                      Slide {i + 1}
                    </a>
                  ))}
                  <button
                    onClick={downloadAllSlides}
                    className="px-3 py-1.5 bg-gray-900 hover:bg-gray-700 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    Download All
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  {slides.length} slides at 1080x1440px, platform-ready.
                </p>
              </div>
            )}

            {/* Send to Queue section */}
            {slides.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Send to Queue</h3>

                <div className="space-y-4">
                  {/* Caption / title */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Caption / Title</label>
                    <input
                      type="text"
                      value={scheduleCaption}
                      onChange={(e) => setScheduleCaption(e.target.value)}
                      placeholder="Post caption or title..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                    />
                  </div>

                  {/* Send to Queue button */}
                  <button
                    onClick={handleSendToQueue}
                    disabled={scheduling || !scheduleCaption.trim()}
                    className="w-full px-4 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {scheduling ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                        Adding...
                      </span>
                    ) : (
                      'Send to Queue'
                    )}
                  </button>

                  {/* Success message */}
                  {scheduleSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                      Added to queue!{' '}
                      <Link href="/schedule" className="underline font-medium hover:text-green-800">
                        View schedule
                      </Link>
                    </div>
                  )}

                  {/* Error message */}
                  {scheduleError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                      {scheduleError}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
