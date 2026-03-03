import {
  getCachedSounds, cacheSounds,
  getCachedHashtags, cacheHashtags,
  type TrendingSound, type TrendingHashtag,
} from './db';

const CACHE_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour

// ——— Public API ———

export async function fetchTrendingSounds(): Promise<TrendingSound[]> {
  const cached = getCachedSounds(CACHE_MAX_AGE_MS);
  if (cached.length > 0) return cached;

  // Try scraping tokchart.com for live trending sounds
  const scraped = await scrapeTokChart();
  if (scraped.length > 0) {
    cacheSounds(scraped);
    return getCachedSounds(CACHE_MAX_AGE_MS);
  }

  // Fallback: seed with curated trending sounds (updated Feb/Mar 2026)
  cacheSounds(CURATED_SOUNDS);
  return getCachedSounds(CACHE_MAX_AGE_MS);
}

export async function fetchTrendingHashtags(): Promise<TrendingHashtag[]> {
  const cached = getCachedHashtags(CACHE_MAX_AGE_MS);
  if (cached.length > 0) return cached;

  // Hashtags are more stable — use curated list with real metrics
  cacheHashtags(CURATED_HASHTAGS);
  return getCachedHashtags(CACHE_MAX_AGE_MS);
}

// ——— Scraping ———

async function scrapeTokChart(): Promise<Omit<TrendingSound, 'id' | 'fetched_at'>[]> {
  // tokchart.com is JS-rendered and paywalled — scraping is unreliable.
  // Return empty to fall through to curated list.
  // In the future, this could be replaced with a proper API integration.
  return [];
}

// ——— Curated Data (updated from tokchart.com + buffer.com, Mar 2026) ———

const CURATED_SOUNDS: Omit<TrendingSound, 'id' | 'fetched_at'>[] = [
  { name: 'Kiss It Better', artist: 'Rihanna', score: 974 },
  { name: 'Forest (Stem Choir)', artist: 'Jonathan Sorrell', score: 967 },
  { name: 'Las Muñequitas', artist: 'Mr Plata & El Americano 4KT', score: 961 },
  { name: 'snowfall', artist: 'Øneheart & MaxGenetics', score: 950 },
  { name: 'CHANEL', artist: 'Tyla', score: 945 },
  { name: 'Stuck In The Middle', artist: 'TÁI', score: 940 },
  { name: 'The Keeper', artist: 'Bonobo', score: 935 },
  { name: 'Trap Queen', artist: 'Fetty Wap', score: 930 },
  { name: 'Snow Day', artist: 'Tabitha Meeks & Ryan Corn', score: 925 },
  { name: 'iloveitiloveitiloveit', artist: 'Bella Kay', score: 920 },
  { name: 'MUCHO FRIO', artist: 'DJ KEI', score: 915 },
  { name: 'Wishing Remix', artist: 'DJ Drama ft. Chris Brown', score: 910 },
  { name: 'FASHION ICON OUT JULY 24TH', artist: 'ZØMB', score: 905 },
  { name: 'Cycle Syncing Frequency', artist: 'Still Haven', score: 900 },
  { name: 'I Don\'t Just Talk I Do It', artist: 'Warren Macoo', score: 895 },
  { name: 'POP DAT THANG', artist: 'DaBaby', score: 890 },
  { name: 'Where This Flower Blooms', artist: 'Tyler, The Creator ft. Frank Ocean', score: 885 },
  { name: 'Say Please', artist: 'Fredo Bang', score: 880 },
  { name: 'Gymnopedie No.1', artist: 'Kamimura Mahiro', score: 875 },
  { name: 'Top Of Cars', artist: 'Lil M.U.', score: 870 },
  { name: 'Someone New', artist: 'Arden Jones', score: 865 },
  { name: 'Helle Natali', artist: 'Helle Natali', score: 860 },
  { name: 'I got like hella money', artist: 'Original Sound', score: 855 },
];

const CURATED_HASHTAGS: Omit<TrendingHashtag, 'id' | 'fetched_at'>[] = [
  { tag: '#cooking', posts: '7.6M', views: '197.5B', avg_views: '25.9K' },
  { tag: '#foodtiktok', posts: '7.1M', views: '185.7B', avg_views: '26.1K' },
  { tag: '#recipe', posts: '2.6M', views: '94.1B', avg_views: '35.7K' },
  { tag: '#foodtok', posts: '2.2M', views: '71.8B', avg_views: '33.1K' },
  { tag: '#tiktokfood', posts: '3.2M', views: '138.9B', avg_views: '43.6K' },
  { tag: '#foodie', posts: '10.7M', views: '215B', avg_views: '20K' },
  { tag: '#food', posts: '26.8M', views: '644.3B', avg_views: '24K' },
  { tag: '#delicious', posts: '2.9M', views: '62.8B', avg_views: '21.8K' },
  { tag: '#yummy', posts: '6M', views: '82.8B', avg_views: '13.8K' },
  { tag: '#chef', posts: '2.4M', views: '43.7B', avg_views: '18.4K' },
  { tag: '#dinner', posts: '2.8M', views: '34B', avg_views: '12.2K' },
  { tag: '#homecooking', posts: '1.2M', views: '22.4B', avg_views: '18.6K' },
  { tag: '#cookingasmr', posts: '27.7K', views: '1.9B', avg_views: '68.3K' },
  { tag: '#cookingtiktok', posts: '498.9K', views: '10.9B', avg_views: '21.8K' },
  { tag: '#cookinghacks', posts: '552.4K', views: '11B', avg_views: '19.9K' },
  { tag: '#cookingtips', posts: '298.5K', views: '5.5B', avg_views: '18.4K' },
  { tag: '#cookingvideo', posts: '281.6K', views: '5.3B', avg_views: '18.8K' },
  { tag: '#cook', posts: '1.5M', views: '30.9B', avg_views: '21.1K' },
  { tag: '#foodlover', posts: '3.9M', views: '62.4B', avg_views: '15.9K' },
  { tag: '#easyrecipe', posts: '1.1M', views: '28.7B', avg_views: '26.1K' },
  { tag: '#homemade', posts: '2.1M', views: '38.2B', avg_views: '18.2K' },
  { tag: '#LetHerCook', posts: '890K', views: '15.6B', avg_views: '17.5K' },
  { tag: '#comfortfood', posts: '670K', views: '12.1B', avg_views: '18K' },
  { tag: '#mealprep', posts: '1.4M', views: '25.8B', avg_views: '18.4K' },
  { tag: '#baking', posts: '3.8M', views: '72.1B', avg_views: '19K' },
];
