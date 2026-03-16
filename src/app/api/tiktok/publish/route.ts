import { NextRequest, NextResponse } from 'next/server';
import { getValidTokens, publishCarousel } from '@/lib/tiktok';
import { ensureSlidePublicUrl } from '@/lib/carousel-slides';

export async function POST(request: NextRequest) {
  try {
    const tokens = await getValidTokens();
    if (!tokens) {
      return NextResponse.json(
        { error: 'Not authenticated with TikTok' },
        { status: 401 }
      );
    }

    const { slides, caption } = await request.json();

    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json(
        { error: 'No slides provided' },
        { status: 400 }
      );
    }

    // Upload each slide to Cloudflare Images to get public URLs
    const publicUrls: string[] = [];
    for (const slideUrl of slides) {
      const publicUrl = await ensureSlidePublicUrl(String(slideUrl));
      publicUrls.push(publicUrl);
    }

    // Publish to TikTok
    const result = await publishCarousel(
      tokens.access_token,
      publicUrls,
      caption || 'Recipe carousel from BiteClub'
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('TikTok publish error:', error);
    return NextResponse.json(
      { error: 'Failed to publish', details: String(error) },
      { status: 500 }
    );
  }
}
