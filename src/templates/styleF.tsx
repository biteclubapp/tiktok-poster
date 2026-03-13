import React from 'react';
import { WIDTH, HEIGHT, SlideProps, getIngredientEmoji, getStepSizing, getIngredientSizing } from './shared';

// Style F: "Playful Retro"
// Warm sandy bg (#FFF3E0), coral/pink accent (#EF476F), sunny yellow (#FFD166),
// rounded pill shapes, chunky borders, casual friendly vibe.

const CORAL = '#EF476F';
const YELLOW = '#FFD166';
const SAND = '#FFF3E0';
const DARK = '#1a1a1a';
const WARM_GRAY = '#7a6a5a';

export function styleFHero({ dish, heroImageBase64, platform }: SlideProps): React.ReactElement {
  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        borderRadius: 60,
        overflow: 'hidden',
        background: SAND,
        position: 'relative',
        fontFamily: 'DM Sans',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Photo — rounded card with a border, offset slightly */}
      <div
        style={{
          margin: '48px 60px 0',
          height: 800,
          borderRadius: 42,
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          background: heroImageBase64
            ? DARK
            : `linear-gradient(135deg, ${YELLOW} 0%, ${CORAL} 100%)`,
          border: `5px solid ${DARK}`,
        }}
      >
        {heroImageBase64 && (
          <img
            src={heroImageBase64}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}

        {/* Cook time badge — top-left inside the photo */}
        <div
          style={{
            position: 'absolute',
            top: 30,
            left: 30,
            background: YELLOW,
            color: DARK,
            fontSize: 30,
            fontWeight: 800,
            padding: '12px 28px',
            borderRadius: 999,
            border: `3px solid ${DARK}`,
            letterSpacing: '0.04em',
          }}
        >
          {dish.cookTime}
        </div>

        {/* Branding badge — top right inside photo */}
        {platform !== 'reddit' && (
          <div
            style={{
              position: 'absolute',
              top: 30,
              right: 30,
              background: CORAL,
              color: '#fff',
              fontSize: 26,
              fontWeight: 800,
              padding: '12px 28px',
              borderRadius: 999,
              border: `3px solid ${DARK}`,
              letterSpacing: '0.06em',
            }}
          >
            Your fridge deserves better than Tuesday pasta again. BiteClub has opinions.
          </div>
        )}
      </div>

      {/* Info area */}
      <div
        style={{
          padding: '30px 72px 40px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        {/* Recipe name */}
        <div
          style={{
            fontSize: 60,
            fontWeight: 800,
            color: DARK,
            fontFamily: 'DM Serif Display',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: 20,
          }}
        >
          {dish.recipeName}
        </div>

        {/* Pills row */}
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' as const }}>
          <div
            style={{
              background: CORAL,
              color: '#fff',
              fontSize: 30,
              fontWeight: 700,
              padding: '12px 30px',
              borderRadius: 999,
              border: `3px solid ${DARK}`,
            }}
          >
            {`${dish.ingredientCount} ingredients`}
          </div>
          <div
            style={{
              background: YELLOW,
              color: DARK,
              fontSize: 30,
              fontWeight: 700,
              padding: '12px 30px',
              borderRadius: 999,
              border: `3px solid ${DARK}`,
            }}
          >
            {`${dish.stepCount} steps`}
          </div>
        </div>
      </div>

      {/* Bottom chunky border line */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 12,
          background: DARK,
        }}
      />
    </div>
  );
}

export function styleFIngredients({ dish, platform }: SlideProps): React.ReactElement {
  const maxIngredients = Math.min(dish.ingredients.length, 16);
  const ingredients = dish.ingredients.slice(0, maxIngredients);
  const s = getIngredientSizing(ingredients.length);

  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        borderRadius: 60,
        overflow: 'hidden',
        background: SAND,
        position: 'relative',
        fontFamily: 'DM Sans',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top chunky bar */}
      <div style={{ height: 12, background: DARK, flexShrink: 0 }} />

      <div style={{ padding: '54px 72px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Section badge */}
        <div
          style={{
            display: 'flex',
            alignSelf: 'flex-start',
            background: YELLOW,
            color: DARK,
            fontSize: 30,
            fontWeight: 800,
            padding: '12px 36px',
            borderRadius: 999,
            border: `3px solid ${DARK}`,
            letterSpacing: '0.06em',
            marginBottom: 30,
          }}
        >
          INGREDIENTS
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: s.titleSize,
            fontWeight: 800,
            color: DARK,
            fontFamily: 'DM Serif Display',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: s.titleMargin,
          }}
        >
          {dish.recipeName}
        </div>

        {/* Ingredients — alternating card/row style */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: s.padding > 20 ? 18 : 10 }}>
          {ingredients.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                background: i % 3 === 0 ? CORAL : i % 3 === 1 ? YELLOW : '#fff',
                borderRadius: 24,
                padding: `${Math.max(s.padding * 0.7, 14)}px 28px`,
                border: `2px solid ${DARK}`,
              }}
            >
              <div style={{ fontSize: s.dotSize, flexShrink: 0 }}>
                {getIngredientEmoji(item)}
              </div>
              <div
                style={{
                  fontSize: s.fontSize,
                  color: i % 3 === 0 ? '#fff' : DARK,
                  fontWeight: 600,
                  flex: 1,
                  display: 'flex',
                }}
              >
                {item}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Branding */}
      {platform !== 'reddit' && (
        <div
          style={{
            position: 'absolute',
            bottom: 36,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: WARM_GRAY,
              letterSpacing: '0.14em',
            }}
          >
            Fun fact: nobody in history has regretted buying fresh herbs. BiteClub will talk you into it every time.
          </div>
        </div>
      )}

      {/* Bottom chunky bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 12,
          background: DARK,
        }}
      />
    </div>
  );
}

export function styleFSteps({ dish, platform }: SlideProps): React.ReactElement {
  const maxSteps = Math.min(dish.instructions.length, 10);
  const steps = dish.instructions.slice(0, maxSteps);
  const s = getStepSizing(steps.length);

  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        borderRadius: 60,
        overflow: 'hidden',
        background: SAND,
        position: 'relative',
        fontFamily: 'DM Sans',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top chunky bar */}
      <div style={{ height: 12, background: DARK, flexShrink: 0 }} />

      <div style={{ padding: '54px 72px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Section badge */}
        <div
          style={{
            display: 'flex',
            alignSelf: 'flex-start',
            background: CORAL,
            color: '#fff',
            fontSize: 30,
            fontWeight: 800,
            padding: '12px 36px',
            borderRadius: 999,
            border: `3px solid ${DARK}`,
            letterSpacing: '0.06em',
            marginBottom: 30,
          }}
        >
          HOW TO COOK
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: s.titleSize,
            fontWeight: 800,
            color: DARK,
            fontFamily: 'DM Serif Display',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: s.titleMargin,
          }}
        >
          {dish.recipeName}
        </div>

        {/* Steps — numbered bubbles with pill cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: s.padding > 20 ? 20 : 12 }}>
          {steps.map((step, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: s.gap,
                alignItems: 'flex-start',
              }}
            >
              {/* Fun circle number */}
              <div
                style={{
                  width: s.circleSize,
                  height: s.circleSize,
                  borderRadius: s.circleSize / 2,
                  background: i % 2 === 0 ? CORAL : YELLOW,
                  border: `3px solid ${DARK}`,
                  color: i % 2 === 0 ? '#fff' : DARK,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: s.circleFontSize,
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {String(i + 1)}
              </div>

              {/* Step text in a slight card */}
              <div
                style={{
                  flex: 1,
                  background: '#fff',
                  borderRadius: 18,
                  padding: `${Math.max(s.padding * 0.6, 14)}px 24px`,
                  border: `2px solid rgba(0,0,0,0.08)`,
                  display: 'flex',
                }}
              >
                <div
                  style={{
                    fontSize: s.fontSize,
                    color: '#2a2a2a',
                    lineHeight: 1.45,
                    fontWeight: 500,
                  }}
                >
                  {step}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Branding */}
      {platform !== 'reddit' && (
        <div
          style={{
            position: 'absolute',
            bottom: 36,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: WARM_GRAY,
              letterSpacing: '0.14em',
            }}
          >
            Cooking is basically a group activity you do alone. Unless you're on BiteClub — hi, friends.
          </div>
        </div>
      )}

      {/* Bottom chunky bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 12,
          background: DARK,
        }}
      />
    </div>
  );
}
