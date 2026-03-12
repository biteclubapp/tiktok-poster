/**
 * Server-side PostHog query client.
 *
 * Uses the PostHog HogQL Query API to pull community stats
 * from the main BiteClub app's PostHog project.
 *
 * Requires POSTHOG_PERSONAL_API_KEY and POSTHOG_PROJECT_ID in .env.local.
 */

// ── Config ───────────────────────────────────────────────────────────────────

function getPersonalApiKey(): string {
  return process.env.POSTHOG_PERSONAL_API_KEY || '';
}

function getProjectId(): string {
  return process.env.POSTHOG_PROJECT_ID || '';
}

function getHost(): string {
  return process.env.POSTHOG_HOST || 'https://app.posthog.com';
}

export function isPosthogConfigured(): boolean {
  return !!(getPersonalApiKey() && getProjectId());
}

// ── Types ────────────────────────────────────────────────────────────────────

interface HogQLResult {
  results: unknown[][];
  columns: string[];
  types: string[];
}

interface HogQLResponse {
  results: unknown[][];
  columns: string[];
  types: string[];
  error?: string;
}

export interface PostHogStat {
  label: string;
  value: string;
  unit?: string;
}

export interface PostHogStatsResponse {
  stats: PostHogStat[];
  title: string;
  callout: string;
}

// ── Core query function ──────────────────────────────────────────────────────

async function hogqlQuery(query: string): Promise<HogQLResult> {
  const host = getHost();
  const projectId = getProjectId();
  const apiKey = getPersonalApiKey();

  if (!apiKey || !projectId) {
    throw new Error('PostHog is not configured. Set POSTHOG_PERSONAL_API_KEY and POSTHOG_PROJECT_ID in .env.local');
  }

  const url = `${host}/api/projects/${projectId}/query/`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: {
        kind: 'HogQLQuery',
        query,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PostHog API error (${response.status}): ${text}`);
  }

  const data: HogQLResponse = await response.json();

  if (data.error) {
    throw new Error(`PostHog HogQL error: ${data.error}`);
  }

  return {
    results: data.results,
    columns: data.columns,
    types: data.types,
  };
}

// ── Query helpers ────────────────────────────────────────────────────────────

/**
 * Count occurrences of a specific event over a time period.
 * @param eventName - The PostHog event name (e.g. 'meal_post_success')
 * @param days - Number of days to look back (default 30)
 */
export async function getEventCount(eventName: string, days: number = 30): Promise<number> {
  const result = await hogqlQuery(
    `SELECT count() FROM events WHERE event = '${eventName}' AND timestamp >= now() - interval ${days} day`
  );
  return Number(result.results[0]?.[0] ?? 0);
}

/**
 * Count unique users who triggered any event in the given time period.
 * @param days - Number of days to look back (default 7)
 */
export async function getUniqueUserCount(days: number = 7): Promise<number> {
  const result = await hogqlQuery(
    `SELECT count(distinct distinct_id) FROM events WHERE timestamp >= now() - interval ${days} day`
  );
  return Number(result.results[0]?.[0] ?? 0);
}

/**
 * Count unique users who triggered a specific event.
 */
export async function getUniqueUsersForEvent(eventName: string, days: number = 30): Promise<number> {
  const result = await hogqlQuery(
    `SELECT count(distinct distinct_id) FROM events WHERE event = '${eventName}' AND timestamp >= now() - interval ${days} day`
  );
  return Number(result.results[0]?.[0] ?? 0);
}

/**
 * Get top N events by count in the given time period.
 * @param days - Number of days to look back (default 30)
 * @param limit - Max events to return (default 10)
 */
export async function getTopEvents(days: number = 30, limit: number = 10): Promise<{ event: string; count: number }[]> {
  const result = await hogqlQuery(
    `SELECT event, count() as cnt FROM events WHERE timestamp >= now() - interval ${days} day GROUP BY event ORDER BY cnt DESC LIMIT ${limit}`
  );
  return result.results.map((row) => ({
    event: String(row[0]),
    count: Number(row[1]),
  }));
}

/**
 * Get total signups (all time).
 */
export async function getTotalSignups(): Promise<number> {
  const result = await hogqlQuery(
    `SELECT count() FROM events WHERE event = 'signup'`
  );
  return Number(result.results[0]?.[0] ?? 0);
}

/**
 * Get the most popular screen/tab based on screen_view events.
 */
export async function getMostPopularScreen(days: number = 30): Promise<string> {
  const result = await hogqlQuery(
    `SELECT properties.$screen_name as screen, count() as cnt FROM events WHERE event = 'screen_view' AND timestamp >= now() - interval ${days} day GROUP BY screen ORDER BY cnt DESC LIMIT 1`
  );
  return result.results[0]?.[0] ? String(result.results[0][0]) : 'N/A';
}

// ── Aggregate stats for carousel ─────────────────────────────────────────────

/**
 * Fetch a comprehensive set of community stats, formatted for carousel use.
 * Runs multiple queries in parallel for speed.
 */
export async function getCommunityStats(): Promise<PostHogStatsResponse> {
  const [
    mealsShared,
    recipesCreated,
    activeUsers7d,
    totalLikes,
    totalComments,
    totalSignups,
    activeUsers30d,
    recipesSaved,
  ] = await Promise.all([
    getEventCount('meal_post_success', 9999),
    getEventCount('recipe_created', 9999),
    getUniqueUserCount(7),
    getEventCount('like', 9999),
    getEventCount('comment', 9999),
    getTotalSignups(),
    getUniqueUserCount(30),
    getEventCount('recipe_save_success', 9999),
  ]);

  function fmt(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
    return n.toLocaleString('en-US');
  }

  return {
    title: 'This Week on BiteClub',
    callout: `${fmt(activeUsers7d)} active cooks in the last 7 days`,
    stats: [
      { label: 'Meals shared', value: fmt(mealsShared), unit: 'total' },
      { label: 'Recipes created', value: fmt(recipesCreated), unit: 'total' },
      { label: 'Active users (7d)', value: fmt(activeUsers7d) },
      { label: 'Active users (30d)', value: fmt(activeUsers30d) },
      { label: 'Total likes', value: fmt(totalLikes) },
      { label: 'Comments', value: fmt(totalComments) },
      { label: 'Recipes saved', value: fmt(recipesSaved) },
      { label: 'Total signups', value: fmt(totalSignups) },
    ],
  };
}
