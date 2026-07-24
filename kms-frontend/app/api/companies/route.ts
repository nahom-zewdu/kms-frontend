// app/api/companies/route.ts
// This is the API route for creating a new company.

import { getUserContext } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const user = await getUserContext();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name } = await request.json();

  const supabase = await createServerSupabase();
  const companyId = `comp_${Date.now()}`;

  await supabase.from('companies').insert({ id: companyId, name });

  // Update user profile
  await supabase.from('profiles').update({ company_id: companyId, role: 'admin' }).eq('id', user.id);

  return NextResponse.json({ ok: true, company_id: companyId });
}
