import { NextResponse, type NextRequest } from 'next/server';
import { createProxySupabaseClient } from '@/lib/supabase-auth';
import { isSupabaseAuthConfigured } from '@/lib/supabase-config';

const PUBLIC_PATHS = new Set(['/login']);

function isApiPath(pathname: string) {
  return pathname.startsWith('/api/');
}

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.has(pathname);
}

function buildLoginRedirect(request: NextRequest, message?: string) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/login';
  loginUrl.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search);

  if (message) {
    loginUrl.searchParams.set('error', message);
  }

  return NextResponse.redirect(loginUrl);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    if (!isSupabaseAuthConfigured()) {
      return NextResponse.next({ request });
    }

    const response = NextResponse.next({ request });
    const supabase = createProxySupabaseClient(request, response);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return response;
  }

  if (!isSupabaseAuthConfigured()) {
    if (isApiPath(pathname)) {
      return NextResponse.json(
        { error: 'Supabase auth is not configured. Add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY and SUPABASE_SERVICE_ROLE_KEY.' },
        { status: 503 }
      );
    }

    return buildLoginRedirect(
      request,
      'Supabase auth is not configured. Add your publishable and service-role keys.'
    );
  }

  const response = NextResponse.next({ request });
  const supabase = createProxySupabaseClient(request, response);
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    return response;
  }

  if (isApiPath(pathname)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return buildLoginRedirect(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
