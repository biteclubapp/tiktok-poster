import { NextRequest, NextResponse } from 'next/server';
import { generateCarousel } from '@/templates/render';
import { DishData, TemplateStyle } from '@/types';
import { buildDescriptiveSlidePrefix, persistGeneratedSlides } from '@/lib/carousel-slides';
import { randomUUID } from 'crypto';

const SAMPLE_DISH: DishData = {
  meal: {} as DishData['meal'],
  heroImageUrl: '',
  recipeName: 'Caesar Salad',
  cookName: 'johannes',
  cookInitial: 'J',
  cookTime: '20 min',
  ingredients: [
    'Chicken breast, sliced',
    'Onion, diced',
    'Fresh arugula',
    'Romaine lettuce',
    'Caesar dressing',
    'Shaved Parmesan cheese',
    'Black pepper',
    'Garlic cloves',
  ],
  instructions: [
    'Sear chicken breast in a hot pan until golden',
    'Add diced onion and garlic near the end',
    'Chop lettuce and arugula into bite-sized pieces',
    'Combine chicken, greens, and parmesan in a bowl',
    'Toss with Caesar dressing and black pepper',
    'Serve immediately while chicken is warm',
  ],
  stepCount: 6,
  ingredientCount: 8,
};

export async function GET(request: NextRequest) {
  const template = (request.nextUrl.searchParams.get('template') || 'A') as TemplateStyle;

  if (!['A', 'B', 'C', 'D', 'E', 'F'].includes(template)) {
    return NextResponse.json({ error: 'Invalid template' }, { status: 400 });
  }

  try {
    const jpegBuffers = await generateCarousel(SAMPLE_DISH, template);
    const batchId = randomUUID();
    const filenamePrefix = buildDescriptiveSlidePrefix(
      'preview',
      SAMPLE_DISH.recipeName,
      `template-${template}`
    );
    const persistedSlides = await persistGeneratedSlides(jpegBuffers, batchId, filenamePrefix);

    return NextResponse.json({
      slides: persistedSlides.slides.map((slide) => slide.previewUrl),
      template,
      batchId,
    });
  } catch (error) {
    console.error('Preview generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate preview', details: String(error) },
      { status: 500 }
    );
  }
}
