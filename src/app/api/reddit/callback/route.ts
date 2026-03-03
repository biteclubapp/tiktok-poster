import { NextRequest, NextResponse } from 'next/server';
import { exchangeCode } from '@/lib/reddit';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    const tokens = await exchangeCode(code);
    return NextResponse.json({ success: true, username: tokens.username });
  } catch (error) {
    return NextResponse.json(
      { error: 'Reddit token exchange failed', details: String(error) },
      { status: 500 }
    );
  }
}
