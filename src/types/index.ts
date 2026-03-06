export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface Recipe {
  id: string;
  title: string;
  cook_time: number | null;
  prep_time: number | null;
  servings: number | null;
  ingredients: string[];
  instructions: string[];
}

export interface MealMedia {
  id: string;
  meal_id: string;
  cloudflare_image_id: string; // maps to media_uri from DB
  order_index: number;
  signed_url?: string;
}

export interface Meal {
  id: string;
  user_id: string;
  caption: string | null;
  rating: number | null;
  created_at: string;
  description: string | null;
  profile: Profile;
  media: MealMedia[];
  recipes: Recipe[];
}

export interface DishData {
  meal: Meal;
  heroImageUrl: string;
  recipeName: string;
  cookName: string;
  cookInitial: string;
  cookTime: string;
  ingredients: string[];
  instructions: string[];
  stepCount: number;
  ingredientCount: number;
}

export type TemplateStyle = 'A' | 'B' | 'C';

export interface CarouselRequest {
  dishData: DishData;
  template: TemplateStyle;
}

export interface CarouselResult {
  slides: string[];
  template: TemplateStyle;
}

export interface TikTokTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  open_id: string;
}

export interface RedditTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  username: string;
}

export interface InstagramTokens {
  access_token: string;
  user_id: string;
  expires_at: number;
  username: string;
  page_id: string;
}
