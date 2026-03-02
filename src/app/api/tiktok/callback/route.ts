import { NextRequest, NextResponse } from 'next/server';
import { exchangeCode } from '@/lib/tiktok';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    const tokens = await exchangeCode(code);
    return NextResponse.json({ ok: true, open_id: tokens.open_id });
  } catch (error) {
    console.error('TikTok callback error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
