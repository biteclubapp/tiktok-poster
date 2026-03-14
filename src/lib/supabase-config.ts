const FALLBACK_SUPABASE_URL = 'https://axmgokdzqstnkiofcdbd.supabase.co';

function readEnv(names: string[]): string {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }

  throw new Error(`Missing environment variable. Tried: ${names.join(', ')}`);
}

export function getSupabaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL
    || process.env.SUPABASE_URL
    || process.env.EXPO_PUBLIC_SUPABASE_URL
    || FALLBACK_SUPABASE_URL
  );
}

export function getSupabasePublishableKey(): string {
  return readEnv([
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  ]);
}

export function getSupabaseServiceRoleKey(): string {
  return readEnv(['SUPABASE_SERVICE_ROLE_KEY']);
}

export function getDataSupabaseUrl(): string {
  return readEnv([
    'DATA_SUPABASE_URL',
    'NEXT_PUBLIC_DATA_SUPABASE_URL'
  ]);
}

export function getDataSupabaseServiceRoleKey(): string {
  return readEnv(['DATA_SUPABASE_SERVICE_ROLE_KEY']);
}

export function isSupabaseAuthConfigured(): boolean {
  return Boolean(
    getSupabaseUrl()
    && (
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    )
  );
}
