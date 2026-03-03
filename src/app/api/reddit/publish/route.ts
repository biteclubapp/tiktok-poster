import { NextRequest, NextResponse } from 'next/server';
import { getValidTokens, publishGallery } from '@/lib/reddit';
import { readFile } from 'fs/promises';
import { join } from 'path';

const TMP_DIR = join(process.cwd(), 'tmp', 'carousel');

export async function POST(request: NextRequest) {
  try {
    const { slides, title, subreddit } = await request.json();

    if (!slides?.length || !title || !subreddit) {
      return NextResponse.json(
        { error: 'Missing slides, title, or subreddit' },
        { status: 400 }
      );
    }

    const tokens = await getValidTokens();
    if (!tokens) {
      return NextResponse.json(
        { error: 'Reddit not connected. Please authenticate first.' },
        { status: 401 }
      );
    }

    // Read JPEG buffers from tmp directory
    const imageBuffers: Buffer[] = [];
    for (const slideUrl of slides) {
      // slideUrl is like /api/images/uuid-slide-0.jpg
      const filename = slideUrl.split('/').pop()!;
      const buffer = await readFile(join(TMP_DIR, filename));
      imageBuffers.push(buffer);
    }

    const result = await publishGallery(
      tokens.access_token,
      imageBuffers,
      title,
      subreddit
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Reddit publish error:', error);
    return NextResponse.json(
      { error: 'Failed to publish to Reddit', details: String(error) },
      { status: 500 }
    );
  }
}
