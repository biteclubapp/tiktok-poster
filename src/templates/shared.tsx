import { DishData } from '@/types';
import React from 'react';

// Dynamic sizing for steps — fills the full page height
// Available content area: ~1920 - 72*2 (padding) - 120 (header+label) - 100 (branding) ≈ 1556px
const STEP_CONTENT_HEIGHT = 1556;

export function getStepSizing(count: number) {
  // Calculate how much space each step gets
  const spacePerStep = STEP_CONTENT_HEIGHT / Math.max(count, 1);

  if (spacePerStep >= 300) {
    // Lots of room — big text, generous spacing
    const padding = Math.min(Math.floor(spacePerStep * 0.2), 48);
    return { fontSize: 48, padding, gap: 48, circleSize: 78, circleFontSize: 39, titleSize: 66, titleMargin: 72 };
  }
  if (spacePerStep >= 200) {
    const padding = Math.floor(spacePerStep * 0.15);
    return { fontSize: 42, padding, gap: 42, circleSize: 72, circleFontSize: 36, titleSize: 60, titleMargin: 54 };
  }
  if (spacePerStep >= 150) {
    const padding = Math.floor(spacePerStep * 0.12);
    return { fontSize: 36, padding, gap: 36, circleSize: 60, circleFontSize: 30, titleSize: 52, titleMargin: 42 };
  }
  if (spacePerStep >= 110) {
    const padding = Math.floor(spacePerStep * 0.1);
    return { fontSize: 30, padding, gap: 30, circleSize: 52, circleFontSize: 26, titleSize: 46, titleMargin: 30 };
  }
  const padding = Math.max(Math.floor(spacePerStep * 0.08), 6);
  return { fontSize: 26, padding, gap: 24, circleSize: 44, circleFontSize: 22, titleSize: 42, titleMargin: 24 };
}

// Available content area for ingredients (single-column list)
const ING_CONTENT_HEIGHT = 1556;

export function getIngredientSizing(count: number) {
  const spacePerItem = ING_CONTENT_HEIGHT / Math.max(count, 1);

  if (spacePerItem >= 220) {
    const padding = Math.min(Math.floor(spacePerItem * 0.2), 42);
    return { fontSize: 48, padding, dotSize: 44, titleSize: 66, titleMargin: 72 };
  }
  if (spacePerItem >= 150) {
    const padding = Math.floor(spacePerItem * 0.15);
    return { fontSize: 42, padding, dotSize: 40, titleSize: 58, titleMargin: 54 };
  }
  if (spacePerItem >= 110) {
    const padding = Math.floor(spacePerItem * 0.12);
    return { fontSize: 36, padding, dotSize: 34, titleSize: 50, titleMargin: 40 };
  }
  if (spacePerItem >= 85) {
    const padding = Math.floor(spacePerItem * 0.1);
    return { fontSize: 32, padding, dotSize: 30, titleSize: 46, titleMargin: 30 };
  }
  const padding = Math.max(Math.floor(spacePerItem * 0.08), 6);
  return { fontSize: 28, padding, dotSize: 26, titleSize: 42, titleMargin: 24 };
}

// Map ingredient text to a relevant food emoji
const INGREDIENT_EMOJI_MAP: [RegExp, string][] = [
  // Proteins
  [/chicken/i, '🍗'], [/beef|steak/i, '🥩'], [/pork|bacon|ham/i, '🥓'],
  [/fish|salmon|tuna|cod|tilapia/i, '🐟'], [/shrimp|prawn/i, '🦐'],
  [/egg/i, '🥚'], [/tofu|tempeh/i, '🌱'], [/lamb/i, '🍖'],
  [/sausage/i, '🌭'], [/turkey/i, '🦃'],
  // Dairy
  [/milk|cream|half.and.half/i, '🥛'], [/butter/i, '🧈'],
  [/cheese|parmesan|mozzarella|cheddar|feta/i, '🧀'], [/yogurt/i, '🥛'],
  // Vegetables
  [/tomato/i, '🍅'], [/onion|shallot|scallion/i, '🧅'],
  [/garlic/i, '🧄'], [/pepper|jalap|chili|chile/i, '🌶'],
  [/carrot/i, '🥕'], [/potato|sweet potato/i, '🥔'],
  [/broccoli/i, '🥦'], [/corn/i, '🌽'], [/mushroom/i, '🍄'],
  [/lettuce|spinach|kale|arugula|greens/i, '🥬'],
  [/cucumber/i, '🥒'], [/avocado/i, '🥑'], [/eggplant|aubergine/i, '🍆'],
  [/pea|bean/i, '🌱'], [/celery/i, '🥬'],
  [/cabbage/i, '🥬'], [/ginger/i, '🌿'],
  // Fruits
  [/lemon|lime/i, '🍋'], [/orange/i, '🍊'],
  [/apple/i, '🍎'], [/banana/i, '🍌'], [/berry|blueberr|strawberr|raspberr/i, '🍇'],
  [/peach/i, '🍑'], [/coconut/i, '🥥'], [/mango/i, '🥭'],
  [/pineapple/i, '🍍'], [/grape/i, '🍇'], [/watermelon|melon/i, '🍉'],
  // Grains & Carbs
  [/rice/i, '🍚'], [/pasta|noodle|spaghetti|penne|linguine|fettuccine/i, '🍝'],
  [/bread|baguette|tortilla|pita/i, '🍞'], [/flour/i, '🌾'],
  [/oat/i, '🌾'], [/quinoa|couscous/i, '🌾'],
  // Pantry
  [/oil|olive/i, '🥄'], [/vinegar|balsamic/i, '🥄'],
  [/soy sauce|fish sauce|worcester/i, '🥢'],
  [/honey/i, '🍯'], [/sugar/i, '🍬'], [/salt/i, '🧂'],
  [/chocolate|cocoa/i, '🍫'], [/vanilla/i, '🧁'],
  [/cinnamon|cumin|paprika|turmeric|spice|curry|oregano|thyme|basil|rosemary|parsley|cilantro|dill|mint|bay lea/i, '🌿'],
  [/nut|almond|walnut|pecan|cashew|peanut/i, '🥜'],
  [/wine/i, '🍷'], [/beer/i, '🍺'],
  [/water|broth|stock/i, '💧'],
  [/sauce|ketchup|mayo|mustard|gochujang/i, '🥫'],
  [/starch|corn starch/i, '🥄'],
];

export function getIngredientEmoji(ingredient: string): string {
  for (const [pattern, emoji] of INGREDIENT_EMOJI_MAP) {
    if (pattern.test(ingredient)) return emoji;
  }
  return '🍽';
}

// TikTok carousel dimensions
export const WIDTH = 1080;
export const HEIGHT = 1920;

export type Platform = 'tiktok' | 'reddit' | 'instagram';

export interface SlideProps {
  dish: DishData;
  heroImageBase64?: string;
  platform?: Platform;
}

// CTA Slide — same for all templates
export function renderCTASlide(style: 'A' | 'B' | 'C', logoBase64?: string): React.ReactElement {
  const isB = style === 'B';
  const bgColor = isB ? '#111' : style === 'C' ? '#FFF8F0' : '#FAFAF8';
  const textColor = isB ? '#fff' : style === 'C' ? '#2a2018' : '#1a1a1a';
  const mutedColor = isB ? '#888' : style === 'C' ? '#a09080' : '#999';
  const borderRadius = style === 'C' ? 60 : 48;
  const badgeBg = isB ? '#fff' : '#1a1a1a';
  const badgeColor = isB ? '#111' : '#fff';

  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        borderRadius: borderRadius,
        overflow: 'hidden',
        background: bgColor,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'DM Sans',
        position: 'relative',
      }}
    >
      {/* Accent bar */}
      {style === 'B' ? (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 9,
            height: '100%',
            background: 'linear-gradient(180deg, #E63946 0%, #E63946 30%, transparent 100%)',
          }}
        />
      ) : style === 'C' ? (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 9,
            background: 'linear-gradient(90deg, #E63946, #FF6B6B)',
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 9,
            background: 'linear-gradient(90deg, #E63946, #FF6B6B)',
          }}
        />
      )}

      {/* BiteClub logo */}
      <div style={{ width: 160, height: 160, marginBottom: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {logoBase64 ? (
          <img src={logoBase64} width={160} height={160} style={{ width: 160, height: 160, objectFit: 'contain' }} />
        ) : (
          <div
            style={{
              width: 160,
              height: 160,
              borderRadius: 80,
              background: '#E63946',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ color: '#fff', fontSize: 48, fontWeight: 700 }}>BC</div>
          </div>
        )}
      </div>

      {/* Brand name */}
      <div
        style={{
          fontSize: 72,
          fontWeight: 700,
          color: textColor,
          fontFamily: style === 'B' ? 'Cormorant Garamond' : 'DM Serif Display',
          letterSpacing: style === 'B' ? '0.05em' : '-0.02em',
          marginBottom: 30,
        }}
      >
        BiteClub
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: 42,
          fontWeight: 400,
          color: mutedColor,
          textAlign: 'center',
          maxWidth: 800,
          lineHeight: 1.4,
          marginBottom: 80,
        }}
      >
        The Strava for cooking — follow friends & discover yourself through what you cook.
      </div>

      {/* App store badges */}
      <div
        style={{
          display: 'flex',
          gap: 30,
          alignItems: 'center',
        }}
      >
        <div
          style={{
            background: badgeBg,
            color: badgeColor,
            borderRadius: 24,
            padding: '24px 48px',
            fontSize: 30,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          App Store
        </div>
      </div>

      {/* Social handles */}
      <div
        style={{
          marginTop: 60,
          fontSize: 33,
          fontWeight: 600,
          color: '#E63946',
          letterSpacing: '0.05em',
        }}
      >
        @biteclub.app
      </div>
    </div>
  );
}

// In-memory cache for fetched images (avoids re-downloading on every carousel generation)
const imageBase64Cache = new Map<string, string>();

// Helper: fetch and convert image to base64 data URI for embedding in Satori
export async function imageToBase64(url: string): Promise<string> {
  const cached = imageBase64Cache.get(url);
  if (cached) return cached;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const dataUri = `data:${contentType};base64,${base64}`;
    imageBase64Cache.set(url, dataUri);
    return dataUri;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return '';
  }
}
