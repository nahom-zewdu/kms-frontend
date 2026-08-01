// app/api/integrations/github/callback/route.ts
// This route is used to handle the callback from GitHub after a user installs or updates the GitHub app for a company.
// It verifies the state parameter, fetches the installation details from GitHub, and updates the company's integration record in the database.

import { createAdminSupabase } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getInstallation, getInstallationToken } from '@/lib/github-app';

export async function GET(request: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const { searchParams } = new URL(request.url);

  const installationId = searchParams.get('installation_id');
  const setupAction = searchParams.get('setup_action'); // install | update
  const stateRaw = searchParams.get('state');

  const cookieStore = await cookies();
  const storedState = cookieStore.get('github_app_state')?.value;

  // Prefer cookie state; fall back to query state
  const stateStr = storedState || stateRaw;
  if (!installationId || !stateStr) {
    return NextResponse.redirect(`${appUrl}/dashboard?error=github_install_failed`);
  }

  let state: { companyId: string; userId: string };
  try {
    state = JSON.parse(Buffer.from(stateStr, 'base64url').toString());
  } catch {
    return NextResponse.redirect(`${appUrl}/dashboard?error=invalid_state`);
  }

  const installation = await getInstallation(Number(installationId));
  if (!installation) {
    return NextResponse.redirect(
      `${appUrl}/dashboard/c/${state.companyId}/settings?error=github_install_fetch`
    );
  }

  const accountLogin = installation.account.login;
  const accountType = installation.account.type;

  const supabase = createAdminSupabase();

  const { error } = await supabase.from('company_integrations').upsert(
    {
      company_id: state.companyId,
      provider: 'github',
      external_id: accountLogin,
      installation_id: Number(installationId),
      account_login: accountLogin,
      account_type: accountType,
      access_token: null, // installation tokens are minted on demand
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

  if (error) {
    console.error('DB error:', error);
    return NextResponse.redirect(
      `${appUrl}/dashboard/c/${state.companyId}/settings?error=db`
    );
  }

  return NextResponse.redirect(
    `${appUrl}/dashboard/c/${state.companyId}/settings?github=connected`
  );
}
