// lib/auth.ts
// Retrieves the current authenticated user's context, including profile information.

import { createServerSupabase } from '@/lib/supabase-server';

export async function getUserContext() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, role, name, plan')
    .eq('id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    name: profile?.name ?? user.email?.split('@')[0] ?? 'User',
    company_id: profile?.company_id ?? 'default',
    role: profile?.role ?? 'member',
    plan: profile?.plan ?? 'starter',
    activePlaybooks: 5,
    maxPlaybooks: (profile?.plan ?? 'starter') === 'pro' ? 999 : 10,
    isAdmin: profile?.role === 'admin',
    isManager: ['admin', 'manager'].includes(profile?.role ?? ''),
  };
}
