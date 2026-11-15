// app/api/integrations/route.ts
// Integration credentials remain server-only. Every operation verifies the
// caller's company membership before using the privileged database client.

import { getUserContext } from '@/lib/auth';
import { createAdminSupabase } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const user = await getUserContext();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const companyId = new URL(request.url).searchParams.get('companyId');
  if (!companyId) return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });

  if (!user.companies.some((company) => company.id === companyId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from('company_integrations')
    .select('id, provider, external_id, is_active, metadata, created_at')
    .eq('company_id', companyId)
    .eq('is_active', true);

  if (error) {
    console.error('[api/integrations:get]', error.message);
    return NextResponse.json({ error: 'Failed to load integrations.' }, { status: 500 });
  }

  return NextResponse.json({ integrations: data ?? [] });
}

export async function DELETE(request: Request) {
  const user = await getUserContext();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { companyId, provider } = body as { companyId?: unknown; provider?: unknown };
  if (typeof companyId !== 'string' || typeof provider !== 'string' || !provider.trim()) {
    return NextResponse.json({ error: 'companyId and provider are required.' }, { status: 400 });
  }

  const membership = user.companies.find((company) => company.id === companyId);
  if (!membership || membership.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabase = createAdminSupabase();
  const { error } = await supabase
    .from('company_integrations')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('company_id', companyId)
    .eq('provider', provider);

  if (error) {
    console.error('[api/integrations:delete]', error.message);
    return NextResponse.json({ error: 'Failed to disconnect integration.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
