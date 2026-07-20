// api/auth/login/route.ts
// This route handles user login by accepting email and password in the request body.
// It authenticates with Supabase, sets the server cookie session, and returns a redirect on success.

import { createAdminSupabase } from '@/lib/supabase-admin';
import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordMinLength = 8;

function jsonResponse(payload: { ok: boolean; error?: string; redirect?: string }, status = 200) {
  return NextResponse.json(payload, { status });
}

function logAuthError(context: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[auth:login:${context}]`, message);
}

function isRateLimitError(message: string) {
  return /rate limit|too many|429/i.test(message);
}

async function ensureProfileIfMissing(userId: string, email: string) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;

  const adminSupabase = createAdminSupabase();
  const { data: existing, error: fetchError } = await adminSupabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (fetchError) {
    logAuthError('profile-check', fetchError);
    return;
  }

  if (existing?.id) {
    return;
  }

  const profileName = email.split('@')[0];
  const { error: upsertError } = await adminSupabase.from('profiles').upsert({
    id: userId,
    name: profileName,
    company_id: 'default',
  });

  if (upsertError) {
    logAuthError('profile-upsert', upsertError);
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const email = body?.email?.toString().trim();
  const password = body?.password?.toString();

  if (!email || !password) {
    return jsonResponse({ ok: false, error: 'Email and password are required.' }, 400);
  }

  if (!emailRegex.test(email)) {
    return jsonResponse({ ok: false, error: 'Enter a valid email address.' }, 400);
  }

  if (password.length < passwordMinLength) {
    return jsonResponse({ ok: false, error: 'Password must be at least 8 characters.' }, 400);
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    logAuthError('sign-in', error);
    const message = String(error.message ?? 'Unable to sign in. Please try again.');
    const status = isRateLimitError(message) ? 429 : 400;
    return jsonResponse({ ok: false, error: message }, status);
  }

  if (!data?.user || !data.session) {
    return jsonResponse({ ok: false, error: 'Login failed. Please check your credentials and try again.' }, 400);
  }

  const { error: setErr } = await supabase.auth.setSession({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });

  if (setErr) {
    logAuthError('set-session', setErr);
    return jsonResponse({ ok: false, error: 'Unable to establish a session. Please try again.' }, 500);
  }

  await ensureProfileIfMissing(data.user.id, email);

  return jsonResponse({ ok: true, redirect: '/dashboard' });
}
