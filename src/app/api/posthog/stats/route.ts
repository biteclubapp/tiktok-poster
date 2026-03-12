import { NextResponse } from 'next/server';
import { isPosthogConfigured, getCommunityStats, PostHogStatsResponse } from '@/lib/posthog';

// ── In-memory cache (1 hour TTL) ────────────────────────────────────────────

let cachedStats: PostHogStatsResponse | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function isCacheValid(): boolean {
  return cachedStats !== null && Date.now() - cacheTimestamp < CACHE_TTL_MS;
}

// ── GET /api/posthog/stats ───────────────────────────────────────────────────

export async function GET() {
  try {
    // Check if PostHog is configured
    if (!isPosthogConfigured()) {
      return NextResponse.json(
        {
          error: 'PostHog is not configured',
          message:
            'Set POSTHOG_PERSONAL_API_KEY and POSTHOG_PROJECT_ID in .env.local. ' +
            'Generate a personal API key at https://app.posthog.com/settings/user-api-keys',
        },
        { status: 503 }
      );
    }

    // Return cached data if still valid
    if (isCacheValid()) {
      return NextResponse.json({ ...cachedStats, cached: true });
    }

    // Fetch fresh stats from PostHog
    const stats = await getCommunityStats();

    // Update cache
    cachedStats = stats;
    cacheTimestamp = Date.now();

    return NextResponse.json({ ...stats, cached: false });
  } catch (error) {
    console.error('[PostHog Stats] Error fetching stats:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch PostHog stats',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
