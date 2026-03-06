import { NextRequest, NextResponse } from 'next/server';
import { generateTikTokCaption } from '@/lib/genai-captions';

export async function POST(request: NextRequest) {
  try {
    const { dishData } = await request.json();
    if (!dishData?.recipeName) {
      return NextResponse.json({ error: 'Missing dishData' }, { status: 400 });
    }

    const result = await generateTikTokCaption(dishData);
    return NextResponse.json(result);
  } catch (error) {
    console.error('TikTok caption error:', error);
    return NextResponse.json(
      { error: 'Failed to generate caption', details: String(error) },
      { status: 500 }
    );
  }
}
