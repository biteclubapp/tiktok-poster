import { NextRequest, NextResponse } from 'next/server';
import { fetchDishes } from '@/lib/supabase';
import { signImageUrls } from '@/lib/cloudflare-images';

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get('search') || undefined;
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '200', 10);

  try {
    const meals = await fetchDishes(limit, search);

    // Collect all image IDs for signing
    const allImageIds = meals.flatMap((meal: Record<string, unknown>) =>
      ((meal.media as Record<string, unknown>[]) || []).map(
        (m: Record<string, unknown>) => m.cloudflare_image_id as string
      )
    );

    // Sign URLs in batch
    const signedUrls = await signImageUrls(allImageIds);

    // Attach signed URLs to media
    const mealsWithUrls = meals.map((meal: Record<string, unknown>) => ({
      ...meal,
      media: ((meal.media as Record<string, unknown>[]) || []).map(
        (m: Record<string, unknown>) => ({
          ...m,
          signed_url: signedUrls[m.cloudflare_image_id as string] || null,
        })
      ),
    }));

    return NextResponse.json({ meals: mealsWithUrls });
  } catch (error) {
    console.error('Error fetching dishes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dishes' },
      { status: 500 }
    );
  }
}
