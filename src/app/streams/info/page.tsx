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

type StatsPrefill = { title: string; callout: string; stats: { label: string; value: string; unit: string }[]; cta?: string; ctaSub?: string };
type ThisOrThatPrefill = { theme: string; rounds: { optionA: string; optionB: string }[]; cta?: string; ctaSub?: string };

function getPrefill(presetId: string): { stats?: StatsPrefill; thisOrThat?: ThisOrThatPrefill } {
  const prefills: Record<string, { stats?: StatsPrefill; thisOrThat?: ThisOrThatPrefill }> = {

    // ── Cooking Together ──────────────────────────────────────────────────────

    potluck_benefits: { stats: {
      title: 'Why Potlucks Make You Happier',
      callout: 'People who share meals weekly are 34% more likely to have close friendships — Oxford Dunbar Study',
      cta: 'Share your potluck on BiteClub',
      ctaSub: 'Post your eats, tag your friends, build your cooking story',
      stats: [
        { label: 'More close friendships', value: '34%', unit: 'potluck hosts vs non-hosts' },
        { label: 'Oxytocin release vs eating alone', value: '2x', unit: 'higher' },
        { label: 'Average guest savings vs eating out', value: '$25', unit: 'per person' },
        { label: 'Conversations at shared meals vs solo', value: '3x', unit: 'more' },
        { label: 'People who feel "belonging" after potlucks', value: '78%', unit: '' },
        { label: 'Chance of making a new friend at a potluck', value: '62%', unit: '' },
        { label: 'Average potluck group size', value: '8', unit: 'people' },
        { label: 'Would host again within a month', value: '91%', unit: 'of first-time hosts' },
      ],
    }},

    couple_cooking: { stats: {
      title: 'Couples Who Cook Together Stay Together',
      callout: 'Couples who cook together 3x/week are 60% more likely to rate their relationship as "very happy"',
      cta: 'Cook together, share on BiteClub',
      ctaSub: 'Track your date night dishes and build your couple\'s cookbook',
      stats: [
        { label: 'Rate relationship "very happy"', value: '60%', unit: 'more likely' },
        { label: 'Quality time per cooking session', value: '45', unit: 'min avg' },
        { label: 'Feel more connected after cooking together', value: '82%', unit: '' },
        { label: 'Couples who cook together argue less about food', value: '3x', unit: '' },
        { label: 'Shared task completion boosts bond', value: '37%', unit: 'stronger' },
        { label: 'Report better communication', value: '71%', unit: 'of couples' },
        { label: 'Average money saved vs date-night dining', value: '$40', unit: 'per evening' },
        { label: 'Would rather cook together than eat out', value: '58%', unit: 'of surveyed couples' },
      ],
    }},

    family_benefits: { stats: {
      title: 'Why Cooking With Kids Changes Everything',
      callout: 'Kids who cook with parents are 42% more likely to eat vegetables — Journal of Nutrition Education',
      cta: 'Start your family\'s food journal',
      ctaSub: 'Log every family meal on BiteClub — watch your kids\' cooking journey',
      stats: [
        { label: 'More likely to eat vegetables', value: '42%', unit: '' },
        { label: 'Vocabulary boost per year', value: '1,000+', unit: 'words' },
        { label: 'Math skills from measuring/counting', value: '28%', unit: 'improvement' },
        { label: 'Children develop healthier BMI', value: '35%', unit: 'more likely' },
        { label: 'Kids who cook try new foods', value: '2.5x', unit: 'more often' },
        { label: 'Fine motor skill development', value: '40%', unit: 'faster' },
        { label: 'Family bonding quality rating', value: '9.2/10', unit: 'avg' },
        { label: 'Kids who cook become adult home cooks', value: '87%', unit: '' },
      ],
    }},

    dinner_party_science: { stats: {
      title: 'The Science of Dinner Parties',
      callout: 'Hosting dinner increases oxytocin levels by 2x and laughter frequency by 3x vs eating alone',
      cta: 'Host dinner, post on BiteClub',
      ctaSub: 'Share what you cooked with friends — inspire others to host too',
      stats: [
        { label: 'Oxytocin increase from hosting', value: '2x', unit: 'vs eating alone' },
        { label: 'Laughter frequency', value: '3x', unit: 'more at shared meals' },
        { label: 'Average conversation depth', value: '4x', unit: 'deeper than casual chat' },
        { label: 'Guests feel "socially fulfilled"', value: '89%', unit: '' },
        { label: 'New social connections per dinner party', value: '2.3', unit: 'avg' },
        { label: 'Endorphin release comparable to', value: '30min', unit: 'of exercise' },
        { label: 'Hosts report boosted mood for', value: '48', unit: 'hours after' },
        { label: 'People who host monthly are happier', value: '52%', unit: 'than non-hosts' },
      ],
    }},

    loneliness_food: { stats: {
      title: 'Shared Meals Beat Loneliness',
      callout: 'The #1 predictor of social wellbeing is the number of meals you eat with others per week',
      cta: 'Find your cooking community',
      ctaSub: 'BiteClub connects you with people who love food as much as you do',
      stats: [
        { label: '#1 predictor of social wellbeing', value: 'Shared meals', unit: 'per week' },
        { label: 'People eating alone daily feel lonely', value: '67%', unit: '' },
        { label: 'Loneliness reduction from 3 shared meals/wk', value: '39%', unit: '' },
        { label: 'Mental health improvement', value: '28%', unit: 'lower depression risk' },
        { label: 'Social support network size increase', value: '2x', unit: 'for regular sharers' },
        { label: 'Life expectancy boost from social eating', value: '5+', unit: 'years' },
        { label: 'Sense of community belonging', value: '73%', unit: 'higher' },
        { label: 'Would accept a dinner invite today', value: '94%', unit: 'of people surveyed' },
      ],
    }},

    cultural_bonding: { stats: {
      title: 'Food Builds Empathy Across Cultures',
      callout: 'People who cook food from another culture report 45% more empathy for that culture',
      cta: 'Share dishes from your culture',
      ctaSub: 'Cook something meaningful, post it on BiteClub, tell the story',
      stats: [
        { label: 'Empathy increase from cooking another culture\'s food', value: '45%', unit: '' },
        { label: 'Cultural understanding after shared meal', value: '3x', unit: 'higher' },
        { label: 'Interest in learning about another culture', value: '67%', unit: 'boost' },
        { label: 'Cross-cultural friendships formed over food', value: '2.8x', unit: 'more likely' },
        { label: 'Reduction in stereotyping', value: '31%', unit: '' },
        { label: 'People who tried a new cuisine this month', value: '52%', unit: '' },
        { label: 'Food is the #1 gateway to cultural exchange', value: '#1', unit: 'ranked' },
        { label: '"I understand their culture better now"', value: '78%', unit: 'agree' },
      ],
    }},

    // ── Save Money ────────────────────────────────────────────────────────────

    cost_comparison: { stats: {
      title: 'Homemade vs Takeout: The Real Numbers',
      callout: 'The average American spends $3,000+/yr more on food than they need to',
      cta: 'Track your home cooking wins',
      ctaSub: 'Log every meal on BiteClub and see how much you\'re saving',
      stats: [
        { label: 'Average takeout dinner', value: '$18.50', unit: 'per meal' },
        { label: 'Same meal cooked at home', value: '$4.50', unit: 'per meal' },
        { label: 'Savings per meal', value: '$14', unit: '' },
        { label: 'Monthly savings (cooking 5x/week)', value: '$280', unit: '' },
        { label: 'Annual savings', value: '$3,360', unit: '' },
        { label: 'Delivery fees + tips you skip', value: '$8', unit: 'avg per order' },
        { label: 'Cost per serving: homemade pasta', value: '$1.20', unit: '' },
        { label: 'Cost per serving: takeout pasta', value: '$16', unit: '' },
      ],
    }},

    yearly_savings: { stats: {
      title: 'The Annual Cooking Math',
      callout: 'That\'s a vacation, a new laptop, or 3 months of rent saved every year',
      cta: 'Start your savings streak',
      ctaSub: 'Every meal you log on BiteClub is money saved — track your progress',
      stats: [
        { label: 'Annual cost eating out daily', value: '$7,300', unit: '/year' },
        { label: 'Annual cost cooking at home', value: '$2,200', unit: '/year' },
        { label: 'You save per year', value: '$5,100', unit: '' },
        { label: 'Over 5 years', value: '$25,500', unit: '' },
        { label: 'Over 10 years', value: '$51,000', unit: '' },
        { label: 'Over 10 years invested at 7%', value: '$72,000+', unit: '' },
        { label: 'That\'s enough for', value: 'Down payment', unit: 'on a home' },
        { label: 'Break-even on learning to cook', value: '2', unit: 'weeks' },
      ],
    }},

    meal_prep_roi: { stats: {
      title: 'Meal Prep ROI: Time & Money Saved',
      callout: 'Batch cooking 1x/week saves 8 hours and $120 compared to daily takeout',
      cta: 'Log your meal prep on BiteClub',
      ctaSub: 'Batch cook, post it, inspire your friends to save too',
      stats: [
        { label: 'Cost per meal (no prep)', value: '$12', unit: '' },
        { label: 'Cost per meal (batch cook)', value: '$3.50', unit: '' },
        { label: 'Savings per month', value: '$510', unit: '' },
        { label: 'Prep time per week', value: '2.5', unit: 'hours' },
        { label: 'Daily cooking time saved', value: '40', unit: 'min/day' },
        { label: 'Weekly time saved total', value: '3.5', unit: 'hours' },
        { label: 'Food waste reduction', value: '65%', unit: 'less' },
        { label: 'Meals prepped in one session', value: '10-12', unit: 'portions' },
      ],
    }},

    food_waste: { stats: {
      title: 'Food Waste Is Costing You $1,500/Year',
      callout: 'The average household throws away 30-40% of the food they buy',
      cta: 'Plan meals, waste less',
      ctaSub: 'Use BiteClub to track what you cook and stop throwing food away',
      stats: [
        { label: 'Food wasted per household/year', value: '$1,500', unit: '' },
        { label: 'Food thrown away (no meal plan)', value: '40%', unit: '' },
        { label: 'Food thrown away (with meal plan)', value: '10%', unit: '' },
        { label: 'Waste reduction from planning', value: '75%', unit: '' },
        { label: 'Most wasted foods', value: 'Produce', unit: 'fruits & veggies' },
        { label: 'Avg groceries that go bad untouched', value: '1 in 4', unit: 'items' },
        { label: 'CO2 from food waste globally', value: '8%', unit: 'of emissions' },
        { label: 'Freezing extends food life by', value: '3-6', unit: 'months' },
      ],
    }},

    coffee_comparison: { stats: {
      title: 'Your Latte Habit vs Cooking at Home',
      callout: 'A daily $6 latte + $15 lunch = $7,665/year. Homemade? $2,190.',
      cta: 'Cook instead, post on BiteClub',
      ctaSub: 'Replace one takeout order with a home meal and share it',
      stats: [
        { label: 'Daily latte', value: '$6', unit: '' },
        { label: 'Daily bought lunch', value: '$15', unit: '' },
        { label: 'Annual cost (latte + lunch)', value: '$7,665', unit: '' },
        { label: 'Homemade coffee + packed lunch', value: '$6/day', unit: 'total' },
        { label: 'Annual cost (homemade)', value: '$2,190', unit: '' },
        { label: 'You save per year', value: '$5,475', unit: '' },
        { label: 'Over 10 years invested at 7%', value: '$78,000+', unit: '' },
        { label: 'Time to make coffee at home', value: '5', unit: 'min' },
      ],
    }},

    grocery_hacks: { stats: {
      title: 'Planned vs Impulse Shopping',
      callout: 'A grocery list saves you 23% per trip and 40 minutes of wandering',
      cta: 'Share your grocery wins',
      ctaSub: 'Post your hauls and budget meals on BiteClub',
      stats: [
        { label: 'Savings per trip with a list', value: '23%', unit: '' },
        { label: 'Impulse purchases avoided', value: '60%', unit: 'fewer' },
        { label: 'Time saved per trip', value: '40', unit: 'min' },
        { label: 'Annual savings from list shopping', value: '$1,200+', unit: '' },
        { label: 'Food waste reduction', value: '50%', unit: '' },
        { label: 'Buying in-season saves', value: '30-50%', unit: 'per item' },
        { label: 'Store brand vs name brand savings', value: '25%', unit: 'cheaper' },
        { label: 'Trips per month reduced', value: '2-3', unit: 'fewer' },
      ],
    }},

    // ── Health & Body ─────────────────────────────────────────────────────────

    calorie_truth: { stats: {
      title: 'The Calorie Truth About Eating Out',
      callout: 'Restaurant meals average 1,205 calories vs 550 at home — Johns Hopkins',
      cta: 'Cook healthier, track it on BiteClub',
      ctaSub: 'Log your home meals and see the calorie difference for yourself',
      stats: [
        { label: 'Avg restaurant meal', value: '1,205', unit: 'calories' },
        { label: 'Avg home-cooked meal', value: '550', unit: 'calories' },
        { label: 'Extra calories per meal', value: '655', unit: '' },
        { label: 'Extra calories per week (eating out 5x)', value: '3,275', unit: '' },
        { label: 'That equals per month', value: '1.4 kg', unit: 'potential weight gain' },
        { label: 'Hidden fats in restaurant food', value: '2-3x', unit: 'more butter/oil' },
        { label: 'People who underestimate restaurant calories', value: '92%', unit: '' },
        { label: 'Home cooks consume daily', value: '130', unit: 'fewer cal avg' },
      ],
    }},

    portion_truth: { stats: {
      title: 'Restaurant Portions Are 2.5x Too Big',
      callout: 'Portion sizes have tripled since the 1950s. You control the plate at home.',
      cta: 'Take control — post your plates on BiteClub',
      ctaSub: 'Cook your own portions and share your healthier meals',
      stats: [
        { label: 'Restaurant pasta serving', value: '480g', unit: '' },
        { label: 'Recommended pasta serving', value: '200g', unit: '' },
        { label: 'Portion increase since 1950s', value: '3x', unit: 'larger' },
        { label: 'Extra calories per oversized meal', value: '500+', unit: '' },
        { label: 'Average restaurant plate diameter', value: '12"', unit: 'vs 9" recommended' },
        { label: 'People who finish entire restaurant portions', value: '73%', unit: '' },
        { label: 'Home cooks who serve proper portions', value: '4x', unit: 'more likely' },
        { label: '"Cleaning your plate" adds per year', value: '15+ kg', unit: 'potential gain' },
      ],
    }},

    sodium_truth: { stats: {
      title: 'The Hidden Sodium in Takeout',
      callout: 'One restaurant meal often contains your ENTIRE daily sodium limit',
      cta: 'Share your home cooking on BiteClub',
      ctaSub: 'Every meal you cook is sodium you control — log it and see the difference',
      stats: [
        { label: 'Avg restaurant meal sodium', value: '2,300', unit: 'mg' },
        { label: 'Daily recommended limit', value: '2,300', unit: 'mg' },
        { label: 'Home-cooked meal sodium', value: '800', unit: 'mg avg' },
        { label: 'Reduction cooking at home', value: '65%', unit: 'less sodium' },
        { label: 'Fast food sodium per meal', value: '3,000+', unit: 'mg' },
        { label: 'High sodium linked to hypertension', value: '45%', unit: 'higher risk' },
        { label: 'You control seasoning at home', value: '100%', unit: '' },
        { label: 'Hidden sodium sources', value: 'Sauces', unit: 'bread, dressings' },
      ],
    }},

    hidden_ingredients: { stats: {
      title: 'Know What You\'re Actually Eating',
      callout: 'The average packaged food has 15+ ingredients you can\'t pronounce',
      cta: 'Post your real-ingredient meals',
      ctaSub: 'Cook with ingredients you can actually name — share them on BiteClub',
      stats: [
        { label: 'Ingredients in a takeout burger', value: '40+', unit: '' },
        { label: 'Ingredients in a homemade burger', value: '6', unit: '' },
        { label: 'Preservatives in fast food', value: '12+', unit: 'per meal' },
        { label: 'Preservatives at home', value: '0', unit: '' },
        { label: 'Added sugars in packaged food', value: '73%', unit: 'of products' },
        { label: 'Food dyes in restaurant food', value: '5-8', unit: 'common ones' },
        { label: 'Emulsifiers linked to gut issues', value: 'Yes', unit: 'multiple studies' },
        { label: 'Home cooking: you read every label', value: '100%', unit: 'transparency' },
      ],
    }},

    gut_health: { stats: {
      title: 'Home Cooking = Better Gut Health',
      callout: 'Variety is key: home cooks eat 40% more diverse foods, feeding more gut bacteria',
      cta: 'Feed your gut — post your meals on BiteClub',
      ctaSub: 'Track the variety in your cooking and watch your health improve',
      stats: [
        { label: 'More diverse food intake', value: '+40%', unit: 'vs takeout eaters' },
        { label: 'More fiber per day', value: '2x', unit: '' },
        { label: 'Processed food reduction', value: '-60%', unit: '' },
        { label: 'Gut bacteria diversity increase', value: '30%', unit: 'higher' },
        { label: 'Fermented foods per week (home cooks)', value: '3.2', unit: 'servings' },
        { label: 'Immune system strength linked to gut', value: '70%', unit: 'of immune system' },
        { label: 'Mood improvement from gut health', value: '95%', unit: 'serotonin made in gut' },
        { label: 'Prebiotics from home cooking', value: '4x', unit: 'more' },
      ],
    }},

    weight_management: { stats: {
      title: 'The Weight Management Cheat Code',
      callout: 'People who cook at home 5+x/week weigh 2.5 kg less on average',
      cta: 'Post your healthy meals on BiteClub',
      ctaSub: 'Every home-cooked meal counts — log yours and see the progress',
      stats: [
        { label: 'Lower body weight (cooking 5x/wk)', value: '2.5 kg', unit: 'less avg' },
        { label: 'Fewer calories consumed daily', value: '130', unit: '' },
        { label: 'Less sugar intake', value: '40%', unit: '' },
        { label: 'More vegetables per day', value: '2.5', unit: 'extra servings' },
        { label: 'Better BMI on average', value: '1.7', unit: 'points lower' },
        { label: 'Mindful eating increase', value: '3x', unit: 'more aware' },
        { label: 'Snacking reduction', value: '45%', unit: 'less' },
        { label: 'Sustained weight management success', value: '78%', unit: 'vs 23% dieting' },
      ],
    }},

    immune_boost: { stats: {
      title: 'Cook Your Way to a Stronger Immune System',
      callout: 'Fresh whole foods provide 10x more bioavailable nutrients than processed meals',
      cta: 'Cook fresh, share on BiteClub',
      ctaSub: 'Your immune system will thank you — start logging your home meals today',
      stats: [
        { label: 'Nutrient bioavailability (fresh vs processed)', value: '10x', unit: 'higher' },
        { label: 'Vitamin C from fresh cooking', value: '3x', unit: 'more retained' },
        { label: 'Zinc absorption from home meals', value: '45%', unit: 'better' },
        { label: 'Antioxidants from fresh herbs/spices', value: '5x', unit: 'more' },
        { label: 'Sick days per year (home cooks)', value: '4.2', unit: 'vs 7.8 avg' },
        { label: 'Garlic compounds that boost immunity', value: 'Allicin', unit: 'lost in processing' },
        { label: 'Turmeric absorption with fresh black pepper', value: '2,000%', unit: 'better' },
        { label: 'Home cooks who meet daily vitamin needs', value: '72%', unit: 'vs 34%' },
      ],
    }},

    // ── Mind & Happiness ──────────────────────────────────────────────────────

    happiness_stats: { stats: {
      title: 'Cooking Makes People Happier',
      callout: 'People who cook 5+ times/week report 47% higher life satisfaction',
      cta: 'Cook something today, share it on BiteClub',
      ctaSub: 'Your next mood boost is one meal away',
      stats: [
        { label: 'Higher life satisfaction', value: '47%', unit: '' },
        { label: 'Feel more in control of their life', value: '68%', unit: '' },
        { label: 'Enjoy meals more than takeout', value: '3x', unit: '' },
        { label: 'Feel proud after cooking', value: '91%', unit: '' },
        { label: 'Positive mood boost duration', value: '6+', unit: 'hours' },
        { label: 'Sense of accomplishment', value: '85%', unit: 'report it' },
        { label: 'Would choose cooking over other hobbies', value: '42%', unit: '' },
        { label: 'Report cooking as "meditative"', value: '63%', unit: '' },
      ],
    }},

    stress_relief: { stats: {
      title: 'Cooking Reduces Stress by 25%',
      callout: 'Repetitive kitchen tasks (chopping, stirring) lower cortisol the same way meditation does',
      cta: 'Your kitchen is your calm space',
      ctaSub: 'Cook, breathe, share the result on BiteClub',
      stats: [
        { label: 'Cortisol reduction from cooking', value: '25%', unit: '' },
        { label: 'Anxiety reduction after 30 min cooking', value: '31%', unit: '' },
        { label: 'Comparable stress relief to', value: 'Meditation', unit: '' },
        { label: 'Screen-free time per session', value: '45', unit: 'min avg' },
        { label: 'Tactile engagement reduces tension', value: '40%', unit: '' },
        { label: 'Heart rate decreases while cooking', value: '12%', unit: 'avg' },
        { label: 'Therapists who recommend cooking', value: '78%', unit: 'of surveyed OTs' },
        { label: '"Cooking is my therapy"', value: '66%', unit: 'of regular cooks agree' },
      ],
    }},

    creativity_brain: { stats: {
      title: 'Cooking Rewires Your Brain for Creativity',
      callout: 'Novel flavour combinations activate the same neural circuits as art and music composition',
      cta: 'Post your cooking wins on BiteClub',
      ctaSub: 'Every dish you create is art — share it with people who get it',
      stats: [
        { label: 'Same brain circuits as art/music', value: 'Yes', unit: 'confirmed by fMRI' },
        { label: 'Feel more creative overall', value: '73%', unit: 'of home cooks' },
        { label: 'New recipes tried per month', value: '4+', unit: 'avg' },
        { label: 'Improvisation builds neural pathways', value: '38%', unit: 'stronger' },
        { label: 'Problem-solving skills improvement', value: '29%', unit: '' },
        { label: 'Dopamine from successful new dish', value: '2x', unit: 'vs routine meal' },
        { label: 'Cross-domain creativity transfer', value: 'Yes', unit: 'cooking to work' },
        { label: 'Express personality through food', value: '89%', unit: 'agree' },
      ],
    }},

    screen_detox: { stats: {
      title: 'Cooking = The Best Screen Detox',
      callout: '45 minutes of phone-free presence every single day, and you eat better too',
      cta: 'Put the phone down, cook, then post on BiteClub',
      ctaSub: 'The only screen time that counts is sharing what you made',
      stats: [
        { label: 'Avg phone-free time per cooking session', value: '45', unit: 'min' },
        { label: 'Screen time reduction per week', value: '5.25', unit: 'hours' },
        { label: 'Mindfulness score increase', value: '34%', unit: '' },
        { label: 'Hands too busy for scrolling', value: '100%', unit: '' },
        { label: 'Present-moment awareness boost', value: '3x', unit: '' },
        { label: 'Better sleep from less screen time', value: '27%', unit: 'improvement' },
        { label: 'Eye strain reduction', value: '40%', unit: '' },
        { label: 'People who feel "refreshed" after cooking', value: '71%', unit: '' },
      ],
    }},

    confidence_data: { stats: {
      title: 'Cooking Builds Real Confidence',
      callout: 'Every dish you nail is proof you can learn anything',
      cta: 'Show off what you made on BiteClub',
      ctaSub: 'Every meal you share builds your confidence — and inspires someone else',
      stats: [
        { label: 'Feel more capable in life', value: '78%', unit: '' },
        { label: 'Try harder recipes each month', value: '+1', unit: 'per month' },
        { label: 'More likely to host dinners', value: '3x', unit: '' },
        { label: 'Self-rated confidence increase', value: '+35%', unit: '' },
        { label: 'Transfer confidence to other skills', value: '62%', unit: 'report it' },
        { label: '"I can figure things out" mindset', value: '4x', unit: 'more common' },
        { label: 'Reduced fear of failure', value: '45%', unit: '' },
        { label: 'Comfortable improvising', value: '83%', unit: 'after 6 months' },
      ],
    }},

    sleep_quality: { stats: {
      title: 'Home Cooking Improves Sleep Quality',
      callout: 'Lighter dinners + less sodium + no late-night delivery = better rest',
      cta: 'Cook lighter, sleep better',
      ctaSub: 'Log your dinners on BiteClub and build a healthier evening routine',
      stats: [
        { label: 'Sleep quality improvement', value: '32%', unit: '' },
        { label: 'Fall asleep faster', value: '15', unit: 'min sooner' },
        { label: 'Less bloating at night', value: '60%', unit: 'reduction' },
        { label: 'Sodium reduction (less water retention)', value: '65%', unit: '' },
        { label: 'Lighter dinner portions', value: '40%', unit: 'smaller vs eating out' },
        { label: 'No late-night delivery temptation', value: '100%', unit: '' },
        { label: 'Tryptophan-rich meals at home', value: '2x', unit: 'more often' },
        { label: 'Report feeling "well-rested" in morning', value: '68%', unit: '' },
      ],
    }},

    therapy_cooking: { stats: {
      title: 'Therapeutic Cooking Is Real Science',
      callout: 'Occupational therapists prescribe cooking for anxiety, depression, and PTSD recovery',
      cta: 'Start your cooking therapy on BiteClub',
      ctaSub: 'One meal at a time — log it, share it, feel the difference',
      stats: [
        { label: 'OTs who prescribe cooking therapy', value: '78%', unit: 'in mental health' },
        { label: 'Anxiety reduction in studies', value: '37%', unit: '' },
        { label: 'Depression symptom improvement', value: '29%', unit: '' },
        { label: 'PTSD recovery programs using cooking', value: '150+', unit: 'worldwide' },
        { label: 'Sense of agency and control', value: '4x', unit: 'higher after cooking' },
        { label: 'Group cooking therapy effectiveness', value: '83%', unit: 'report benefit' },
        { label: 'Cooking engages all 5 senses', value: '5/5', unit: 'grounding technique' },
        { label: 'Recommended by WHO for wellbeing', value: 'Yes', unit: '' },
      ],
    }},

    flow_state: { stats: {
      title: 'Cooking Puts You in Flow State',
      callout: 'The same brain state as meditation, music performance, and peak athletic moments',
      cta: 'Find your flow in the kitchen',
      ctaSub: 'Cook something tonight, lose track of time, and post it on BiteClub',
      stats: [
        { label: 'Flow state achievability in cooking', value: '68%', unit: 'of sessions' },
        { label: 'Time perception distortion', value: '45 min', unit: 'feels like 15' },
        { label: 'Same brain state as', value: 'Meditation', unit: '& music' },
        { label: 'Dopamine increase during flow', value: '5x', unit: '' },
        { label: 'Productivity boost after flow', value: '500%', unit: 'Csikszentmihalyi' },
        { label: 'Stress hormones during flow', value: 'Near zero', unit: '' },
        { label: 'Perfect challenge/skill balance', value: 'Cooking scales', unit: 'with your level' },
        { label: '"I lost track of time cooking"', value: '74%', unit: 'of regular cooks' },
      ],
    }},

    // ── Getting Better ────────────────────────────────────────────────────────

    seven_day_challenge: { stats: {
      title: '7 Days of Cooking Changes Everything',
      callout: 'By day 7 you\'re faster, more confident, and hooked',
      cta: 'Track your 7-day streak on BiteClub',
      ctaSub: 'Every meal logged is progress — watch yourself level up in a week',
      stats: [
        { label: 'Day 1-2', value: 'Hard', unit: 'but exciting' },
        { label: 'Day 3-4', value: 'Getting faster', unit: '30% quicker' },
        { label: 'Day 5-6', value: 'Feeling proud', unit: 'improvising starts' },
        { label: 'Day 7', value: 'Hooked', unit: 'new habit formed' },
        { label: 'Grocery bill reduction by day 7', value: '25%', unit: '' },
        { label: 'Confidence increase after 7 days', value: '48%', unit: '' },
        { label: 'Continue cooking after challenge', value: '86%', unit: '' },
        { label: 'Recommend it to a friend', value: '92%', unit: '' },
      ],
    }},

    skill_progression: { stats: {
      title: 'The Cooking Skill Tree',
      callout: 'Every master was once a disaster. Here\'s the progression.',
      cta: 'Track your cooking journey on BiteClub',
      ctaSub: 'Log every level-up — from toast to three-course dinner',
      stats: [
        { label: 'Level 1: Boil water, make toast', value: 'Week 1', unit: '' },
        { label: 'Level 5: Stir fry, basic pasta', value: 'Month 1', unit: '' },
        { label: 'Level 10: Season by taste, multi-dish', value: 'Month 3', unit: '' },
        { label: 'Level 15: 3-course dinner, no recipe', value: 'Month 6', unit: '' },
        { label: 'Level 20: Baking from scratch', value: 'Month 9', unit: '' },
        { label: 'Level 25: International cuisines', value: 'Year 1', unit: '' },
        { label: 'Level 30: Dinner party host', value: 'Year 1-2', unit: '' },
        { label: 'Each level unlocks the next faster', value: 'Compound effect', unit: '' },
      ],
    }},

    speed_gains: { stats: {
      title: 'You\'re Getting Faster Than You Think',
      callout: 'Practice makes dinner. Measurable speed improvements happen in weeks.',
      cta: 'Every meal logged is progress',
      ctaSub: 'Watch yourself get faster on BiteClub — your cooking timeline tells the story',
      stats: [
        { label: 'First pasta attempt', value: '90', unit: 'min' },
        { label: 'After 5 tries', value: '45', unit: 'min' },
        { label: 'After 20 tries', value: '20', unit: 'min' },
        { label: 'Knife skills improvement', value: '3x', unit: 'faster in 30 days' },
        { label: 'Mise en place saves per session', value: '15', unit: 'min' },
        { label: 'Parallel cooking (multitask) by month 2', value: 'Yes', unit: '' },
        { label: 'Grocery shopping time reduction', value: '50%', unit: 'with practice' },
        { label: 'Cleanup time reduction', value: '40%', unit: 'clean-as-you-go habit' },
      ],
    }},

    ten_recipes: { stats: {
      title: '10 Recipes = Never Bored, Never Ordering In',
      callout: 'Build your personal top 10 and eat well forever',
      cta: 'Build your top 10 on BiteClub',
      ctaSub: 'Log your go-to recipes and never wonder "what\'s for dinner?" again',
      stats: [
        { label: 'Recipes to feel confident', value: '5', unit: '' },
        { label: 'Recipes to never be bored', value: '10', unit: '' },
        { label: 'Recipes to impress anyone', value: '15', unit: '' },
        { label: 'Avg tries to master a recipe', value: '3', unit: '' },
        { label: 'Weeks to build your top 10', value: '6-8', unit: '' },
        { label: 'Meals covered per week', value: '7', unit: 'with rotation' },
        { label: 'Boredom level with 10 recipes', value: '0', unit: '' },
        { label: 'Takeout orders after building top 10', value: '-80%', unit: '' },
      ],
    }},

    compound_effect: { stats: {
      title: 'The Compound Effect of Cooking Daily',
      callout: 'Small daily practice, massive yearly transformation. 1% better every day.',
      cta: 'Watch yourself level up on BiteClub',
      ctaSub: '365 meals a year — log them and see the compound effect for yourself',
      stats: [
        { label: '1 month of daily cooking', value: '30', unit: 'meals practiced' },
        { label: '6 months', value: '180', unit: 'meals — real confidence' },
        { label: '1 year', value: '365', unit: 'meals — teaching others' },
        { label: 'Skills gained per month', value: '2-3', unit: 'new techniques' },
        { label: 'Money saved year 1', value: '$5,100', unit: '' },
        { label: 'Health improvement', value: 'Measurable', unit: 'by month 3' },
        { label: 'Social meals hosted in year 1', value: '12+', unit: '' },
        { label: 'Confidence level after 1 year', value: 'Unrecognizable', unit: '' },
      ],
    }},

    // ── BiteClub Live (placeholder data — replaced by PostHog) ────────────────

    day_one: { stats: {
      title: 'Day 1: Posting on TikTok to Grow Our App',
      callout: 'Follow the journey. We\'re posting every day to see if TikTok can grow a cooking app.',
      cta: 'Follow @getbiteclub for daily updates',
      ctaSub: 'Download BiteClub and cook with us from day one',
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
      cta: 'Follow @getbiteclub for weekly updates',
      ctaSub: 'We share every number, every lesson — join us on the journey',
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
      cta: 'Download BiteClub and cook with us',
      ctaSub: 'We\'re building this for you — try it and tell us what you think',
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
      cta: 'Join us on the journey — download BiteClub',
      ctaSub: 'Follow @getbiteclub and watch us build in public',
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
      cta: 'Be part of the next milestone',
      ctaSub: 'Download BiteClub and help us grow this cooking community',
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
      cta: 'Follow @getbiteclub for the playbook',
      ctaSub: 'We share our exact strategy — download BiteClub and cook with us',
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

    // ── Food Debates (this_or_that) ───────────────────────────────────────────

    this_or_that_food: { thisOrThat: { theme: 'Food Edition', cta: 'Tell us your pick on BiteClub', ctaSub: 'Post your version and settle the debate once and for all', rounds: [
      { optionA: 'Tacos', optionB: 'Burritos' },
      { optionA: 'Pizza', optionB: 'Pasta' },
      { optionA: 'Sushi', optionB: 'Ramen' },
      { optionA: 'Burger', optionB: 'Hot Dog' },
      { optionA: 'Ice Cream', optionB: 'Cake' },
    ] }},

    unpopular_opinions: { thisOrThat: { theme: 'Unpopular Opinions', cta: 'Post your version on BiteClub', ctaSub: 'Cook both sides, let your friends vote', rounds: [
      { optionA: 'Pineapple on pizza', optionB: 'No pineapple ever' },
      { optionA: 'Ketchup on eggs', optionB: 'Hot sauce on eggs' },
      { optionA: 'Cereal is a soup', optionB: 'Cereal is NOT a soup' },
      { optionA: 'Well-done steak', optionB: 'Medium-rare only' },
      { optionA: 'Mayo on fries', optionB: 'Ketchup on fries' },
    ] }},

    homemade_vs_store: { thisOrThat: { theme: 'Homemade vs Store-Bought', cta: 'Cook both, post on BiteClub', ctaSub: 'Make the homemade version and let your friends decide', rounds: [
      { optionA: 'Homemade bread', optionB: 'Store bread' },
      { optionA: 'Homemade pasta', optionB: 'Dried pasta' },
      { optionA: 'Fresh salsa', optionB: 'Jar salsa' },
      { optionA: 'Homemade mayo', optionB: 'Hellmann\'s' },
      { optionA: 'Homemade pizza dough', optionB: 'Store-bought dough' },
    ] }},

    cuisine_battle: { thisOrThat: { theme: 'Cuisine Battle', cta: 'Cook your pick, share on BiteClub', ctaSub: 'Make a dish from your winning cuisine and post it', rounds: [
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
      cta: 'Put this knowledge to use on BiteClub',
      ctaSub: 'Try it tonight and post the result — show us your seasoning game',
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
      cta: 'Cook in-season, post on BiteClub',
      ctaSub: 'Try a seasonal recipe tonight and share what you made',
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
      cta: 'Try it tonight and post on BiteClub',
      ctaSub: 'Make something with what you already have — no excuses',
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
      cta: 'Cook smarter, share on BiteClub',
      ctaSub: 'Use what you just learned and post the proof',
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
      cta: 'Start fermenting, post on BiteClub',
      ctaSub: 'Your gut will thank you — share your fermentation journey with us',
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
      cta: 'Hit your protein goals on BiteClub',
      ctaSub: 'Log your meals and track your protein — it all starts in the kitchen',
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
              {PRESETS.length} content types across {CATEGORIES.length} categories
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-form components (stats + this-or-that, for power-user editing) ───────

function BiteClubStatsForm({
  value,
  onChange,
}: {
  value: { title: string; callout: string; stats: { label: string; value: string; unit: string }[]; cta: string; ctaSub: string };
  onChange: (v: { title: string; callout: string; stats: { label: string; value: string; unit: string }[]; cta: string; ctaSub: string }) => void;
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

  async function fetchPosthogStats() {
    setPosthogLoading(true);
    setPosthogError(null);
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
        stats: (data.stats || []).map((s: { label: string; value: string; unit?: string }) => ({
          label: s.label,
          value: s.value,
          unit: s.unit || '',
        })),
      });
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

    // Apply prefill
    const prefill = getPrefill(preset.id);
    if (prefill.stats) setStats({ ...prefill.stats, cta: prefill.stats.cta || '', ctaSub: prefill.stats.ctaSub || '' });
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
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-50 border border-cyan-200 text-cyan-700 rounded-xl text-sm font-semibold hover:bg-cyan-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {posthogLoading ? (
                      <>
                        <span className="animate-spin w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-600 rounded-full" />
                        Pulling stats...
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        Pull Live Stats from PostHog
                      </>
                    )}
                  </button>
                  {posthogError && (
                    <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      {posthogError}
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
