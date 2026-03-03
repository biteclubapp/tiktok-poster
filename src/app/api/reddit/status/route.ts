import { NextResponse } from 'next/server';
import { getValidTokens } from '@/lib/reddit';

export async function GET() {
  try {
    const tokens = await getValidTokens();
    if (tokens) {
      return NextResponse.json({ connected: true, username: tokens.username });
    }
    return NextResponse.json({ connected: false });
  } catch {
    return NextResponse.json({ connected: false });
  }
}
