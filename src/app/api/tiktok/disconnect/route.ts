import { NextResponse } from 'next/server';
import { deleteTokens } from '@/lib/tiktok';

export async function POST() {
  await deleteTokens();
  return NextResponse.json({ ok: true });
}
