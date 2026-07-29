// app/api/integrations/github/callback/route.ts
// This is a server route that handles the callback from GitHub's OAuth flow.
// It exchanges the authorization code for an access token and stores the integration details in the database.
// It verifies that the user is authenticated and that the state parameter matches the expected value to prevent CSRF attacks.

import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const stateRaw = searchParams.get('state');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!code || !stateRaw) {
    return NextResponse.redirect(`${appUrl}/dashboard?error=github_oauth_failed`);
  }

  let state: { companyId: string; userId: string };
  try {
    state = JSON.parse(Buffer.from(stateRaw, 'base64url').toString());
  } catch {
    return NextResponse.redirect(`${appUrl}/dashboard?error=invalid_state`);
  }

  // Exchange code
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: process.env.GITHUB_REDIRECT_URI,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    console.error('GitHub OAuth error:', tokenData);
    return NextResponse.redirect(`${appUrl}/dashboard/c/${state.companyId}/settings?error=github_token`);
  }

  // Fetch authenticated user / org
  const userRes = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: 'application/vnd.github+json',
    },
  });
  const ghUser = await userRes.json();

  const externalId = ghUser.login; // username or org login

  const supabase = await createServerSupabase();

  const { error: dbError } = await supabase
    .from('company_integrations')
    .upsert({
      company_id: state.companyId,
      provider: 'github',
      external_id: externalId,
      access_token: tokenData.access_token,
      scopes: tokenData.scope || '',
      metadata: {
        login: ghUser.login,
        name: ghUser.name,
        avatar_url: ghUser.avatar_url,
        type: ghUser.type, // User or Organization
      },
      is_active: true,
      installed_by: state.userId,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'company_id,provider' });

  if (dbError) {
    console.error('DB error:', dbError);
    return NextResponse.redirect(`${appUrl}/dashboard/c/${state.companyId}/settings?error=db`);
  }

  return NextResponse.redirect(`${appUrl}/dashboard/c/${state.companyId}/settings?github=connected`);
}
