import React from 'react';
import { WIDTH, HEIGHT, SlideProps, getIngredientEmoji, getStepSizing, getIngredientSizing } from './shared';

// Style D: "Bold Editorial"
// Black bg with full-bleed photo, stark white typesetting, magazine-style masthead,
// heavy condensed numbers, high-contrast blocks.

export function styleDHero({ dish, heroImageBase64, platform }: SlideProps): React.ReactElement {
  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        borderRadius: 48,
        overflow: 'hidden',
        background: '#0A0A0A',
        position: 'relative',
        fontFamily: 'DM Sans',
        display: 'flex',
      }}
    >
      {/* Full-bleed hero image */}
      {heroImageBase64 ? (
        <img
          src={heroImageBase64}
          style={{
            width: WIDTH,
            height: HEIGHT,
            objectFit: 'cover',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(160deg, #1a1a1a 0%, #3d1a00 50%, #8B3A00 100%)',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
      )}

      {/* Heavy dark vignette — bottom 60% */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 900,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.97))',
        }}
      />

      {/* Masthead bar — top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 96,
          background: '#E63946',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 60,
          paddingRight: 60,
          justifyContent: 'space-between',
        }}
      >
        {platform !== 'reddit' && (
          <div
            style={{
              fontSize: 36,
              fontWeight: 900,
              color: '#fff',
              letterSpacing: '0.08em',
            }}
          >
            BITECLUB
          </div>
        )}
        <div
          style={{
            fontSize: 30,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.7)',
            letterSpacing: '0.1em',
            marginLeft: platform !== 'reddit' ? 0 : 'auto',
          }}
        >
          {dish.cookTime.toUpperCase()}
        </div>
      </div>

      {/* Bottom title block */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '0 60px 54px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Recipe name — massive editorial headline */}
        <div
          style={{
            fontSize: 78,
            fontWeight: 900,
            color: '#fff',
            fontFamily: 'DM Serif Display',
            lineHeight: 1.0,
            letterSpacing: '-0.03em',
            marginBottom: 36,
          }}
        >
          {dish.recipeName}
        </div>

        {/* Metadata row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 0,
          }}
        >
          <div
            style={{
              background: '#fff',
              color: '#0A0A0A',
              fontSize: 30,
              fontWeight: 700,
              padding: '12px 30px',
              letterSpacing: '0.05em',
            }}
          >
            {`${dish.ingredientCount} INGR`}
          </div>
          <div
            style={{
              background: '#E63946',
              color: '#fff',
              fontSize: 30,
              fontWeight: 700,
              padding: '12px 30px',
              letterSpacing: '0.05em',
            }}
          >
            {`${dish.stepCount} STEPS`}
          </div>
        </div>
      </div>
    </div>
  );
}

export function styleDIngredients({ dish, platform }: SlideProps): React.ReactElement {
  const maxIngredients = Math.min(dish.ingredients.length, 16);
  const ingredients = dish.ingredients.slice(0, maxIngredients);
  const s = getIngredientSizing(ingredients.length);

  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        borderRadius: 48,
        overflow: 'hidden',
        background: '#0A0A0A',
        position: 'relative',
        fontFamily: 'DM Sans',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Red top bar */}
      <div style={{ height: 9, background: '#E63946', flexShrink: 0 }} />

      <div style={{ padding: '60px 72px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Section label */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#E63946',
            letterSpacing: '0.2em',
            marginBottom: 18,
          }}
        >
          INGREDIENTS
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: s.titleSize,
            fontWeight: 900,
            color: '#fff',
            fontFamily: 'DM Serif Display',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            marginBottom: s.titleMargin,
          }}
        >
          {dish.recipeName}
        </div>

        {/* Ingredient list — alternating band style */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {ingredients.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 36,
                padding: `${s.padding}px 24px`,
                background: i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'transparent',
              }}
            >
              {/* Bold index number */}
              <div
                style={{
                  fontSize: s.dotSize,
                  fontWeight: 900,
                  color: '#E63946',
                  width: 54,
                  flexShrink: 0,
                  textAlign: 'right' as const,
                  lineHeight: 1,
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </div>
              <div
                style={{
                  width: 2,
                  height: s.fontSize,
                  background: 'rgba(255,255,255,0.15)',
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  fontSize: s.fontSize,
                  color: '#e0e0e0',
                  fontWeight: 400,
                  lineHeight: 1.3,
                  flex: 1,
                  display: 'flex',
                }}
              >
                {item}
              </div>
              <div style={{ fontSize: s.dotSize * 0.8, flexShrink: 0 }}>
                {getIngredientEmoji(item)}
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
            bottom: 48,
            right: 60,
            fontSize: 26,
            fontWeight: 700,
            color: '#333',
            letterSpacing: '0.12em',
          }}
        >
          Professionals shop from a list. Amateurs shop from memory. You're a professional now.
        </div>
      )}

      {/* Bottom red bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 9,
          background: '#E63946',
        }}
      />
    </div>
  );
}

export function styleDSteps({ dish, platform }: SlideProps): React.ReactElement {
  const maxSteps = Math.min(dish.instructions.length, 10);
  const steps = dish.instructions.slice(0, maxSteps);
  const s = getStepSizing(steps.length);

  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        borderRadius: 48,
        overflow: 'hidden',
        background: '#0A0A0A',
        position: 'relative',
        fontFamily: 'DM Sans',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Red top bar */}
      <div style={{ height: 9, background: '#E63946', flexShrink: 0 }} />

      <div style={{ padding: '60px 72px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Section label */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#E63946',
            letterSpacing: '0.2em',
            marginBottom: 18,
          }}
        >
          METHOD
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: s.titleSize,
            fontWeight: 900,
            color: '#fff',
            fontFamily: 'DM Serif Display',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            marginBottom: s.titleMargin,
          }}
        >
          {dish.recipeName}
        </div>

        {/* Steps — large number + text, editorial blocks */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {steps.map((step, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: s.gap,
                padding: `${s.padding}px 0`,
                borderBottom: i < steps.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                alignItems: 'flex-start',
              }}
            >
              {/* Giant step number */}
              <div
                style={{
                  fontSize: s.circleFontSize * 1.4,
                  fontWeight: 900,
                  color: '#E63946',
                  lineHeight: 1,
                  width: 70,
                  flexShrink: 0,
                  textAlign: 'right' as const,
                  fontFamily: 'DM Serif Display',
                }}
              >
                {String(i + 1)}
              </div>
              <div
                style={{
                  width: 3,
                  background: '#E63946',
                  alignSelf: 'stretch',
                  flexShrink: 0,
                  minHeight: s.fontSize * 1.4,
                }}
              />
              <div
                style={{
                  fontSize: s.fontSize,
                  color: '#ccc',
                  lineHeight: 1.45,
                  fontWeight: 300,
                  flex: 1,
                  display: 'flex',
                }}
              >
                {step}
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
            bottom: 48,
            right: 60,
            fontSize: 26,
            fontWeight: 700,
            color: '#333',
            letterSpacing: '0.12em',
          }}
        >
          A recipe you actually finish is worth 12 you saved and forgot. BiteClub is where you finish them.
        </div>
      )}

      {/* Bottom red bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 9,
          background: '#E63946',
        }}
      />
    </div>
  );
}
