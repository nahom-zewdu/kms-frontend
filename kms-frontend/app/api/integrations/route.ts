// app/api/integrations/route.ts
// This is a server route that handles POST requests to create or update company integrations (Slack or GitHub).
// It verifies that the user is authenticated and has admin access to the specified company before performing the database operation.

import { getUserContext } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const user = await getUserContext();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { companyId, provider, externalId } = await request.json();

  if (!companyId || !provider || !externalId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Verify user is admin of this company
  const membership = user.companies.find(c => c.id === companyId);
  if (!membership || membership.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabase = await createServerSupabase();

  const { error } = await supabase
    .from('company_integrations')
    .upsert({
      company_id: companyId,
      provider,
      external_id: externalId,
      is_active: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'company_id,provider' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
