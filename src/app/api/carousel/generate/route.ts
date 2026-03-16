import { NextRequest, NextResponse } from 'next/server';
import { generateCarousel } from '@/templates/render';
import { CarouselRequest, TemplateStyle } from '@/types';
import { Platform } from '@/templates/shared';
import { buildDescriptiveSlidePrefix, persistGeneratedSlides } from '@/lib/carousel-slides';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dishData, template, platform } = body as CarouselRequest & { platform?: Platform };

    if (!dishData || !template) {
      return NextResponse.json(
        { error: 'Missing dishData or template' },
        { status: 400 }
      );
    }

    if (!['A', 'B', 'C', 'D', 'E', 'F'].includes(template)) {
      return NextResponse.json(
        { error: 'Invalid template. Must be A, B, C, D, E, or F' },
        { status: 400 }
      );
    }

    // Generate carousel slides
    const jpegBuffers = await generateCarousel(dishData, template as TemplateStyle, platform);
    const batchId = randomUUID();
    const filenamePrefix = buildDescriptiveSlidePrefix(
      'recipe',
      dishData.recipeName,
      platform || 'social',
      `template-${template}`
    );
    const persistedSlides = await persistGeneratedSlides(jpegBuffers, batchId, filenamePrefix);

    return NextResponse.json({
      slides: persistedSlides.slides.map((slide) => slide.previewUrl),
      template,
      batchId,
    });
  } catch (error) {
    console.error('Carousel generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate carousel', details: String(error) },
      { status: 500 }
    );
  }
}
