// app/api/integrations/github/callback/route.ts
// This route handles the callback from GitHub after a user installs the GitHub app for a company.
// It verifies the installation ID and state, retrieves the installation details from GitHub, and saves the integration information in the database.

import { createAdminSupabase } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getInstallation } from '@/lib/github-app';
import { getUserContext } from '@/lib/auth';
import { hashGitHubAppState, verifyGitHubAppState } from '@/lib/github-app-state';

export async function GET(request: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const { searchParams } = new URL(request.url);

  const installationId = searchParams.get('installation_id');
  const setupAction = searchParams.get('setup_action');
  const stateRaw = searchParams.get('state');

  if (!installationId || !/^[0-9]+$/.test(installationId)) {
    return NextResponse.redirect(`${appUrl}/dashboard?error=github_missing_installation`);
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get('github_app_state')?.value;
  const usedStateHash = cookieStore.get('github_app_state_used')?.value;

  if (!storedState || !stateRaw || storedState !== stateRaw) {
    return NextResponse.redirect(`${appUrl}/dashboard?error=github_missing_state`);
  }

  const replayHash = hashGitHubAppState(stateRaw);
  if (usedStateHash && usedStateHash === replayHash) {
    return NextResponse.redirect(`${appUrl}/dashboard?error=github_state_reused`);
  }

  let state: { companyId: string; userId: string };
  try {
    state = verifyGitHubAppState(stateRaw);
  } catch {
    return NextResponse.redirect(`${appUrl}/dashboard?error=invalid_state`);
  }

  const user = await getUserContext();
  if (!user) {
    return NextResponse.redirect(`${appUrl}/dashboard?error=github_unauthorized`);
  }

  if (user.id !== state.userId) {
    return NextResponse.redirect(`${appUrl}/dashboard?error=github_unauthorized`);
  }

  const membership = user.companies.find(c => c.id === state.companyId);
  if (!membership || membership.role !== 'admin') {
    return NextResponse.redirect(`${appUrl}/dashboard/c/${state.companyId}?error=github_forbidden`);
  }

  if (setupAction && !['install', 'update', 'delete'].includes(setupAction)) {
    return NextResponse.redirect(`${appUrl}/dashboard/c/${state.companyId}/settings?error=invalid_setup_action`);
  }

  const installation = await getInstallation(Number(installationId));
  if (!installation) {
    return NextResponse.redirect(
      `${appUrl}/dashboard/c/${state.companyId}/settings?error=github_install_fetch`
    );
  }

  const accountLogin = installation.account?.login;
  const accountType = installation.account?.type;

  const supabase = createAdminSupabase();
  const { error } = await supabase.from('company_integrations').upsert(
    {
      company_id: state.companyId,
      provider: 'github',
      external_id: accountLogin,
      installation_id: Number(installationId),
      account_login: accountLogin,
      account_type: accountType,
      access_token: null,
      metadata: {
        installation_id: Number(installationId),
        account_login: accountLogin,
        account_type: accountType,
        setup_action: setupAction,
        html_url: installation.html_url,
      },
      is_active: true,
      installed_by: state.userId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'company_id,provider' }
  );

  cookieStore.delete('github_app_state');
  cookieStore.set('github_app_state_used', replayHash, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 600,
  });

  if (error) {
    return NextResponse.redirect(
      `${appUrl}/dashboard/c/${state.companyId}/settings?error=db`
    );
  }

  return NextResponse.redirect(
    `${appUrl}/dashboard/c/${state.companyId}/settings?github=connected`
  );
}
