import { NextRequest, NextResponse } from 'next/server';
import { generateInfoCarousel, InfoCarouselData, InfoTemplateStyle } from '@/templates/info-render';
import { buildDescriptiveSlidePrefix, persistGeneratedSlides } from '@/lib/carousel-slides';
import { randomUUID } from 'crypto';

const VALID_STYLES: InfoTemplateStyle[] = ['A', 'B', 'C', 'D', 'E', 'F'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, style } = body as { data: InfoCarouselData; style: InfoTemplateStyle };

    if (!data || !style) {
      return NextResponse.json({ error: 'Missing data or style' }, { status: 400 });
    }

    if (!VALID_STYLES.includes(style)) {
      return NextResponse.json({ error: 'Invalid style. Must be A–F.' }, { status: 400 });
    }

    if (!['cook_together', 'community_spotlight', 'biteclub_stats', 'this_or_that'].includes(data.type)) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    // Basic field validation per type
    if (data.type === 'cook_together' && (!data.title || !data.date || !data.menu?.length)) {
      return NextResponse.json({ error: 'cook_together requires title, date, and menu[]' }, { status: 400 });
    }
    if (data.type === 'community_spotlight' && (!data.username || !data.highlights?.length)) {
      return NextResponse.json({ error: 'community_spotlight requires username and highlights[]' }, { status: 400 });
    }
    if (data.type === 'biteclub_stats' && (!data.title || !data.stats?.length)) {
      return NextResponse.json({ error: 'biteclub_stats requires title and stats[]' }, { status: 400 });
    }
    if (data.type === 'this_or_that' && !data.rounds?.length) {
      return NextResponse.json({ error: 'this_or_that requires rounds[]' }, { status: 400 });
    }

    const jpegBuffers = await generateInfoCarousel(data, style);
    const batchId = randomUUID();
    const primaryLabel =
      data.type === 'community_spotlight'
        ? data.username
        : data.title;
    const filenamePrefix = buildDescriptiveSlidePrefix(
      'info',
      data.type,
      primaryLabel,
      `style-${style}`
    );
    const persistedSlides = await persistGeneratedSlides(jpegBuffers, batchId, filenamePrefix);

    return NextResponse.json({
      slides: persistedSlides.slides.map((slide) => slide.previewUrl),
      style,
      batchId,
    });
  } catch (error) {
    console.error('Info carousel generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate info carousel', details: String(error) },
      { status: 500 }
    );
  }
}
