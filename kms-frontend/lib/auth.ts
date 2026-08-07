// lib/auth.ts
// This file contains authentication-related functions for the KMS frontend application.
// It provides a function to get the user context, which includes user information, profile details, and company memberships.

import { createServerSupabase } from '@/lib/supabase-server';
import { cookies } from 'next/headers';

export async function getUserContext() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, plan')
    .eq('id', user.id)
    .single();

  // Get all companies the user belongs to
  const { data: memberships } = await supabase
    .from('company_members')
    .select(`
      role,
      is_owner,
      company:companies (
        id,
        name,
        created_at
      )
    `)
    .eq('user_id', user.id);

  const companies = (memberships || []).map((m: any) => ({
    id: m.company.id,
    name: m.company.name,
    role: m.role,
    is_owner: m.is_owner,
  }));

  // Active company from cookie
  const cookieStore = await cookies();
  const activeCompanyId = cookieStore.get('active_company_id')?.value || companies[0]?.id || null;

  const activeCompany = companies.find(c => c.id === activeCompanyId) || companies[0] || null;

  return {
    id: user.id,
    email: user.email,
    name: profile?.name || user.email?.split('@')[0] || 'User',
    plan: profile?.plan || 'starter',
    companies,
    activeCompany,
    isAdmin: activeCompany?.role === 'admin',
    isManager: ['admin', 'manager'].includes(activeCompany?.role || ''),
  };
}
