import React from 'react';
import { WIDTH, HEIGHT, SlideProps, getIngredientEmoji, getStepSizing, getIngredientSizing } from './shared';

// Style E: "Clean Minimal"
// Off-white bg (#F7F7F5), thin lines, generous whitespace, light typography,
// single-pixel borders, no heavy color blocks — understated elegance.

export function styleEHero({ dish, heroImageBase64, platform }: SlideProps): React.ReactElement {
  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        borderRadius: 48,
        overflow: 'hidden',
        background: '#F7F7F5',
        position: 'relative',
        fontFamily: 'DM Sans',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top thin rule */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: '#1a1a1a',
        }}
      />

      {/* Branding — top left, very small */}
      {platform !== 'reddit' && (
        <div
          style={{
            position: 'absolute',
            top: 42,
            left: 72,
            fontSize: 24,
            fontWeight: 400,
            color: '#999',
            letterSpacing: '0.18em',
          }}
        >
          Cooking the same rotation is normal. Knowing there's better out there and doing nothing is a choice. BiteClub.
        </div>
      )}

      {/* Cook time — top right */}
      <div
        style={{
          position: 'absolute',
          top: 42,
          right: 72,
          fontSize: 24,
          fontWeight: 400,
          color: '#999',
          letterSpacing: '0.12em',
        }}
      >
        {dish.cookTime.toUpperCase()}
      </div>

      {/* Photo frame — generous margin, slightly inset */}
      <div
        style={{
          position: 'absolute',
          top: 100,
          left: 60,
          right: 60,
          height: 820,
          borderRadius: 18,
          overflow: 'hidden',
          background: heroImageBase64
            ? '#e8e8e5'
            : 'linear-gradient(160deg, #d4cfc8 0%, #bfb8ae 100%)',
          display: 'flex',
        }}
      >
        {heroImageBase64 && (
          <img
            src={heroImageBase64}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </div>

      {/* Bottom text area */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '0 72px 60px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Thin horizontal rule */}
        <div
          style={{
            height: 1,
            background: '#c8c8c4',
            marginBottom: 36,
          }}
        />

        {/* Recipe name */}
        <div
          style={{
            fontSize: 60,
            fontWeight: 200,
            color: '#1a1a1a',
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            marginBottom: 24,
          }}
        >
          {dish.recipeName}
        </div>

        {/* Metadata — tiny, spaced */}
        <div
          style={{
            display: 'flex',
            gap: 48,
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: 28, color: '#999', fontWeight: 400, letterSpacing: '0.08em' }}>
            {`${dish.ingredientCount} ingredients`}
          </div>
          <div style={{ width: 4, height: 4, borderRadius: 2, background: '#ccc' }} />
          <div style={{ fontSize: 28, color: '#999', fontWeight: 400, letterSpacing: '0.08em' }}>
            {`${dish.stepCount} steps`}
          </div>
        </div>
      </div>

      {/* Bottom thin rule */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          background: '#1a1a1a',
        }}
      />
    </div>
  );
}

export function styleEIngredients({ dish, platform }: SlideProps): React.ReactElement {
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
        background: '#F7F7F5',
        position: 'relative',
        fontFamily: 'DM Sans',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top thin rule */}
      <div style={{ height: 2, background: '#1a1a1a', flexShrink: 0 }} />

      <div style={{ padding: '72px 84px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Label row with thin rule */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 30,
            marginBottom: 48,
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 500,
              color: '#999',
              letterSpacing: '0.18em',
            }}
          >
            INGREDIENTS
          </div>
          <div style={{ flex: 1, height: 1, background: '#d0d0cc' }} />
          <div style={{ fontSize: 24, color: '#bbb', letterSpacing: '0.1em' }}>
            {`${ingredients.length} ITEMS`}
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: s.titleSize,
            fontWeight: 200,
            color: '#1a1a1a',
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
            marginBottom: s.titleMargin,
          }}
        >
          {dish.recipeName}
        </div>

        {/* Ingredient list — purely typographic, no heavy UI */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {ingredients.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 30,
                padding: `${s.padding}px 0`,
                borderBottom: i < ingredients.length - 1 ? '1px solid #e4e4e0' : 'none',
              }}
            >
              <div style={{ fontSize: s.dotSize * 0.8, width: 44, flexShrink: 0, textAlign: 'center' as const }}>
                {getIngredientEmoji(item)}
              </div>
              <div
                style={{
                  fontSize: s.fontSize,
                  color: '#3a3a3a',
                  fontWeight: 300,
                  lineHeight: 1.35,
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
            bottom: 54,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 400,
              color: '#c0c0bc',
              letterSpacing: '0.18em',
            }}
          >
            The ingredient list is where most people give up. The ones who don't eat much better. BiteClub helps.
          </div>
        </div>
      )}

      {/* Bottom thin rule */}
      <div style={{ height: 2, background: '#1a1a1a', flexShrink: 0 }} />
    </div>
  );
}

export function styleESteps({ dish, platform }: SlideProps): React.ReactElement {
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
        background: '#F7F7F5',
        position: 'relative',
        fontFamily: 'DM Sans',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top thin rule */}
      <div style={{ height: 2, background: '#1a1a1a', flexShrink: 0 }} />

      <div style={{ padding: '72px 84px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Label row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 30,
            marginBottom: 48,
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 500,
              color: '#999',
              letterSpacing: '0.18em',
            }}
          >
            METHOD
          </div>
          <div style={{ flex: 1, height: 1, background: '#d0d0cc' }} />
          <div style={{ fontSize: 24, color: '#bbb', letterSpacing: '0.1em' }}>
            {`${steps.length} STEPS`}
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: s.titleSize,
            fontWeight: 200,
            color: '#1a1a1a',
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
            marginBottom: s.titleMargin,
          }}
        >
          {dish.recipeName}
        </div>

        {/* Steps — minimal, step number as small superscript-like label */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {steps.map((step, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: s.gap,
                padding: `${s.padding}px 0`,
                borderBottom: i < steps.length - 1 ? '1px solid #e4e4e0' : 'none',
                alignItems: 'flex-start',
              }}
            >
              {/* Minimal step number */}
              <div
                style={{
                  fontSize: s.circleFontSize * 0.75,
                  fontWeight: 300,
                  color: '#bbb',
                  width: 48,
                  flexShrink: 0,
                  textAlign: 'right' as const,
                  paddingTop: 6,
                  letterSpacing: '0.05em',
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </div>
              <div
                style={{
                  width: 1,
                  background: '#d8d8d4',
                  alignSelf: 'stretch',
                  flexShrink: 0,
                  minHeight: s.fontSize * 1.4,
                }}
              />
              <div
                style={{
                  fontSize: s.fontSize,
                  color: '#3a3a3a',
                  lineHeight: 1.5,
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
            bottom: 54,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 400,
              color: '#c0c0bc',
              letterSpacing: '0.18em',
            }}
          >
            Step-by-step is the difference between dinner and a disaster. BiteClub keeps you on track.
          </div>
        </div>
      )}

      {/* Bottom thin rule */}
      <div style={{ height: 2, background: '#1a1a1a', flexShrink: 0 }} />
    </div>
  );
}
