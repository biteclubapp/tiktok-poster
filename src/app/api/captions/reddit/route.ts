import { NextRequest, NextResponse } from 'next/server';
import { generateRedditTitle } from '@/lib/genai-captions';

export async function POST(request: NextRequest) {
  try {
    const { dishData } = await request.json();
    if (!dishData?.recipeName) {
      return NextResponse.json({ error: 'Missing dishData' }, { status: 400 });
    }

    const result = await generateRedditTitle(dishData);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Reddit title error:', error);
    return NextResponse.json(
      { error: 'Failed to generate title', details: String(error) },
      { status: 500 }
    );
  }
}
