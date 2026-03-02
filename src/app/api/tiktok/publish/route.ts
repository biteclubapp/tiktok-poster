import { NextRequest, NextResponse } from 'next/server';
import { getValidTokens, publishCarousel } from '@/lib/tiktok';
import { uploadImageToCloudflare } from '@/lib/cloudflare-images';
import { readFile } from 'fs/promises';
import { join } from 'path';

const TMP_DIR = join(process.cwd(), 'tmp', 'carousel');

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
      // Extract filename from /api/images/[filename]
      const filename = slideUrl.split('/').pop();
      if (!filename) continue;

      const buffer = await readFile(join(TMP_DIR, filename));
      const publicUrl = await uploadImageToCloudflare(buffer, filename);
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
