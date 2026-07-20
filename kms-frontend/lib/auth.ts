// lib/auth.ts
// Retrieves the current authenticated user's context, including profile information.

import { createServerSupabase } from '@/lib/supabase-server';

export async function getUserContext() {
  const supabase = await createServerSupabase();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.error('[auth] getUser error', userError.message ?? userError);
    return null;
  }

  const user = userData?.user;
  if (!user) return null;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('company_id, role, name')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('[auth] profile fetch error', profileError.message ?? profileError);
  }

  return {
    id: user.id,
    email: user.email ?? null,
    name: profile?.name ?? user.email?.split('@')[0] ?? 'User',
    company_id: profile?.company_id ?? 'default',
    plan: 'starter',
    activePlaybooks: 5,
    maxPlaybooks: 20,
  };
}
