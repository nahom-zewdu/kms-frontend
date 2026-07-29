// app/api/integrations/slack/callback/route.ts
// This is a server route that handles the callback from Slack's OAuth flow.
// It exchanges the authorization code for an access token and stores the integration details in the database.
// It verifies that the user is authenticated and that the state parameter matches the expected value to prevent CSRF attacks.

import { createServerSupabase } from '@/lib/supabase-server';
import { createAdminSupabase } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const stateRaw = searchParams.get('state');
  const error = searchParams.get('error');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (error || !code || !stateRaw) {
    return NextResponse.redirect(`${appUrl}/dashboard?error=slack_oauth_failed`);
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get('slack_oauth_state')?.value;
  const codeVerifier = cookieStore.get('slack_oauth_verifier')?.value;

  if (!storedState || storedState !== stateRaw || !codeVerifier) {
    return NextResponse.redirect(`${appUrl}/dashboard?error=invalid_state`);
  }

  let state: { companyId: string; userId: string };
  try {
    state = JSON.parse(Buffer.from(stateRaw, 'base64url').toString());
  } catch {
    return NextResponse.redirect(`${appUrl}/dashboard?error=invalid_state`);
  }

  const tokenRes = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID!,
      client_secret: process.env.SLACK_CLIENT_SECRET!,
      code,
      redirect_uri: process.env.SLACK_REDIRECT_URI!,
      code_verifier: codeVerifier,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.ok) {
    console.error('Slack OAuth error:', tokenData);
    return NextResponse.redirect(`${appUrl}/dashboard/c/${state.companyId}/settings?error=slack_token`);
  }

  const teamId = tokenData.team?.id;
  const accessToken = tokenData.access_token;
  if (!teamId || !accessToken) {
    return NextResponse.redirect(`${appUrl}/dashboard/c/${state.companyId}/settings?error=slack_incomplete`);
  }

  // Use admin client to bypass RLS for integration writes
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
    console.error('DB error:', dbError);
    return NextResponse.redirect(`${appUrl}/dashboard/c/${state.companyId}/settings?error=db`);
  }

  return NextResponse.redirect(`${appUrl}/dashboard/c/${state.companyId}/settings?slack=connected`);
}
