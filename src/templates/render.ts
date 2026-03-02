import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { loadFonts } from '@/lib/fonts';
import { DishData, TemplateStyle } from '@/types';
import { WIDTH, HEIGHT, renderCTASlide, imageToBase64 } from './shared';
import { styleAHero, styleAIngredients, styleASteps } from './styleA';
import { styleBHero, styleBIngredients, styleBSteps } from './styleB';
import { styleCHero, styleCIngredients, styleCSteps } from './styleC';
import React from 'react';

const templateMap = {
  A: { hero: styleAHero, ingredients: styleAIngredients, steps: styleASteps },
  B: { hero: styleBHero, ingredients: styleBIngredients, steps: styleBSteps },
  C: { hero: styleCHero, ingredients: styleCIngredients, steps: styleCSteps },
};

// Cache fetched emoji SVGs in memory
const emojiCache = new Map<string, string>();

async function loadEmoji(segment: string): Promise<string> {
  // Convert emoji to Twemoji code point format
  const codePoints = [...segment]
    .map((c) => c.codePointAt(0)!.toString(16))
    .filter((cp) => cp !== 'fe0f') // Remove variation selectors
    .join('-');

  if (emojiCache.has(codePoints)) {
    return emojiCache.get(codePoints)!;
  }

  try {
    const url = `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codePoints}.svg`;
    const res = await fetch(url);
    if (res.ok) {
      const svgText = await res.text();
      const dataUri = `data:image/svg+xml,${encodeURIComponent(svgText)}`;
      emojiCache.set(codePoints, dataUri);
      return dataUri;
    }
  } catch (e) {
    console.error(`Failed to load emoji ${segment}:`, e);
  }

  return '';
}

async function renderJsxToJpeg(element: React.ReactElement): Promise<Buffer> {
  const fonts = await loadFonts();

  // Satori: JSX -> SVG with emoji support via Twemoji
  const svg = await satori(element, {
    width: WIDTH,
    height: HEIGHT,
    fonts: fonts as Parameters<typeof satori>[1]['fonts'],
    loadAdditionalAsset: async (code: string, segment: string) => {
      if (code === 'emoji') {
        return loadEmoji(segment);
      }
      return '';
    },
  });

  // resvg: SVG -> PNG buffer
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: WIDTH },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  // sharp: PNG -> JPEG at quality 90
  const jpegBuffer = await sharp(pngBuffer).jpeg({ quality: 90 }).toBuffer();

  return jpegBuffer;
}

export async function generateCarousel(
  dish: DishData,
  template: TemplateStyle
): Promise<Buffer[]> {
  const { hero, ingredients, steps } = templateMap[template];

  // Fetch and convert hero image to base64
  let heroImageBase64 = '';
  if (dish.heroImageUrl) {
    heroImageBase64 = await imageToBase64(dish.heroImageUrl);
  }

  const slideProps = { dish, heroImageBase64 };

  // Build slides dynamically — skip ingredients/steps if dish has none
  const slides: React.ReactElement[] = [hero(slideProps)];
  const slideNames: string[] = ['hero'];

  if (dish.ingredients.length > 0) {
    slides.push(ingredients(slideProps));
    slideNames.push('ingredients');
  }

  if (dish.instructions.length > 0) {
    slides.push(steps(slideProps));
    slideNames.push('steps');
  }

  slides.push(renderCTASlide(template));
  slideNames.push('cta');
  const jpegBuffers: Buffer[] = [];
  for (let i = 0; i < slides.length; i++) {
    try {
      const buf = await renderJsxToJpeg(slides[i]);
      jpegBuffers.push(buf);
    } catch (error) {
      console.error(`Failed to render slide ${i} (${slideNames[i]}) for template ${template}:`, error);
      throw error;
    }
  }

  return jpegBuffers;
}
