import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { isValidStudioId, resolveImagePath } from '@/lib/genai-studio';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isValidStudioId(id)) {
      return NextResponse.json({ error: 'Invalid image id' }, { status: 400 });
    }

    const imageFile = await resolveImagePath(id);
    if (!imageFile) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const buffer = await readFile(imageFile.imagePath);
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': imageFile.mimeType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Studio image serving error:', error);
    return NextResponse.json({ error: 'Failed to load image' }, { status: 500 });
  }
}
