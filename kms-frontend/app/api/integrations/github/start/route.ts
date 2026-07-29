// app/api/integrations/github/start/route.ts
// This is a server route that initiates the GitHub OAuth flow for integrating a company with GitHub.
// It verifies that the user is authenticated and has admin access to the specified company before redirecting to GitHub's authorization page.

import { getUserContext } from '@/lib/auth';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

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

  const state = Buffer.from(JSON.stringify({
    companyId,
    userId: user.id,
    nonce: crypto.randomBytes(16).toString('hex'),
  })).toString('base64url');

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: process.env.GITHUB_REDIRECT_URI!,
    scope: 'repo read:org admin:repo_hook',
    state,
  });

  return NextResponse.redirect(`https://github.com/login/oauth/authorize?${params}`);
}
