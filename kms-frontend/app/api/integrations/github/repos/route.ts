// app/api/integrations/github/repos/route.ts
// This API route fetches the list of GitHub repositories for a company that has connected their GitHub account.
// It checks the user's authentication and authorization, retrieves the GitHub access token from the database, and then fetches the user's repositories and organization repositories from the GitHub API. The response includes a list of repositories with their details and whether they are being watched by the company.

import { getUserContext } from '@/lib/auth';
import { createAdminSupabase } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const user = await getUserContext();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const companyId = new URL(request.url).searchParams.get('companyId');
  if (!companyId) return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });

  const membership = user.companies.find(c => c.id === companyId);
  if (!membership || membership.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabase = createAdminSupabase();
  const { data: integration } = await supabase
    .from('company_integrations')
    .select('access_token, external_id')
    .eq('company_id', companyId)
    .eq('provider', 'github')
    .eq('is_active', true)
    .maybeSingle();

  if (!integration?.access_token) {
    return NextResponse.json({ error: 'GitHub not connected' }, { status: 400 });
  }

  // User repos + org repos (first page each — enough for MVP)
  const headers = {
    Authorization: `Bearer ${integration.access_token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'KMS-App',
  };

  const [userReposRes, orgsRes] = await Promise.all([
    fetch('https://api.github.com/user/repos?per_page=100&sort=updated', { headers }),
    fetch('https://api.github.com/user/orgs', { headers }),
  ]);

  const userRepos = userReposRes.ok ? await userReposRes.json() : [];
  const orgs = orgsRes.ok ? await orgsRes.json() : [];

  let orgRepos: any[] = [];
  for (const org of orgs.slice(0, 5)) {
    const r = await fetch(
      `https://api.github.com/orgs/${org.login}/repos?per_page=100&sort=updated`,
      { headers }
    );
    if (r.ok) orgRepos = orgRepos.concat(await r.json());
  }

  const all = [...userRepos, ...orgRepos];
  const seen = new Set<number>();
  const repos = all
    .filter((r: any) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    })
    .map((r: any) => ({
      id: r.id,
      full_name: r.full_name,
      private: r.private,
      description: r.description,
    }));

  const { data: watched } = await supabase
    .from('company_repos')
    .select('full_name')
    .eq('company_id', companyId)
    .eq('is_active', true);

  const watchedSet = new Set((watched || []).map((w: any) => w.full_name));

  return NextResponse.json({
    repos: repos.map((r: any) => ({ ...r, watched: watchedSet.has(r.full_name) })),
  });
}
