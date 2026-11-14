// lib/github-app.ts
// This module provides utility functions for interacting with the GitHub App API, including generating JWTs for authentication,
// fetching installation details, and listing repositories accessible to the app installation.

import { createPrivateKey, createSign } from 'crypto';
import { readFileSync } from 'fs';

function getPrivateKey() {
  const keyPath = process.env.GITHUB_APP_PRIVATE_KEY_PATH?.trim();
  const configuredKey = process.env.GITHUB_APP_PRIVATE_KEY;

  let value = keyPath
    ? readFileSync(keyPath, 'utf8')
    : configuredKey || '';

  // Support dotenv values with escaped newlines, CRLF files, and accidentally
  // quoted values without ever logging the private key itself.
  value = value
    .trim()
    .replace(/^(['"])([\\s\\S]*)\\1$/, '$2')
    .replace(/\\\\n/g, '\n')
    .replace(/\\r\\n/g, '\n')
    .replace(/\\r/g, '\n')
    .trim();

  // Some secret managers store the complete PEM as base64. Decode only when
  // the value itself is not PEM and the decoded value clearly is.
  if (!value.startsWith('-----BEGIN') && /^[A-Za-z0-9+/=\\s]+$/.test(value)) {
    const decoded = Buffer.from(value, 'base64').toString('utf8').trim();
    if (decoded.startsWith('-----BEGIN') && decoded.includes('PRIVATE KEY-----')) {
      value = decoded;
    }
  }

  if (!value) {
    throw new Error(
      'GitHub App private key is missing. Set GITHUB_APP_PRIVATE_KEY_PATH or GITHUB_APP_PRIVATE_KEY.'
    );
  }

  try {
    const key = createPrivateKey(value);
    if (key.asymmetricKeyType !== 'rsa') {
      throw new Error('The configured key is not an RSA private key.');
    }
    return key;
  } catch {
    throw new Error(
      'GitHub App private key is invalid. Configure the PEM private key downloaded from GitHub (BEGIN RSA PRIVATE KEY or BEGIN PRIVATE KEY), or set GITHUB_APP_PRIVATE_KEY_PATH to that PEM file. Do not use the App client secret, webhook secret, public key, or an OpenSSH key.'
    );
  }
}

/** JWT for GitHub App authentication (valid ~9 minutes) */
export function createAppJwt(): string {
  // GitHub App JWT authentication requires the numeric App ID as the issuer.
  const appId = process.env.GITHUB_APP_ID?.trim();

  if (!appId || !/^\\d+$/.test(appId)) {
    throw new Error('GITHUB_APP_ID must be configured as the numeric GitHub App ID.');
  }

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({ iat: now - 60, exp: now + 9 * 60, iss: Number(appId) })
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
