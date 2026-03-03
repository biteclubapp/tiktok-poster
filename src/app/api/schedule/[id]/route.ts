import { NextRequest, NextResponse } from 'next/server';
import { deleteScheduledPost, updateScheduledPost, getScheduledPost } from '@/lib/db';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = deleteScheduledPost(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Post not found or not in pending status' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to delete scheduled post:', error);
    return NextResponse.json(
      { error: 'Failed to delete scheduled post' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { scheduledAt, caption } = body;

    const existing = getScheduledPost(id);
    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (existing.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only edit pending posts' },
        { status: 400 }
      );
    }

    if (scheduledAt && scheduledAt < Date.now()) {
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
        { status: 400 }
      );
    }

    const updated = updateScheduledPost(id, { scheduledAt, caption });

    if (!updated) {
      return NextResponse.json(
        { error: 'No changes made' },
        { status: 400 }
      );
    }

    const post = getScheduledPost(id);
    return NextResponse.json(post);
  } catch (error) {
    console.error('Failed to update scheduled post:', error);
    return NextResponse.json(
      { error: 'Failed to update scheduled post' },
      { status: 500 }
    );
  }
}
