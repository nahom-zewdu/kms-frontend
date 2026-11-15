// Verifies the signed, user-bound OAuth state before storing Slack credentials.

import { getUserContext } from '@/lib/auth';
import { createAdminSupabase } from '@/lib/supabase-admin';
import { verifySlackOAuthState } from '@/lib/slack-oauth-state';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const stateRaw = searchParams.get('state');
  const oauthError = searchParams.get('error');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const cookieStore = await cookies();

  if (oauthError || !code || !stateRaw) {
    cookieStore.delete('slack_oauth_verifier');
    cookieStore.delete('slack_oauth_state');
    return NextResponse.redirect(`${appUrl}/dashboard?error=slack_oauth_failed`);
  }

  const storedState = cookieStore.get('slack_oauth_state')?.value;
  const codeVerifier = cookieStore.get('slack_oauth_verifier')?.value;
  if (!storedState || storedState !== stateRaw || !codeVerifier) {
    return NextResponse.redirect(`${appUrl}/dashboard?error=invalid_state`);
  }

  const user = await getUserContext();
  if (!user) return NextResponse.redirect(`${appUrl}/login?error=slack_unauthorized`);

  let state;
  try {
    state = verifySlackOAuthState(stateRaw, user.id);
  } catch {
    return NextResponse.redirect(`${appUrl}/dashboard?error=invalid_state`);
  }

  const membership = user.companies.find((company) => company.id === state.companyId);
  if (!membership || membership.role !== 'admin') {
    return NextResponse.redirect(`${appUrl}/dashboard?error=slack_forbidden`);
  }

  const clientId = process.env.SLACK_CLIENT_ID;
  const clientSecret = process.env.SLACK_CLIENT_SECRET;
  const redirectUri = process.env.SLACK_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.redirect(`${appUrl}/dashboard/c/${state.companyId}/settings?error=slack_config`);
  }

  const tokenRes = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
    cache: 'no-store',
  });

  const tokenData = await tokenRes.json().catch(() => ({}));
  if (!tokenRes.ok || !tokenData.ok) {
    console.error('Slack OAuth token exchange failed:', tokenData.error || tokenRes.status);
    return NextResponse.redirect(`${appUrl}/dashboard/c/${state.companyId}/settings?error=slack_token`);
  }

  const teamId = tokenData.team?.id;
  const accessToken = tokenData.access_token;
  if (!teamId || !accessToken) {
    return NextResponse.redirect(`${appUrl}/dashboard/c/${state.companyId}/settings?error=slack_incomplete`);
  }

  const supabase = createAdminSupabase();
  const { error: dbError } = await supabase
    .from('company_integrations')
    .upsert({
      company_id: state.companyId,
      provider: 'slack',
      external_id: teamId,
      access_token: accessToken,
      scopes: tokenData.scope || '',
      metadata: {
        team_name: tokenData.team?.name,
        bot_user_id: tokenData.bot_user_id,
        app_id: tokenData.app_id,
      },
      is_active: true,
      installed_by: state.userId,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'company_id,provider' });

  cookieStore.delete('slack_oauth_verifier');
  cookieStore.delete('slack_oauth_state');

  if (dbError) {
    console.error('Slack integration persistence failed:', dbError.message);
    return NextResponse.redirect(`${appUrl}/dashboard/c/${state.companyId}/settings?error=db`);
  }

  return NextResponse.redirect(`${appUrl}/dashboard/c/${state.companyId}/settings?slack=connected`);
}
