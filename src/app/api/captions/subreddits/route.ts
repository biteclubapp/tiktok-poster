import { NextRequest, NextResponse } from 'next/server';
import { recommendSubreddits } from '@/lib/genai-captions';

export async function POST(request: NextRequest) {
  try {
    const { dishData } = await request.json();
    if (!dishData?.recipeName) {
      return NextResponse.json({ error: 'Missing dishData' }, { status: 400 });
    }

    const result = await recommendSubreddits(dishData);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Subreddit recommendation error:', error);
    return NextResponse.json(
      { error: 'Failed to recommend subreddits', details: String(error) },
      { status: 500 }
    );
  }
}
