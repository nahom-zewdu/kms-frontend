// lib/github-app.ts
// This module provides utility functions for interacting with the GitHub App API, including generating JWTs for authentication,
// fetching installation details, and listing repositories accessible to the app installation.

import { createSign } from 'crypto';
import { readFileSync } from 'fs';

function getPrivateKey(): string {
  if (process.env.GITHUB_APP_PRIVATE_KEY_PATH) {
    return readFileSync(process.env.GITHUB_APP_PRIVATE_KEY_PATH, 'utf8');
  }
  return (process.env.GITHUB_APP_PRIVATE_KEY || '').replace(/\\n/g, '\n');
}

/** JWT for GitHub App authentication (valid ~9 minutes) */
export function createAppJwt(): string {
  const appId = process.env.GITHUB_APP_ID!;
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({ iat: now - 60, exp: now + 9 * 60, iss: appId })
  ).toString('base64url');
  const data = `${header}.${payload}`;
  const sign = createSign('RSA-SHA256');
  sign.update(data);
  const signature = sign.sign(getPrivateKey(), 'base64url');
  return `${data}.${signature}`;
}

export async function getInstallation(installationId: number) {
  const jwt = createAppJwt();
  const res = await fetch(`https://api.github.com/app/installations/${installationId}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'KMS-App',
    },
  });
  if (!res.ok) {
    console.error('getInstallation failed', await res.text());
    return null;
  }
  return res.json();
}

export async function getInstallationToken(installationId: number): Promise<string | null> {
  const jwt = createAppJwt();
  const res = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'KMS-App',
      },
    }
  );
  if (!res.ok) {
    console.error('getInstallationToken failed', await res.text());
    return null;
  }
  const data = await res.json();
  return data.token as string;
}

export async function listInstallationRepos(installationId: number) {
  const token = await getInstallationToken(installationId);
  if (!token) return [];

  const res = await fetch(
    'https://api.github.com/installation/repositories?per_page=100',
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'KMS-App',
      },
    }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.repositories || []).map((r: any) => ({
    id: r.id,
    full_name: r.full_name,
    private: r.private,
    description: r.description,
  }));
}
