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

// TikTok carousel dimensions (9:16 full portrait)
export const WIDTH = 1080;
export const HEIGHT = 1920;

export type Platform = 'tiktok' | 'reddit' | 'instagram';

export interface SlideProps {
  dish: DishData;
  heroImageBase64?: string;
  platform?: Platform;
}

// CTA Slide — same for all templates
export function renderCTASlide(style: 'A' | 'B' | 'C' | 'D' | 'E' | 'F', logoBase64?: string): React.ReactElement {
  // Styles D, E, F have their own fully custom CTA slides
  if (style === 'D') return renderCTASlideD(logoBase64);
  if (style === 'E') return renderCTASlideE(logoBase64);
  if (style === 'F') return renderCTASlideF(logoBase64);

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
      <div style={{ width: 120, height: 120, marginBottom: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {logoBase64 ? (
          <img src={logoBase64} width={120} height={120} style={{ width: 120, height: 120, objectFit: 'contain' }} />
        ) : (
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              background: '#E63946',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ color: '#fff', fontSize: 36, fontWeight: 700 }}>BC</div>
          </div>
        )}
      </div>

      {/* Brand name */}
      <div
        style={{
          fontSize: 60,
          fontWeight: 700,
          color: textColor,
          fontFamily: style === 'B' ? 'Cormorant Garamond' : 'DM Serif Display',
          letterSpacing: style === 'B' ? '0.05em' : '-0.02em',
          marginBottom: 24,
        }}
      >
        BiteClub
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: 34,
          fontWeight: 400,
          color: mutedColor,
          textAlign: 'center',
          maxWidth: 800,
          lineHeight: 1.4,
          marginBottom: 60,
        }}
      >
        {style === 'B'
          ? 'Save recipes, see what friends are cooking, and actually make the stuff you find.'
          : style === 'C'
          ? 'Recipes your friends are actually making — not just saving and forgetting.'
          : 'Find your next favourite recipe. See what the people you trust are cooking.'}
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
            borderRadius: 20,
            padding: '20px 40px',
            fontSize: 26,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {style === 'B' ? 'Try BiteClub Free' : style === 'C' ? 'Find Recipes on BiteClub' : 'Start Cooking on BiteClub'}
        </div>
      </div>

      {/* Social handles */}
      <div
        style={{
          marginTop: 48,
          fontSize: 28,
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

// Style D CTA — bold editorial, black bg, giant typographic treatment
function renderCTASlideD(logoBase64?: string): React.ReactElement {
  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        borderRadius: 48,
        overflow: 'hidden',
        background: '#0A0A0A',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'DM Sans',
        position: 'relative',
      }}
    >
      {/* Top white band — editorial masthead */}
      <div
        style={{
          background: '#fff',
          height: 136,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 72,
          paddingRight: 72,
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 900,
            color: '#0A0A0A',
            letterSpacing: '-0.04em',
            fontFamily: 'DM Serif Display',
          }}
        >
          BITECLUB
        </div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 500,
            color: '#999',
            letterSpacing: '0.12em',
          }}
        >
          EST. 2024
        </div>
      </div>

      {/* Red horizontal rule */}
      <div style={{ height: 9, background: '#E63946' }} />

      {/* Main content — centered */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingLeft: 72,
          paddingRight: 72,
        }}
      >
        {/* Logo */}
        <div style={{ width: 108, height: 108, marginBottom: 54, display: 'flex' }}>
          {logoBase64 ? (
            <img src={logoBase64} width={108} height={108} style={{ width: 108, height: 108, objectFit: 'contain' }} />
          ) : (
            <div
              style={{
                width: 108,
                height: 108,
                borderRadius: 54,
                background: '#E63946',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ color: '#fff', fontSize: 32, fontWeight: 900 }}>BC</div>
            </div>
          )}
        </div>

        <div
          style={{
            fontSize: 40,
            fontWeight: 700,
            color: '#fff',
            textAlign: 'center',
            lineHeight: 1.3,
            maxWidth: 860,
            marginBottom: 48,
          }}
        >
          Your recipes deserve better than a camera roll.
        </div>

        <div
          style={{
            fontSize: 30,
            fontWeight: 400,
            color: '#666',
            textAlign: 'center',
            lineHeight: 1.5,
            maxWidth: 820,
            marginBottom: 72,
          }}
        >
          BiteClub is where you save what you cook, follow friends who eat well, and actually find things worth making.
        </div>

        {/* CTA button */}
        <div
          style={{
            background: '#E63946',
            color: '#fff',
            fontSize: 30,
            fontWeight: 700,
            padding: '24px 60px',
            borderRadius: 12,
            letterSpacing: '0.06em',
            display: 'flex',
          }}
        >
          GET BITECLUB — FREE
        </div>

        <div
          style={{
            marginTop: 42,
            fontSize: 28,
            fontWeight: 600,
            color: '#444',
            letterSpacing: '0.08em',
          }}
        >
          @biteclub.app
        </div>
      </div>
    </div>
  );
}

// Style E CTA — ultra minimal, off-white, airy
function renderCTASlideE(logoBase64?: string): React.ReactElement {
  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        borderRadius: 48,
        overflow: 'hidden',
        background: '#F7F7F5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'DM Sans',
        position: 'relative',
      }}
    >
      {/* Thin top line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 80,
          right: 80,
          height: 2,
          background: '#1a1a1a',
        }}
      />

      {/* Logo */}
      <div style={{ width: 96, height: 96, marginBottom: 60, display: 'flex' }}>
        {logoBase64 ? (
          <img src={logoBase64} width={96} height={96} style={{ width: 96, height: 96, objectFit: 'contain' }} />
        ) : (
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              border: '3px solid #1a1a1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ color: '#1a1a1a', fontSize: 28, fontWeight: 300, letterSpacing: '0.05em' }}>BC</div>
          </div>
        )}
      </div>

      {/* Brand */}
      <div
        style={{
          fontSize: 56,
          fontWeight: 200,
          color: '#1a1a1a',
          letterSpacing: '0.15em',
          marginBottom: 28,
        }}
      >
        BITECLUB
      </div>

      {/* Thin divider */}
      <div style={{ width: 60, height: 2, background: '#E63946', marginBottom: 48 }} />

      {/* Tagline */}
      <div
        style={{
          fontSize: 32,
          fontWeight: 300,
          color: '#555',
          textAlign: 'center',
          maxWidth: 780,
          lineHeight: 1.6,
          letterSpacing: '0.02em',
          marginBottom: 90,
        }}
      >
        Where the food you make becomes part of who you are. Save recipes. Follow friends. Cook more.
      </div>

      {/* Minimal CTA */}
      <div
        style={{
          border: '2px solid #1a1a1a',
          color: '#1a1a1a',
          fontSize: 26,
          fontWeight: 500,
          padding: '20px 50px',
          borderRadius: 6,
          letterSpacing: '0.1em',
          display: 'flex',
        }}
      >
        DOWNLOAD BITECLUB
      </div>

      <div
        style={{
          marginTop: 48,
          fontSize: 26,
          fontWeight: 400,
          color: '#E63946',
          letterSpacing: '0.08em',
        }}
      >
        @biteclub.app
      </div>

      {/* Thin bottom line */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 80,
          right: 80,
          height: 2,
          background: '#1a1a1a',
        }}
      />
    </div>
  );
}

// Style F CTA — playful, coral/yellow palette
function renderCTASlideF(logoBase64?: string): React.ReactElement {
  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        borderRadius: 60,
        overflow: 'hidden',
        background: '#FFF3E0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'DM Sans',
        position: 'relative',
      }}
    >
      {/* Decorative top blob */}
      <div
        style={{
          position: 'absolute',
          top: -120,
          left: -120,
          width: 600,
          height: 600,
          borderRadius: 300,
          background: '#FFD166',
          opacity: 0.4,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -100,
          right: -100,
          width: 500,
          height: 500,
          borderRadius: 250,
          background: '#EF476F',
          opacity: 0.15,
        }}
      />

      {/* Logo */}
      <div style={{ width: 112, height: 112, marginBottom: 48, display: 'flex', position: 'relative' }}>
        {logoBase64 ? (
          <img src={logoBase64} width={112} height={112} style={{ width: 112, height: 112, objectFit: 'contain' }} />
        ) : (
          <div
            style={{
              width: 112,
              height: 112,
              borderRadius: 56,
              background: '#EF476F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ color: '#fff', fontSize: 36, fontWeight: 800 }}>BC</div>
          </div>
        )}
      </div>

      {/* Brand */}
      <div
        style={{
          fontSize: 64,
          fontWeight: 800,
          color: '#1a1a1a',
          fontFamily: 'DM Serif Display',
          letterSpacing: '-0.02em',
          marginBottom: 20,
          position: 'relative',
        }}
      >
        BiteClub
      </div>

      {/* Fun tagline */}
      <div
        style={{
          background: '#EF476F',
          color: '#fff',
          fontSize: 26,
          fontWeight: 700,
          padding: '10px 30px',
          borderRadius: 999,
          letterSpacing: '0.04em',
          marginBottom: 54,
          position: 'relative',
        }}
      >
        recipes worth making. friends who actually cook.
      </div>

      <div
        style={{
          fontSize: 30,
          fontWeight: 400,
          color: '#555',
          textAlign: 'center',
          maxWidth: 800,
          lineHeight: 1.5,
          marginBottom: 72,
          position: 'relative',
        }}
      >
        Stop saving recipes you'll never make. BiteClub shows you what your friends are actually cooking — and makes it stupidly easy to do the same.
      </div>

      {/* Pill CTA */}
      <div
        style={{
          background: '#1a1a1a',
          color: '#fff',
          fontSize: 30,
          fontWeight: 700,
          padding: '24px 64px',
          borderRadius: 999,
          display: 'flex',
          position: 'relative',
        }}
      >
        Try BiteClub for Free
      </div>

      <div
        style={{
          marginTop: 42,
          fontSize: 28,
          fontWeight: 600,
          color: '#EF476F',
          position: 'relative',
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
