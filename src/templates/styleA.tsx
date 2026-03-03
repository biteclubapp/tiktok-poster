import React from 'react';
import { WIDTH, HEIGHT, SlideProps, getIngredientEmoji, getStepSizing, getIngredientSizing } from './shared';

// Style A: "Clean & Modern"
// Light gray bg (#FAFAF8), red accent bar top, DM Serif Display titles

export function styleAHero({ dish, heroImageBase64 }: SlideProps): React.ReactElement {
  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        borderRadius: 48,
        overflow: 'hidden',
        background: '#1a1a1a',
        position: 'relative',
        fontFamily: 'DM Sans',
        display: 'flex',
      }}
    >
      {/* Hero image or gradient placeholder */}
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          display: 'flex',
          background: heroImageBase64
            ? '#1a1a1a'
            : 'linear-gradient(135deg, #8B7355 0%, #A0522D 30%, #CD853F 60%, #DEB887 100%)',
        }}
      >
        {heroImageBase64 && (
          <img
            src={heroImageBase64}
            width={WIDTH}
            height={HEIGHT}
            style={{
              width: WIDTH,
              height: HEIGHT,
              objectFit: 'cover',
            }}
          />
        )}
      </div>

      {/* Top accent bar */}
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

      {/* Title overlay - bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '144px 72px 72px',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            fontSize: 84,
            fontWeight: 700,
            color: '#fff',
            fontFamily: 'DM Serif Display',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
          }}
        >
          {dish.recipeName}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            marginTop: 24,
          }}
        >
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 39, fontWeight: 500 }}>
            {dish.cookTime}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 39 }}>{'·'}</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 39, fontWeight: 500 }}>
            {`${dish.stepCount} steps`}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 39 }}>{'·'}</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 39, fontWeight: 500 }}>
            {`${dish.ingredientCount} ingredients`}
          </div>
        </div>
      </div>
    </div>
  );
}

export function styleAIngredients({ dish, platform }: SlideProps): React.ReactElement {
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
        background: '#FAFAF8',
        position: 'relative',
        fontFamily: 'DM Sans',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top accent */}
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

      <div style={{ padding: '72px 84px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div
          style={{
            fontSize: 33,
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: '#E63946',
            marginBottom: 12,
          }}
        >
          INGREDIENTS
        </div>
        <div
          style={{
            fontSize: s.titleSize,
            fontWeight: 700,
            color: '#1a1a1a',
            fontFamily: 'DM Serif Display',
            marginBottom: s.titleMargin,
          }}
        >
          {dish.recipeName}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {ingredients.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 30,
                padding: `${s.padding}px 0`,
                borderBottom: i < ingredients.length - 1 ? '2px solid #f0ede8' : 'none',
              }}
            >
              <div style={{ fontSize: s.dotSize, flexShrink: 0, width: 50, textAlign: 'center' }}>
                {getIngredientEmoji(item)}
              </div>
              <div style={{ fontSize: s.fontSize, color: '#2a2a2a', fontWeight: 400, lineHeight: 1.3 }}>
                {item}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BiteClub branding */}
      {platform !== 'reddit' && (
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 18,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              background: '#E63946',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            BC
          </div>
          <div style={{ color: '#bbb', fontSize: 33, fontWeight: 600, letterSpacing: '0.05em' }}>
            BiteClub
          </div>
        </div>
      )}
    </div>
  );
}

export function styleASteps({ dish, platform }: SlideProps): React.ReactElement {
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
        background: '#FAFAF8',
        position: 'relative',
        fontFamily: 'DM Sans',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top accent */}
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

      <div style={{ padding: '72px 84px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div
          style={{
            fontSize: 33,
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: '#E63946',
            marginBottom: 12,
          }}
        >
          HOW TO COOK
        </div>
        <div
          style={{
            fontSize: s.titleSize,
            fontWeight: 700,
            color: '#1a1a1a',
            fontFamily: 'DM Serif Display',
            marginBottom: s.titleMargin,
          }}
        >
          {dish.recipeName}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {steps.map((step, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: s.gap,
                padding: `${s.padding}px 0`,
                borderBottom: i < steps.length - 1 ? '2px solid #f0ede8' : 'none',
              }}
            >
              <div
                style={{
                  width: s.circleSize,
                  height: s.circleSize,
                  borderRadius: s.circleSize / 2,
                  background: '#E63946',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: s.circleFontSize,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {String(i + 1)}
              </div>
              <div style={{ fontSize: s.fontSize, color: '#2a2a2a', lineHeight: 1.4, fontWeight: 400, paddingTop: 6 }}>
                {step}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BiteClub branding */}
      {platform !== 'reddit' && (
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 18,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              background: '#E63946',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            BC
          </div>
          <div style={{ color: '#bbb', fontSize: 33, fontWeight: 600, letterSpacing: '0.05em' }}>
            BiteClub
          </div>
        </div>
      )}
    </div>
  );
}
