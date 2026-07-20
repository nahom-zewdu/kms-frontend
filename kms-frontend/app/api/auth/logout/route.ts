// api/auth/logout/route.ts
// This route handles user logout by calling Supabase's signOut method.
// It clears the user's session and returns a consistent response format.

import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

function jsonResponse(payload: { ok: boolean; error?: string; redirect?: string }, status = 200) {
  return NextResponse.json(payload, { status });
}

function logAuthError(context: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[auth:logout:${context}]`, message);
}

export async function POST() {
  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.signOut();

    if (error) {
      logAuthError('sign-out', error);
      const message = String(error.message ?? 'Unable to sign out.');
      return jsonResponse({ ok: false, error: message }, 500);
    }

    return jsonResponse({ ok: true, redirect: '/login' });
  } catch (err) {
    logAuthError('unexpected', err);
    return jsonResponse({ ok: false, error: 'Unable to log out. Please try again.' }, 500);
  }
}
