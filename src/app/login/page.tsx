import Image from 'next/image';
import { redirect } from 'next/navigation';
import AuthFormButton from '@/components/AuthFormButton';
import { login } from '@/app/login/actions';
import { createServerSupabaseClient } from '@/lib/supabase-auth';
import { isSupabaseAuthConfigured } from '@/lib/supabase-config';

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

function getSetupMessage() {
  return 'Add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY and SUPABASE_SERVICE_ROLE_KEY for https://axmgokdzqstnkiofcdbd.supabase.co.';
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = typeof params.next === 'string' ? params.next : '/';
  const error = typeof params.error === 'string' ? params.error : '';
  const configured = isSupabaseAuthConfigured();

  if (configured) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      redirect('/');
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.14),_transparent_34%),linear-gradient(180deg,_#fff7ed_0%,_#ffffff_42%,_#fff1f2_100%)] px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[2rem] border border-orange-100 bg-white/85 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur md:p-10">
            <div className="mb-10 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-red-100 bg-red-50">
                <Image
                  src="/tomatoonly.png"
                  alt="BiteClub"
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-red-500">
                  BiteClub Poster
                </p>
                <h1 className="mt-2 text-4xl font-semibold tracking-tight text-stone-900">
                  Invitation-only access.
                </h1>
              </div>
            </div>

            <p className="max-w-2xl text-base leading-7 text-stone-600">
              Sign in with the email address you were invited with. There is no public sign-up flow in the app.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Auth model</p>
                <p className="mt-2 text-sm text-stone-700">Supabase email/password with invited users only.</p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Protected areas</p>
                <p className="mt-2 text-sm text-stone-700">Home, Studio, Schedule, Streams, and API routes are gated.</p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Account setup</p>
                <p className="mt-2 text-sm text-stone-700">Invite users from Supabase Auth and keep public sign-ups disabled.</p>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div className="mb-6">
              <p className="text-sm font-medium text-stone-500">Admin login</p>
              <h2 className="mt-2 text-2xl font-semibold text-stone-900">Sign in to manage posts</h2>
            </div>

            {error ? (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {!configured ? (
              <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {getSetupMessage()}
              </div>
            ) : null}

            <form action={login} className="space-y-4">
              <input type="hidden" name="next" value={next} />

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-700">Email</span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@biteclub.com"
                  className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-red-400 focus:bg-white"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-700">Password</span>
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-red-400 focus:bg-white"
                />
              </label>

              <AuthFormButton
                label="Sign In"
                pendingLabel="Signing In..."
                className="w-full rounded-2xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </form>

            <p className="mt-4 text-sm leading-6 text-stone-500">
              Need access? Have an admin invite you in Supabase, then sign in here. No self-serve registration is exposed.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
