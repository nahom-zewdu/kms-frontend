// app/api/integrations/github/start/route.ts
// This route is used to start the GitHub integration flow. 
// It generates a state parameter, stores it in a cookie, and redirects the user to the GitHub app installation page.

import { getUserContext } from '@/lib/auth';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const user = await getUserContext();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const companyId = new URL(request.url).searchParams.get('companyId');
  if (!companyId) return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });

  const membership = user.companies.find(c => c.id === companyId);
  if (!membership || membership.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const state = Buffer.from(
    JSON.stringify({
      companyId,
      userId: user.id,
      nonce: crypto.randomBytes(8).toString('hex'),
    })
  ).toString('base64url');

  const cookieStore = await cookies();
  cookieStore.set('github_app_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });

  const slug = process.env.GITHUB_APP_SLUG!;
  // state is passed through; GitHub also supports redirect_uri on some flows
  const url = `https://github.com/apps/${slug}/installations/new?state=${state}`;

  return NextResponse.redirect(url);
}
