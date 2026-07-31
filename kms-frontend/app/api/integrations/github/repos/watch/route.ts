// app/api/integrations/github/repos/watch/route.ts
// This API route allows a company to watch or unwatch a GitHub repository. 
// It checks the user's authentication and authorization, retrieves the GitHub access token from the database, and then creates or deletes a webhook on the specified repository. 
// The response indicates whether the operation was successful.

import { getUserContext } from '@/lib/auth';
import { createAdminSupabase } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  const user = await getUserContext();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { companyId, fullName, action } = await request.json();
  // action: 'watch' | 'unwatch'

  const membership = user.companies.find(c => c.id === companyId);
  if (!membership || membership.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabase = createAdminSupabase();
  const { data: integration } = await supabase
    .from('company_integrations')
    .select('access_token, webhook_secret')
    .eq('company_id', companyId)
    .eq('provider', 'github')
    .eq('is_active', true)
    .maybeSingle();

  if (!integration?.access_token) {
    return NextResponse.json({ error: 'GitHub not connected' }, { status: 400 });
  }

  const webhookUrl = process.env.GITHUB_WEBHOOK_URL; // e.g. https://api.yourdomain.com/github/
  const webhookSecret =
    integration.webhook_secret ||
    process.env.GITHUB_WEBHOOK_SECRET ||
    crypto.randomBytes(20).toString('hex');

  const headers = {
    Authorization: `Bearer ${integration.access_token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'KMS-App',
    'Content-Type': 'application/json',
  };

  if (action === 'watch') {
    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'GITHUB_WEBHOOK_URL not configured' },
        { status: 500 }
      );
    }

    const hookRes = await fetch(`https://api.github.com/repos/${fullName}/hooks`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'web',
        active: true,
        events: ['push', 'pull_request', 'issues'],
        config: {
          url: webhookUrl,
          content_type: 'json',
          secret: webhookSecret,
          insecure_ssl: '0',
        },
      }),
    });

    const hookData = await hookRes.json();
    if (!hookRes.ok) {
      console.error('Create hook failed:', hookData);
      return NextResponse.json(
        { error: hookData.message || 'Failed to create webhook' },
        { status: 400 }
      );
    }

    // Persist secret on integration if new
    if (!integration.webhook_secret) {
      await supabase
        .from('company_integrations')
        .update({ webhook_secret: webhookSecret })
        .eq('company_id', companyId)
        .eq('provider', 'github');
    }

    await supabase.from('company_repos').upsert(
      {
        company_id: companyId,
        full_name: fullName,
        github_repo_id: hookData.repo_id || null,
        webhook_id: hookData.id,
        is_active: true,
      },
      { onConflict: 'company_id,full_name' }
    );

    return NextResponse.json({ ok: true, webhook_id: hookData.id });
  }

  // unwatch
  const { data: row } = await supabase
    .from('company_repos')
    .select('webhook_id')
    .eq('company_id', companyId)
    .eq('full_name', fullName)
    .maybeSingle();

  if (row?.webhook_id) {
    await fetch(`https://api.github.com/repos/${fullName}/hooks/${row.webhook_id}`, {
      method: 'DELETE',
      headers,
    });
  }

  await supabase
    .from('company_repos')
    .update({ is_active: false })
    .eq('company_id', companyId)
    .eq('full_name', fullName);

  return NextResponse.json({ ok: true });
}
