import { NextResponse } from 'next/server';
import { getValidTokens } from '@/lib/tiktok';

export async function GET() {
  const tokens = await getValidTokens();
  if (!tokens) {
    return NextResponse.json({ connected: false });
  }
  return NextResponse.json({
    connected: true,
    open_id: tokens.open_id,
    username: tokens.open_id, // TikTok doesn't return username directly from token
  });
}
