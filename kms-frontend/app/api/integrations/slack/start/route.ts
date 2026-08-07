// app/api/integrations/slack/start/route.ts
// This is a server route that initiates the Slack OAuth flow for integrating a company with Slack.
// It verifies that the user is authenticated and has admin access to the specified company before redirecting to Slack's authorization page.

import { getUserContext } from '@/lib/auth';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { cookies } from 'next/headers';

function base64url(buf: Buffer) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function GET(request: Request) {
  const user = await getUserContext();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');
  if (!companyId) return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });

  const membership = user.companies.find(c => c.id === companyId);
  if (!membership || membership.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const codeVerifier = base64url(crypto.randomBytes(32));
  const codeChallenge = base64url(crypto.createHash('sha256').update(codeVerifier).digest());

  const state = base64url(Buffer.from(JSON.stringify({
    companyId,
    userId: user.id,
    nonce: crypto.randomBytes(8).toString('hex'),
  })));

  const cookieStore = await cookies();
  cookieStore.set('slack_oauth_verifier', codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });
  cookieStore.set('slack_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });

  const params = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID!,
    scope: 'channels:history,groups:history,chat:write,app_mentions:read,users:read,team:read',
    redirect_uri: process.env.SLACK_REDIRECT_URI!,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  return NextResponse.redirect(`https://slack.com/oauth/v2/authorize?${params}`);
}
