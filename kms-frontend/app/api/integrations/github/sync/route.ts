import { getUserContext } from '@/lib/auth';
import { createAdminSupabase } from '@/lib/supabase-admin';
import { listInstallationRepos } from '@/lib/github-app';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const user = await getUserContext();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!user.accessToken) {
    return NextResponse.json({ error: 'A valid Supabase access token is required.' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const companyId = String(body?.companyId || '').trim();
  const repoFullName = String(body?.repo || '').trim();

  if (!companyId || !repoFullName || !/^[^/]+\/[^/]+$/.test(repoFullName)) {
    return NextResponse.json({ error: 'A valid companyId and owner/repository name are required.' }, { status: 400 });
  }

  const membership = user.companies.find((company) => company.id === companyId);
  if (!membership || membership.role !== 'admin') {
    return NextResponse.json({ error: 'Only company admins can index repositories.' }, { status: 403 });
  }

  try {
    const supabase = createAdminSupabase();
    const { data: integration, error: integrationError } = await supabase
      .from('company_integrations')
      .select('installation_id')
      .eq('company_id', companyId)
      .eq('provider', 'github')
      .eq('is_active', true)
      .maybeSingle();

    if (integrationError) throw integrationError;
    if (!integration?.installation_id) {
      return NextResponse.json({ error: 'GitHub is not connected for this company.' }, { status: 409 });
    }

    const installedRepos = await listInstallationRepos(Number(integration.installation_id));
    const selectedRepo = installedRepos.find((repo: { full_name: string }) => repo.full_name === repoFullName);
    if (!selectedRepo) {
      return NextResponse.json({ error: 'Repository is not available to this company GitHub installation.' }, { status: 403 });
    }

    // The queue endpoint resolves repositories through this table. Seed the first
    // record only after verifying the repository belongs to this installation.
    const { data: existing, error: lookupError } = await supabase
      .from('repositories')
      .select('id, company_id')
      .eq('full_name', repoFullName)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (existing && existing.company_id !== companyId) {
      return NextResponse.json({ error: 'This repository is already registered to another company.' }, { status: 409 });
    }

    if (!existing) {
      const { error: insertError } = await supabase.from('repositories').insert({
        company_id: companyId,
        full_name: repoFullName,
        default_branch: 'main',
      });
      if (insertError) throw insertError;
    }

    const { error: statusError } = await supabase
      .from('repositories')
      .update({
        baseline_status: 'indexing',
        baseline_started_at: new Date().toISOString(),
        baseline_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq('company_id', companyId)
      .eq('full_name', repoFullName);
    if (statusError) throw statusError;

    const goUrl = process.env.GO_API_URL || 'http://localhost:9090';
    const query = new URLSearchParams({ repo: repoFullName, company_id: companyId });
    const response = await fetch(`${goUrl.replace(/\/+$/, '')}/github/sync-baseline?${query}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${user.accessToken}` },
      cache: 'no-store',
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      await supabase
        .from('repositories')
        .update({
          baseline_status: 'failed',
          baseline_error: 'Could not queue baseline indexing. Try again.',
          updated_at: new Date().toISOString(),
        })
        .eq('company_id', companyId)
        .eq('full_name', repoFullName);
    }

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error('[github] repository baseline sync failed', error);
    return NextResponse.json({ error: 'Could not queue repository indexing. Try again.' }, { status: 500 });
  }
}
