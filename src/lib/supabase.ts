import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function fetchDishes(limit = 200, search?: string) {
  let query = supabase
    .from('meals')
    .select(`
      id,
      user_id,
      caption,
      rating,
      created_at,
      description,
      made_for,
      profiles (
        id,
        username,
        full_name,
        avatar_url
      ),
      meals_media (
        id,
        meal_id,
        media_uri,
        display_order,
        media_type
      ),
      meal_recipes (
        recipe_id,
        recipes (
          id,
          title,
          cook_time,
          prep_time,
          servings,
          ingredients_text,
          instructions,
          simplified_instructions
        )
      )
    `)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  const { data, error } = await query;

  if (error) {
    console.error('Supabase fetch error:', error);
    throw error;
  }

  // Transform the raw data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meals = (data || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((meal: any) => {
      const media = meal.meals_media;
      return media && media.length > 0 && media.some((m: { media_type: string }) => m.media_type === 'image');
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((meal: any) => {
      const profile = Array.isArray(meal.profiles)
        ? meal.profiles[0]
        : meal.profiles;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recipes = (meal.meal_recipes || []).map((mr: any) => {
        const recipe = mr.recipes;
        if (!recipe) return null;

        // Parse ingredients_text — can be array of strings or array of JSON strings
        const ingredients = parseIngredients(recipe.ingredients_text);

        // Parse instructions — prefer simplified_instructions for carousel consistency
        const instructions = parseInstructions(recipe.simplified_instructions || recipe.instructions);

        return {
          id: recipe.id,
          title: recipe.title,
          cook_time: recipe.cook_time,
          prep_time: recipe.prep_time,
          servings: recipe.servings,
          ingredients,
          instructions,
        };
      }).filter(Boolean);

      return {
        id: meal.id,
        user_id: meal.user_id,
        caption: meal.caption,
        rating: meal.rating,
        created_at: meal.created_at,
        description: meal.description,
        profile: profile || { id: '', username: 'unknown', full_name: null, avatar_url: null },
        media: (meal.meals_media || [])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((m: any) => m.media_type === 'image')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((m: any) => ({
            id: m.id,
            meal_id: m.meal_id,
            cloudflare_image_id: m.media_uri,
            order_index: m.display_order || 0,
          })),
        recipes,
      };
    });

  // Search filter
  if (search) {
    const lower = search.toLowerCase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return meals.filter((meal: any) => {
      const caption = (meal.caption || '').toLowerCase();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recipeMatch = meal.recipes.some((r: any) =>
        (r.title || '').toLowerCase().includes(lower)
      );
      return caption.includes(lower) || recipeMatch;
    });
  }

  return meals;
}

// Parse ingredients_text which can be:
// - Array of plain strings: ["1 cup flour", "2 eggs"]
// - Array of JSON strings: ["{\"id\":\"...\",\"text\":\"1 cup flour\"}"]
function parseIngredients(ingredientsText: unknown): string[] {
  if (!ingredientsText || !Array.isArray(ingredientsText)) return [];

  return ingredientsText.map((item: unknown) => {
    if (typeof item !== 'string') return String(item);

    // Try parsing as JSON
    if (item.startsWith('{')) {
      try {
        const parsed = JSON.parse(item);
        return parsed.text || parsed.name || item;
      } catch {
        return item;
      }
    }

    return item;
  }).filter(Boolean);
}

// Parse instructions which can be:
// - JSON array of {step, text}: [{step: 1, text: "..."}, ...]
// - Plain string with \n delimiters
// - Already a string
function parseInstructions(instructions: unknown): string[] {
  if (!instructions) return [];

  if (typeof instructions === 'string') {
    // Split by newlines, filter empty, strip step numbers
    return instructions
      .split('\n')
      .map((s: string) => s.trim())
      .filter(Boolean)
      .map((s: string) => s.replace(/^\d+[\.\)]\s*/, ''));
  }

  if (Array.isArray(instructions)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return instructions.map((item: any) => {
      if (typeof item === 'string') return item;
      return item.text || item.instruction || String(item);
    }).filter(Boolean);
  }

  return [];
}
