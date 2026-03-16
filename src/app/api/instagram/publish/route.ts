import { NextRequest, NextResponse } from 'next/server';
import { getValidTokens, publishCarousel } from '@/lib/instagram';
import { ensureSlidePublicUrl } from '@/lib/carousel-slides';

export async function POST(request: NextRequest) {
  try {
    const { slides, caption } = await request.json();

    if (!slides?.length) {
      return NextResponse.json({ error: 'No slides provided' }, { status: 400 });
    }

    const tokens = await getValidTokens();
    if (!tokens) {
      return NextResponse.json(
        { error: 'Instagram not connected. Please authenticate first.' },
        { status: 401 }
      );
    }

    // Upload each slide to Cloudflare Images to get public URLs
    // Instagram requires publicly accessible image URLs
    const publicUrls: string[] = [];
    for (const slideUrl of slides) {
      const publicUrl = await ensureSlidePublicUrl(String(slideUrl));
      publicUrls.push(publicUrl);
    }

    const result = await publishCarousel(
      tokens.access_token,
      tokens.user_id,
      publicUrls,
      caption || 'Recipe carousel from BiteClub'
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Instagram publish error:', error);
    return NextResponse.json(
      { error: 'Failed to publish to Instagram', details: String(error) },
      { status: 500 }
    );
  }
}
