import { NextRequest, NextResponse } from 'next/server';
import { exchangeCode } from '@/lib/instagram';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    const tokens = await exchangeCode(code);
    return NextResponse.json({ success: true, username: tokens.username });
  } catch (error) {
    console.error('Instagram callback error:', error);
    return NextResponse.json(
      { error: 'Failed to exchange token', details: String(error) },
      { status: 500 }
    );
  }
}
