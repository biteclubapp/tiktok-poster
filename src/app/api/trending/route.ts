import { NextResponse } from 'next/server';
import { fetchTrendingSounds, fetchTrendingHashtags } from '@/lib/trending';

export async function GET() {
  try {
    const [sounds, hashtags] = await Promise.all([
      fetchTrendingSounds(),
      fetchTrendingHashtags(),
    ]);
    return NextResponse.json({ sounds, hashtags });
  } catch (error) {
    console.error('Failed to fetch trending data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending data' },
      { status: 500 }
    );
  }
}
