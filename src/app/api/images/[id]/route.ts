import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

const TMP_DIR = join(process.cwd(), 'tmp', 'carousel');

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
    const buffer = await readFile(join(TMP_DIR, filename));
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }
}
