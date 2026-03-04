import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { isValidStudioId, resolveVideoPath } from '@/lib/genai-studio';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isValidStudioId(id)) {
      return NextResponse.json({ error: 'Invalid video id' }, { status: 400 });
    }

    const videoPath = await resolveVideoPath(id);
    if (!videoPath) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const buffer = await readFile(videoPath);
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Studio video serving error:', error);
    return NextResponse.json({ error: 'Failed to load video' }, { status: 500 });
  }
}
