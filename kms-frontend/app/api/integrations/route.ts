// app/api/integrations/route.ts
// This is a server route that handles the retrieval and deletion of company integrations.
// It verifies that the user is authenticated and has access to the specified company before performing any actions.


import { getUserContext } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const user = await getUserContext();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');
  if (!companyId) return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });

  const membership = user.companies.find(c => c.id === companyId);
  if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('company_integrations')
    .select('id, provider, external_id, is_active, metadata, created_at')
    .eq('company_id', companyId)
    .eq('is_active', true);

  return NextResponse.json({ integrations: data || [] });
}

export async function DELETE(request: Request) {
  const user = await getUserContext();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { companyId, provider } = await request.json();
  const membership = user.companies.find(c => c.id === companyId);
  if (!membership || membership.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabase = await createServerSupabase();
  await supabase
    .from('company_integrations')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('company_id', companyId)
    .eq('provider', provider);

  return NextResponse.json({ ok: true });
}
