import { NextRequest, NextResponse } from 'next/server';
import { readSlideBuffer } from '@/lib/carousel-slides';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Sanitize filename to prevent directory traversal
  const filename = id.replace(/[^a-zA-Z0-9._-]/g, '');
  if (!filename.endsWith('.jpg')) {
    return NextResponse.json({ error: 'Invalid image' }, { status: 400 });
  }

  try {
    const buffer = await readSlideBuffer(`/api/images/${filename}`);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }
}
