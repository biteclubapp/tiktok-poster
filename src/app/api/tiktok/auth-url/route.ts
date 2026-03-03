import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/tiktok';

export async function GET() {
  const url = await getAuthUrl();
  return NextResponse.json({ url });
}
