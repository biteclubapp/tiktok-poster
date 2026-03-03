import { NextRequest, NextResponse } from 'next/server';
import { generateCarousel } from '@/templates/render';
import { CarouselRequest, TemplateStyle } from '@/types';
import { Platform } from '@/templates/shared';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

const TMP_DIR = join(process.cwd(), 'tmp', 'carousel');

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

    if (!['A', 'B', 'C'].includes(template)) {
      return NextResponse.json(
        { error: 'Invalid template. Must be A, B, or C' },
        { status: 400 }
      );
    }

    // Generate carousel slides
    const jpegBuffers = await generateCarousel(dishData, template as TemplateStyle, platform);

    // Save to tmp directory
    await mkdir(TMP_DIR, { recursive: true });
    const batchId = randomUUID();
    const slideUrls: string[] = [];

    for (let i = 0; i < jpegBuffers.length; i++) {
      const filename = `${batchId}-slide-${i}.jpg`;
      await writeFile(join(TMP_DIR, filename), jpegBuffers[i]);
      slideUrls.push(`/api/images/${filename}`);
    }

    return NextResponse.json({
      slides: slideUrls,
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
