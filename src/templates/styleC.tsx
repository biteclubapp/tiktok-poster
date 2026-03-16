import React from 'react';
import { WIDTH, HEIGHT, SlideProps, getIngredientEmoji, getStepSizing, getIngredientSizing } from './shared';

// Style C: "Warm & Friendly"
// Cream bg (#FFF8F0), rounded elements, 2-column ingredients, DM Serif Display

export function styleCHero({ dish, heroImageBase64, platform }: SlideProps): React.ReactElement {
  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        borderRadius: 60,
        overflow: 'hidden',
        background: '#FFF8F0',
        position: 'relative',
        fontFamily: 'DM Sans',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Photo area with rounded inner frame */}
      <div
        style={{
          margin: '48px 48px 0',
          height: 900,
          borderRadius: 42,
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          background: heroImageBase64
            ? '#1a1a1a'
            : 'linear-gradient(135deg, #8B7355 0%, #A0522D 30%, #CD853F 60%, #DEB887 100%)',
        }}
      >
        {heroImageBase64 && (
          <img
            src={heroImageBase64}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}
      </div>

      {/* Info area */}
      <div style={{ padding: '36px 72px 48px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div
              style={{
                fontSize: 54,
                fontWeight: 700,
                color: '#2a2018',
                fontFamily: 'DM Serif Display',
              }}
            >
              {dish.recipeName}
            </div>
            <div
              style={{
                display: 'flex',
                gap: 24,
                marginTop: 16,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  background: '#E63946',
                  color: '#fff',
                  fontSize: 27,
                  fontWeight: 700,
                  padding: '8px 20px',
                  borderRadius: 12,
                  letterSpacing: '0.03em',
                }}
              >
                {dish.cookTime.toUpperCase()}
              </div>
              <div style={{ color: '#a09080', fontSize: 31 }}>
                {`${dish.ingredientCount} ingredients · ${dish.stepCount} steps`}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom accent */}
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
    </div>
  );
}

export function styleCIngredients({ dish, platform }: SlideProps): React.ReactElement {
  const maxIngredients = Math.min(dish.ingredients.length, 16);
  const ingredients = dish.ingredients.slice(0, maxIngredients);
  const s = getIngredientSizing(ingredients.length);
  const pillPadding = ingredients.length > 9 ? '24px 30px' : '36px 42px';
  const pillGap = ingredients.length > 9 ? 16 : 24;

  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        borderRadius: 60,
        overflow: 'hidden',
        background: '#FFF8F0',
        position: 'relative',
        fontFamily: 'DM Sans',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '72px 84px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div
          style={{
            display: 'flex',
            background: '#E63946',
            color: '#fff',
            fontSize: 30,
            fontWeight: 700,
            padding: '12px 30px',
            borderRadius: 12,
            letterSpacing: '0.1em',
            marginBottom: 24,
            alignSelf: 'flex-start',
          }}
        >
          INGREDIENTS
        </div>

        <div
          style={{
            fontSize: s.titleSize,
            fontWeight: 700,
            color: '#2a2018',
            fontFamily: 'DM Serif Display',
            marginBottom: s.titleMargin,
          }}
        >
          {dish.recipeName}
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: pillGap,
          }}
        >
          {ingredients.map((item, i) => (
            <div
              key={i}
              style={{
                background: '#fff',
                borderRadius: 24,
                padding: pillPadding,
                border: '2px solid #f0e8dc',
                width: '46%',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: s.dotSize, marginRight: 10, flexShrink: 0 }}>
                {getIngredientEmoji(item)}
              </div>
              <div style={{ fontSize: s.fontSize > 38 ? 34 : s.fontSize - 2, color: '#2a2018', fontWeight: 500, display: 'flex' }}>{item}</div>
            </div>
          ))}
        </div>
      </div>

      {/* BITECLUB branding */}
      {platform !== 'reddit' && (
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              color: '#d4c4b0',
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: '0.12em',
            }}
          >
            A grocery list built from real recipes wastes almost nothing. That's BiteClub doing its thing.
          </div>
        </div>
      )}

      {/* Bottom accent */}
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
    </div>
  );
}

export function styleCSteps({ dish, platform }: SlideProps): React.ReactElement {
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
        background: '#FFF8F0',
        position: 'relative',
        fontFamily: 'DM Sans',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '72px 84px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div
          style={{
            display: 'flex',
            background: '#E63946',
            color: '#fff',
            fontSize: 30,
            fontWeight: 700,
            padding: '12px 30px',
            borderRadius: 12,
            letterSpacing: '0.1em',
            marginBottom: 24,
            alignSelf: 'flex-start',
          }}
        >
          HOW TO COOK
        </div>

        <div
          style={{
            fontSize: s.titleSize,
            fontWeight: 700,
            color: '#2a2018',
            fontFamily: 'DM Serif Display',
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
              marginBottom: s.padding,
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                width: s.circleSize,
                height: s.circleSize,
                borderRadius: s.circleSize / 2,
                background: i === 0 ? '#E63946' : '#fff',
                borderWidth: i === 0 ? 0 : 3,
                borderStyle: 'solid',
                borderColor: i === 0 ? '#E63946' : '#e0d5c8',
                color: i === 0 ? '#fff' : '#2a2018',
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
            <div
              style={{
                fontSize: s.fontSize,
                color: '#2a2018',
                lineHeight: 1.4,
                fontWeight: 400,
                paddingTop: 4,
              }}
            >
              {step}
            </div>
          </div>
        ))}
      </div>

      {/* BITECLUB branding */}
      {platform !== 'reddit' && (
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              color: '#d4c4b0',
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: '0.12em',
            }}
          >
            The best part about following steps with a friend? You can blame them if it goes wrong. Try BiteClub.
          </div>
        </div>
      )}

      {/* Bottom accent */}
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
    </div>
  );
}
