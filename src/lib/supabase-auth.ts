import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';
import { getSupabasePublishableKey, getSupabaseUrl } from '@/lib/supabase-config';

function applyCookies(
  cookieList: { name: string; value: string; options?: CookieOptions }[],
  setCookie: (name: string, value: string, options?: CookieOptions) => void
) {
  for (const { name, value, options } of cookieList) {
    setCookie(name, value, options);
  }
}

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          applyCookies(cookiesToSet, (name, value, options) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always mutate cookies; actions/routes can.
        }
      },
    },
  });
}

export function createProxySupabaseClient(request: NextRequest, response: NextResponse) {
  return createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        applyCookies(cookiesToSet, (name, value, options) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });
}
