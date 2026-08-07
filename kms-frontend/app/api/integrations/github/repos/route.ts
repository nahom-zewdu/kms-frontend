// app/api/integrations/github/repos/route.ts
// This route is used to fetch the list of repositories accessible to the GitHub app installation for a specific company.
// It requires the user to be authenticated and have access to the company, and it retrieves the installation ID from the database.

import { getUserContext } from '@/lib/auth';
import { createAdminSupabase } from '@/lib/supabase-admin';
import { listInstallationRepos } from '@/lib/github-app';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const user = await getUserContext();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const companyId = new URL(request.url).searchParams.get('companyId');
  if (!companyId) return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });

  const membership = user.companies.find(c => c.id === companyId);
  if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const supabase = createAdminSupabase();
  const { data: integration } = await supabase
    .from('company_integrations')
    .select('installation_id, external_id, metadata')
    .eq('company_id', companyId)
    .eq('provider', 'github')
    .eq('is_active', true)
    .maybeSingle();

  if (!integration?.installation_id) {
    return NextResponse.json({ error: 'GitHub App not installed', repos: [] }, { status: 400 });
  }

  const repos = await listInstallationRepos(Number(integration.installation_id));

  return NextResponse.json({
    repos: repos.map((r: any) => ({ ...r, watched: true })), // all installed repos are “watched”
    installation_id: integration.installation_id,
  });
}
