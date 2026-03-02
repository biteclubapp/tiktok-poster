import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/tiktok';

export async function GET() {
  const url = getAuthUrl();
  return NextResponse.json({ url });
}
