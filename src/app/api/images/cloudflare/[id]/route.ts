import { NextRequest, NextResponse } from 'next/server';
import { loadCloudflareSlide } from '@/lib/carousel-slides';
import { isValidCloudflareImageId } from '@/lib/cloudflare-images';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isValidCloudflareImageId(id)) {
    return NextResponse.json({ error: 'Invalid image id' }, { status: 400 });
  }

  try {
    const slide = await loadCloudflareSlide(id);
    return new NextResponse(slide.buffer, {
      headers: {
        'Content-Type': slide.contentType,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Cloudflare image proxy error:', error);
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }
}
