'use server';

import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-auth';
import { isSupabaseAuthConfigured } from '@/lib/supabase-config';

function sanitizeRedirectTarget(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/';
  }

  return value;
}

function encodeMessage(message: string): string {
  return encodeURIComponent(message);
}

export async function login(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const next = sanitizeRedirectTarget(String(formData.get('next') || '/'));

  if (!isSupabaseAuthConfigured()) {
    redirect(`/login?error=${encodeMessage('Supabase auth is not configured yet. Add your publishable and service-role keys to continue.')}&next=${encodeURIComponent(next)}`);
  }

  if (!email || !password) {
    redirect(`/login?error=${encodeMessage('Enter your email and password.')}&next=${encodeURIComponent(next)}`);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeMessage(error.message)}&next=${encodeURIComponent(next)}`);
  }

  redirect(next);
}

export async function logout() {
  if (isSupabaseAuthConfigured()) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }

  redirect('/login');
}
