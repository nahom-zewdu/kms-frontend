// app/api/integrations/github/callback/route.ts
// This route handles the callback from GitHub after a user installs the GitHub app for a company.
// It verifies the installation ID and state, retrieves the installation details from GitHub, and saves the integration information in the database.

import { createAdminSupabase } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getInstallation } from '@/lib/github-app';

export async function GET(request: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const { searchParams } = new URL(request.url);

  const installationId = searchParams.get('installation_id');
  const setupAction = searchParams.get('setup_action');
  const stateRaw = searchParams.get('state');

  const cookieStore = await cookies();
  const storedState = cookieStore.get('github_app_state')?.value;

  console.log('[github/callback] cookie state present:', !!storedState);

  const stateStr = storedState || stateRaw;
  if (!installationId) {
    console.error('[github/callback] missing installation_id');
    return NextResponse.redirect(`${appUrl}/dashboard?error=github_missing_installation`);
  }
  if (!stateStr) {
    console.error('[github/callback] missing state (cookie + query)');
    return NextResponse.redirect(`${appUrl}/dashboard?error=github_missing_state`);
  }

  let state: { companyId: string; userId: string };
  try {
    state = JSON.parse(Buffer.from(stateStr, 'base64url').toString());
  } catch (e) {
    console.error('[github/callback] bad state', e);
    return NextResponse.redirect(`${appUrl}/dashboard?error=invalid_state`);
  }

  const installation = await getInstallation(Number(installationId));
  if (!installation) {
    console.error('[github/callback] getInstallation failed');
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

  if (error) {
    console.error('[github/callback] DB error:', error);
    return NextResponse.redirect(
      `${appUrl}/dashboard/c/${state.companyId}/settings?error=db`
    );
  }

  console.log('[github/callback] saved', state.companyId, installationId, accountLogin);

  return NextResponse.redirect(
    `${appUrl}/dashboard/c/${state.companyId}/settings?github=connected`
  );
}
