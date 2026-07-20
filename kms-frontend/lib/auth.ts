// lib/auth.ts
// This file contains the getUserContext function, which retrieves the current user's context from Supabase. 
// t fetches the user profile and company information based on the authenticated user's ID.
// The function returns an object containing user details such as id, email, name, company_id, plan, activePlaybooks, and maxPlaybooks. 
// If no user is authenticated, it returns null.
import { createServerSupabase } from '@/lib/supabase-server';

export async function getUserContext() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, role, name')
    .eq('id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    name: profile?.name ?? user.email?.split('@')[0] ?? 'User',
    company_id: profile?.company_id ?? 'default',
    plan: 'starter',
    activePlaybooks: 5,
    maxPlaybooks: 20,
  };
}
