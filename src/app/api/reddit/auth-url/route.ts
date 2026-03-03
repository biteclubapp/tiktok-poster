import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/reddit';

export async function GET() {
  try {
    const url = await getAuthUrl();
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate Reddit auth URL', details: String(error) },
      { status: 500 }
    );
  }
}
