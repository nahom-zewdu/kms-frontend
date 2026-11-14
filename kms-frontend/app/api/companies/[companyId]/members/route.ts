// app/api/companies/[companyId]/members/route.ts
// This API route handles fetching the list of members for a specific company in the KMS application.
// It checks the user's authentication and authorization before returning the member data.

import { getUserContext } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const user = await getUserContext();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const membership = user.companies.find(c => c.id === companyId);
  if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const supabase = await createServerSupabase();

  const { data } = await supabase
    .from('company_members')
    .select(`
      id,
      user_id,
      role,
      is_owner,
      profiles:user_id (
        name,
        email
      )
    `)
    .eq('company_id', companyId);

  const members = (data || []).map((member) => {
    const profile = Array.isArray(member.profiles)
      ? member.profiles[0]
      : member.profiles;
    return {
      id: member.id,
      user_id: member.user_id,
      role: member.role,
      is_owner: member.is_owner,
      name: profile?.name,
      email: profile?.email,
    };
  });

  return NextResponse.json({ members });
}