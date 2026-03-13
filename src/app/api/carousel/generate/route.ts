import { NextRequest, NextResponse } from 'next/server';
import { generateCarousel } from '@/templates/render';
import { CarouselRequest, TemplateStyle } from '@/types';
import { Platform } from '@/templates/shared';
import { writeFile, mkdir, readdir, unlink, stat } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

const TMP_DIR = join(process.cwd(), 'tmp', 'carousel');

// Clean up carousel tmp files older than 2 hours to prevent disk bloat
async function cleanupOldCarousels() {
  try {
    const files = await readdir(TMP_DIR);
    const cutoff = Date.now() - 2 * 60 * 60 * 1000;
    await Promise.all(
      files.map(async (file) => {
        if (!file.endsWith('.jpg')) return;
        try {
          const s = await stat(join(TMP_DIR, file));
          if (s.mtimeMs < cutoff) {
            await unlink(join(TMP_DIR, file));
          }
        } catch {
          // File already gone or unreadable — ignore
        }
      })
    );
  } catch {
    // Directory doesn't exist yet — fine
  }
}

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

    // Save to tmp directory (and kick off async cleanup — don't await)
    await mkdir(TMP_DIR, { recursive: true });
    void cleanupOldCarousels();
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
