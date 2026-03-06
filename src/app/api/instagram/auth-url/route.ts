import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/instagram';

export async function GET() {
  try {
    const url = await getAuthUrl();
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Instagram auth URL error:', error);
    return NextResponse.json(
      { error: 'Failed to generate auth URL', details: String(error) },
      { status: 500 }
    );
  }
}
