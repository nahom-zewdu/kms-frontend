// lib/auth.ts
// This file contains the getUserContext function, which retrieves the current user's context from Supabase. 
// t fetches the user profile and company information based on the authenticated user's ID.
// The function returns an object containing user details such as id, email, name, company_id, plan, activePlaybooks, and maxPlaybooks. 
// If no user is authenticated, it returns null.
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getUserContext() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: () => cookieStore }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;
      
  // Fetch user profile + company
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, role, name')
    .eq('id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    name: profile?.name || user.email?.split('@')[0],
    company_id: profile?.company_id || 'default',
    plan: 'starter', // TODO: subscription logic
    activePlaybooks: 5, // TODO: real count
    maxPlaybooks: 20,
  };
}
