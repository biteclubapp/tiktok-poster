import React from 'react';
import { WIDTH, HEIGHT, SlideProps, getIngredientEmoji, getStepSizing, getIngredientSizing } from './shared';

// Style B: "Dark & Premium"
// Dark bg (#111), red left-edge bar, Cormorant Garamond headings

export function styleBHero({ dish, heroImageBase64 }: SlideProps): React.ReactElement {
  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        borderRadius: 48,
        overflow: 'hidden',
        background: '#111',
        position: 'relative',
        fontFamily: 'DM Sans',
        display: 'flex',
      }}
    >
      {/* Hero image */}
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
            background: 'linear-gradient(135deg, #8B7355 0%, #A0522D 30%, #CD853F 60%, #DEB887 100%)',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
      )}

      {/* Signature left edge accent */}
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

      {/* BITECLUB badge - top right */}
      <div
        style={{
          position: 'absolute',
          top: 48,
          right: 48,
          background: 'rgba(0,0,0,0.6)',
          borderRadius: 18,
          padding: '15px 30px',
          display: 'flex',
          alignItems: 'center',
          gap: 18,
        }}
      >
        <span
          style={{
            color: '#E63946',
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: '0.1em',
          }}
        >
          BITECLUB
        </span>
      </div>

      {/* Title overlay - bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '180px 72px 72px',
          background: 'linear-gradient(transparent, #111 85%)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            fontSize: 78,
            fontWeight: 300,
            color: '#fff',
            fontFamily: 'Cormorant Garamond',
            lineHeight: 1.2,
            letterSpacing: '0.02em',
          }}
        >
          {dish.recipeName}
        </div>
        <div
          style={{
            display: 'flex',
            gap: 48,
            marginTop: 30,
          }}
        >
          <span
            style={{
              color: '#888',
              fontSize: 36,
              fontWeight: 500,
              letterSpacing: '0.05em',
              textTransform: 'uppercase' as const,
            }}
          >
            {dish.cookTime}
          </span>
          <span style={{ color: '#444', fontSize: 36 }}>·</span>
          <span
            style={{
              color: '#888',
              fontSize: 36,
              fontWeight: 500,
              letterSpacing: '0.05em',
              textTransform: 'uppercase' as const,
            }}
          >
            {dish.stepCount} steps
          </span>
        </div>
      </div>
    </div>
  );
}

export function styleBIngredients({ dish }: SlideProps): React.ReactElement {
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
        background: '#111',
        position: 'relative',
        fontFamily: 'DM Sans',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Signature left edge */}
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

      <div style={{ padding: '72px 84px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div
          style={{
            fontSize: 30,
            fontWeight: 600,
            letterSpacing: '0.15em',
            color: '#E63946',
            textTransform: 'uppercase' as const,
            marginBottom: 18,
          }}
        >
          Ingredients
        </div>
        <div
          style={{
            fontSize: s.titleSize,
            fontWeight: 300,
            color: '#fff',
            fontFamily: 'Cormorant Garamond',
            letterSpacing: '0.02em',
            marginBottom: s.titleMargin,
          }}
        >
          {dish.recipeName}
        </div>

        {ingredients.map((item, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 30,
              padding: `${s.padding}px 0`,
              borderBottom:
                i < ingredients.length - 1 ? '2px solid rgba(255,255,255,0.06)' : 'none',
            }}
          >
            <div style={{ fontSize: s.dotSize, flexShrink: 0, width: 46, textAlign: 'center' }}>
              {getIngredientEmoji(item)}
            </div>
            <div style={{ fontSize: s.fontSize, color: '#ccc', fontWeight: 300, display: 'flex' }}>{item}</div>
          </div>
        ))}
      </div>

      {/* BITECLUB branding */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          right: 72,
          color: '#333',
          fontSize: 30,
          fontWeight: 600,
          letterSpacing: '0.1em',
        }}
      >
        BITECLUB
      </div>
    </div>
  );
}

export function styleBSteps({ dish }: SlideProps): React.ReactElement {
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
        background: '#111',
        position: 'relative',
        fontFamily: 'DM Sans',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Signature left edge */}
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

      <div style={{ padding: '72px 84px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div
          style={{
            fontSize: 30,
            fontWeight: 600,
            letterSpacing: '0.15em',
            color: '#E63946',
            textTransform: 'uppercase' as const,
            marginBottom: 18,
          }}
        >
          How to Cook
        </div>
        <div
          style={{
            fontSize: s.titleSize,
            fontWeight: 300,
            color: '#fff',
            fontFamily: 'Cormorant Garamond',
            letterSpacing: '0.02em',
            marginBottom: s.titleMargin,
          }}
        >
          {dish.recipeName}
        </div>

        {steps.map((step, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: s.gap,
              padding: `${s.padding}px 0`,
              borderBottom: i < steps.length - 1 ? '2px solid rgba(255,255,255,0.06)' : 'none',
            }}
          >
            <div
              style={{
                color: '#E63946',
                fontSize: s.circleFontSize,
                fontWeight: 700,
                width: 50,
                flexShrink: 0,
                textAlign: 'right' as const,
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              {String(i + 1)}
            </div>
            <div style={{ fontSize: s.fontSize, color: '#ccc', fontWeight: 300, lineHeight: 1.4, display: 'flex' }}>
              {step}
            </div>
          </div>
        ))}
      </div>

      {/* BITECLUB branding */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          right: 72,
          color: '#333',
          fontSize: 30,
          fontWeight: 600,
          letterSpacing: '0.1em',
        }}
      >
        BITECLUB
      </div>
    </div>
  );
}
