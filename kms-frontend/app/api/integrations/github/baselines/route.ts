import { getUserContext } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const user = await getUserContext();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const companyId = new URL(request.url).searchParams.get('companyId');
  if (!companyId) {
    return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });
  }

  if (!user.companies.some((company) => company.id === companyId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('repositories')
    .select(
      'id, full_name, baseline_status, baseline_started_at, baseline_completed_at, baseline_error, baseline_file_count, baseline_revision, last_synced_at'
    )
    .eq('company_id', companyId)
    .order('full_name', { ascending: true });

  if (error) {
    console.error('[api/integrations/github/baselines]', error.message);
    return NextResponse.json(
      { error: 'Could not load repository indexing status.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ repositories: data ?? [] });
}
