import { NextRequest, NextResponse } from 'next/server';
import { getValidTokens, publishGallery } from '@/lib/reddit';
import { readSlideBuffer } from '@/lib/carousel-slides';

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
      const buffer = await readSlideBuffer(String(slideUrl));
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
