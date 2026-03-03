import { NextResponse } from 'next/server';
import { deleteTokens } from '@/lib/reddit';

export async function POST() {
  await deleteTokens();
  return NextResponse.json({ success: true });
}
