import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createScheduledPost, listScheduledPosts, updatePostStatus } from '@/lib/db';

export async function GET() {
  try {
    const posts = listScheduledPosts();
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Failed to list scheduled posts:', error);
    return NextResponse.json(
      { error: 'Failed to list scheduled posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dishData, template, caption, scheduledAt, slideUrls } = body;

    if (!dishData || !template || !caption || scheduledAt === undefined || scheduledAt === null) {
      return NextResponse.json(
        { error: 'Missing required fields: dishData, template, caption, scheduledAt' },
        { status: 400 }
      );
    }

    // Allow scheduledAt === 0 for queued (unscheduled) posts
    if (scheduledAt !== 0 && scheduledAt < Date.now()) {
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
        { status: 400 }
      );
    }

    const postId = randomUUID();
    const post = createScheduledPost({
      id: postId,
      dishData,
      template,
      caption,
      scheduledAt,
    });

    // Store slide URLs if provided
    if (slideUrls && Array.isArray(slideUrls) && slideUrls.length > 0) {
      updatePostStatus(postId, 'pending', { slide_urls: slideUrls });
    }

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Failed to create scheduled post:', error);
    return NextResponse.json(
      { error: 'Failed to create scheduled post' },
      { status: 500 }
    );
  }
}
