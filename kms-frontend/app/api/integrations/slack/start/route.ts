// Starts Slack OAuth for a company admin and binds the callback state to that user/company.

import { getUserContext } from '@/lib/auth';
import { buildSlackOAuthState, encodeSlackOAuthState } from '@/lib/slack-oauth-state';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { cookies } from 'next/headers';

function base64url(buf: Buffer) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function GET(request: Request) {
  const user = await getUserContext();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const companyId = new URL(request.url).searchParams.get('companyId');
  if (!companyId) return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });

  const membership = user.companies.find((company) => company.id === companyId);
  if (!membership || membership.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const clientId = process.env.SLACK_CLIENT_ID;
  const redirectUri = process.env.SLACK_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: 'Slack OAuth is not configured.' }, { status: 503 });
  }

  const codeVerifier = base64url(crypto.randomBytes(32));
  const codeChallenge = base64url(crypto.createHash('sha256').update(codeVerifier).digest());
  const state = encodeSlackOAuthState(buildSlackOAuthState(companyId, user.id));

  const cookieStore = await cookies();
  cookieStore.set('slack_oauth_verifier', codeVerifier, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', path: '/', maxAge: 600,
  });
  cookieStore.set('slack_oauth_state', state, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', path: '/', maxAge: 600,
  });

  const params = new URLSearchParams({
    client_id: clientId,
    scope: 'channels:history,groups:history,chat:write,app_mentions:read,users:read,team:read',
    redirect_uri: redirectUri,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  return NextResponse.redirect(`https://slack.com/oauth/v2/authorize?${params}`);
}
