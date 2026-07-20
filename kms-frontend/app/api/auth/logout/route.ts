// api/auth/logout/route.ts
// This route handles user logout by calling Supabase's signOut method. 
// It clears the user's session and returns a JSON response indicating success and provides a redirect URL to the login page. 
// If there is an error during the sign-out process, it returns an appropriate error message.
import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, redirect: '/login' });
}
