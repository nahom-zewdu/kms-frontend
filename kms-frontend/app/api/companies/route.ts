// app/api/companies/route.ts
// This API route handles the creation of a new company for the authenticated user.
// It receives a POST request with the company name, creates the company in the database, and adds the user as an owner and admin of that company.

import { getUserContext } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const user = await getUserContext();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const supabase = await createServerSupabase();
  const companyId = `comp_${Date.now()}`;

  // Create company
  const { error: companyError } = await supabase
    .from('companies')
    .insert({ id: companyId, name: name.trim() });

  if (companyError) {
    return NextResponse.json({ error: companyError.message }, { status: 500 });
  }

  // Add user as owner + admin
  const { error: memberError } = await supabase
    .from('company_members')
    .insert({
      user_id: user.id,
      company_id: companyId,
      role: 'admin',
      is_owner: true,
    });

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, company_id: companyId });
}
