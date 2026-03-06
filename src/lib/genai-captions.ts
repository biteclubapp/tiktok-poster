import { GoogleGenAI } from '@google/genai';
import { DishData } from '@/types';

const MODEL = 'gemini-2.0-flash-lite';

function getGeminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  if (!key) {
    throw new Error('Missing GEMINI_API_KEY in environment. Add GEMINI_API_KEY to .env.local.');
  }
  return key;
}

function getAiClient(): GoogleGenAI {
  return new GoogleGenAI({ apiKey: getGeminiApiKey() });
}

function parseJson(text: string): Record<string, unknown> | null {
  if (!text) return null;
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    // Try extracting from fenced block
    const fenced = text.match(/```json\s*([\s\S]*?)```/i);
    if (fenced?.[1]) {
      try { return JSON.parse(fenced[1].trim()) as Record<string, unknown>; } catch {}
    }
    // Try extracting JSON object
    const obj = text.match(/\{[\s\S]*\}/);
    if (obj?.[0]) {
      try { return JSON.parse(obj[0]) as Record<string, unknown>; } catch {}
    }
    return null;
  }
}

function dishSummary(dish: DishData): string {
  const parts = [`Recipe: ${dish.recipeName}`];
  if (dish.cookTime) parts.push(`Cook time: ${dish.cookTime}`);
  if (dish.ingredients.length > 0) {
    parts.push(`Key ingredients: ${dish.ingredients.slice(0, 8).join(', ')}`);
  }
  if (dish.instructions.length > 0) {
    parts.push(`Steps: ${dish.stepCount}`);
  }
  return parts.join('\n');
}

export interface TikTokCaptionResult {
  caption: string;
  hashtags: string[];
}

export async function generateTikTokCaption(dish: DishData): Promise<TikTokCaptionResult> {
  const fallback: TikTokCaptionResult = {
    caption: `${dish.recipeName} 🔥\n\nFull recipe in the carousel! Save for later 📌`,
    hashtags: ['#biteclub', '#cooking', '#recipe', '#food', '#homecooking', '#foodtok'],
  };

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        `You write viral TikTok captions for food content.\n\n${dishSummary(dish)}\n\n` +
        'Return strict JSON only: {"caption":"string","hashtags":["#tag1","#tag2"]}\n\n' +
        'Rules:\n' +
        '- Caption: engaging hook (1 line), then brief description, then CTA like "Save for later" or "Full recipe in carousel"\n' +
        '- Caption under 300 characters, no hashtags in caption\n' +
        '- 6-10 hashtags, each starting with #\n' +
        '- Always include #biteclub as the first hashtag\n' +
        '- Mix broad tags (#food, #cooking) with specific ones related to the dish',
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim() || '';
    const parsed = parseJson(text);

    const caption = typeof parsed?.caption === 'string' ? parsed.caption.trim() : '';
    let hashtags = Array.isArray(parsed?.hashtags)
      ? parsed.hashtags.filter((t): t is string => typeof t === 'string' && t.startsWith('#'))
      : [];

    if (!caption) return fallback;

    // Ensure #biteclub is first
    hashtags = hashtags.filter(t => t !== '#biteclub');
    hashtags.unshift('#biteclub');
    hashtags = hashtags.slice(0, 10);

    return { caption: caption.slice(0, 300), hashtags };
  } catch (e) {
    console.error('TikTok caption generation failed:', e);
    return fallback;
  }
}

export interface RedditTitleResult {
  title: string;
}

export async function generateRedditTitle(dish: DishData): Promise<RedditTitleResult> {
  const fallback: RedditTitleResult = {
    title: dish.recipeName,
  };

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        `You write Reddit post titles for food subreddits.\n\n${dishSummary(dish)}\n\n` +
        'Return strict JSON only: {"title":"string"}\n\n' +
        'Rules:\n' +
        '- Descriptive, conversational Reddit-style title\n' +
        '- No hashtags, no emojis, no ALL CAPS\n' +
        '- Can mention a highlight (e.g. "crispy skin", "from scratch", "30 min")\n' +
        '- Under 120 characters',
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim() || '';
    const parsed = parseJson(text);

    const title = typeof parsed?.title === 'string' ? parsed.title.trim() : '';
    if (!title) return fallback;

    return { title: title.slice(0, 120) };
  } catch (e) {
    console.error('Reddit title generation failed:', e);
    return fallback;
  }
}

export interface SubredditRecommendation {
  subreddits: string[];
}

export async function recommendSubreddits(dish: DishData): Promise<SubredditRecommendation> {
  const fallback: SubredditRecommendation = {
    subreddits: ['food', 'cooking', 'recipes'],
  };

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        `You recommend Reddit subreddits for food posts.\n\n${dishSummary(dish)}\n\n` +
        'Return strict JSON only: {"subreddits":["subredditname1","subredditname2"]}\n\n' +
        'Rules:\n' +
        '- 3-5 subreddits, most relevant first\n' +
        '- Use actual, active food subreddit names (no r/ prefix)\n' +
        '- Consider cuisine type, cooking method, dietary category\n' +
        '- Common options: food, cooking, recipes, FoodPorn, MealPrepSunday, EatCheapAndHealthy, Baking, tonightsdinner, slowcooking, GifRecipes, IndianFood, KoreanFood, Pizza, grilling, BBQ, vegetarian, ketorecipes',
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim() || '';
    const parsed = parseJson(text);

    const subreddits = Array.isArray(parsed?.subreddits)
      ? parsed.subreddits
          .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
          .map(s => s.replace(/^r\//, '').trim())
      : [];

    if (subreddits.length === 0) return fallback;

    return { subreddits: subreddits.slice(0, 5) };
  } catch (e) {
    console.error('Subreddit recommendation failed:', e);
    return fallback;
  }
}
