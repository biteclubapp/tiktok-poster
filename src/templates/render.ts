import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { loadFonts } from '@/lib/fonts';
import { DishData, TemplateStyle } from '@/types';
import { WIDTH, HEIGHT, renderCTASlide, imageToBase64, Platform } from './shared';
import { styleAHero, styleAIngredients, styleASteps } from './styleA';
import { styleBHero, styleBIngredients, styleBSteps } from './styleB';
import { styleCHero, styleCIngredients, styleCSteps } from './styleC';
import { styleDHero, styleDIngredients, styleDSteps } from './styleD';
import { styleEHero, styleEIngredients, styleESteps } from './styleE';
import { styleFHero, styleFIngredients, styleFSteps } from './styleF';
import React from 'react';

const templateMap = {
  A: { hero: styleAHero, ingredients: styleAIngredients, steps: styleASteps },
  B: { hero: styleBHero, ingredients: styleBIngredients, steps: styleBSteps },
  C: { hero: styleCHero, ingredients: styleCIngredients, steps: styleCSteps },
  D: { hero: styleDHero, ingredients: styleDIngredients, steps: styleDSteps },
  E: { hero: styleEHero, ingredients: styleEIngredients, steps: styleESteps },
  F: { hero: styleFHero, ingredients: styleFIngredients, steps: styleFSteps },
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

// Pre-warm fonts on module load so first render is fast
let fontsPromise: ReturnType<typeof loadFonts> | null = null;
function getFonts() {
  if (!fontsPromise) fontsPromise = loadFonts();
  return fontsPromise;
}

async function renderJsxToJpeg(
  element: React.ReactElement,
  fonts: Awaited<ReturnType<typeof loadFonts>>
): Promise<Buffer> {
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

  // resvg: SVG -> PNG buffer (render at reduced size for speed, sharp upscales)
  const RENDER_WIDTH = Math.round(WIDTH * 0.6);
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: RENDER_WIDTH },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  // sharp: upscale to full 1080x1920 + convert to JPEG
  const jpegBuffer = await sharp(pngBuffer)
    .resize(WIDTH, HEIGHT, { kernel: 'lanczos3' })
    .jpeg({ quality: 88 })
    .toBuffer();

  return jpegBuffer;
}

export async function generateCarousel(
  dish: DishData,
  template: TemplateStyle,
  platform?: Platform
): Promise<Buffer[]> {
  const { hero, ingredients, steps } = templateMap[template];

  // Load fonts + fetch hero image + logo in parallel
  const logoPath = path.join(process.cwd(), 'public', 'tomatoonly.png');
  const logoBase64 = fs.existsSync(logoPath)
    ? `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`
    : '';

  const [fonts, heroImageBase64] = await Promise.all([
    getFonts(),
    dish.heroImageUrl ? imageToBase64(dish.heroImageUrl) : Promise.resolve(''),
  ]);

  const slideProps = { dish, heroImageBase64, platform };

  // Build slides dynamically — skip ingredients/steps if dish has none
  const slides: { element: React.ReactElement; name: string }[] = [
    { element: hero(slideProps), name: 'hero' },
  ];

  if (dish.ingredients.length > 0) {
    slides.push({ element: ingredients(slideProps), name: 'ingredients' });
  }

  if (dish.instructions.length > 0) {
    slides.push({ element: steps(slideProps), name: 'steps' });
  }

  // Skip CTA slide for Reddit
  if (platform !== 'reddit') {
    slides.push({ element: renderCTASlide(template, logoBase64), name: 'cta' });
  }

  // Render all slides in parallel
  const jpegBuffers = await Promise.all(
    slides.map(async ({ element, name }, i) => {
      try {
        return await renderJsxToJpeg(element, fonts);
      } catch (error) {
        console.error(`Failed to render slide ${i} (${name}) for template ${template}:`, error);
        throw error;
      }
    })
  );

  return jpegBuffers;
}
