// lib/auth.ts
// This file contains authentication-related functions for the KMS frontend application.
// It provides a function to get the user context, which includes user information, profile details, and company memberships.

import { createServerSupabase } from '@/lib/supabase-server';
import { isAuthSessionMissingError } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { cache } from 'react';

export const getUserContext = cache(async function getUserContext() {
  const supabase = await createServerSupabase();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    if (isAuthSessionMissingError(error)) return null;
    throw error;
  }
  if (!user) return null;

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (!session || session.user.id !== user.id || !session.access_token) {
    throw new Error('Supabase verified a user but did not return a matching access-token session.');
  }

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

  const companies = (memberships || []).flatMap((membership: {
    role: string;
    is_owner: boolean;
    company: { id: string; name: string } | { id: string; name: string }[] | null;
  }) => {
    const company = Array.isArray(membership.company)
      ? membership.company[0]
      : membership.company;
    if (!company) return [];
    return [{
      id: company.id,
      name: company.name,
      role: membership.role,
      is_owner: membership.is_owner,
    }];
  });

  // Active company from cookie
  const cookieStore = await cookies();
  const activeCompanyId = cookieStore.get('active_company_id')?.value || companies[0]?.id || null;

  const activeCompany = companies.find(c => c.id === activeCompanyId) || companies[0] || null;
  const plan = profile?.plan || 'starter';
  let activePlaybooks = 0;

  if (activeCompany) {
    const { count, error: playbooksError } = await supabase
      .from('playbooks')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', activeCompany.id)
      .eq('is_active', true);

    if (playbooksError) {
      throw new Error(`Failed to load active playbook count: ${playbooksError.message}`);
    }

    activePlaybooks = count ?? 0;
  }

  return {
    id: user.id,
    email: user.email,
    name: profile?.name || user.email?.split('@')[0] || 'User',
    plan,
    activePlaybooks,
    maxPlaybooks: plan === 'pro' ? null : 10,
    companies,
    activeCompany,
    accessToken: session.access_token,
    isAdmin: activeCompany?.role === 'admin',
    isManager: ['admin', 'manager'].includes(activeCompany?.role || ''),
  };
});
