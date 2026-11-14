/**
 * Verify GitHub App credentials independently of the OAuth/install callback.
 *
 * Run from the frontend package directory:
 *   node scripts/verify-github-app-auth.mjs
 *
 * This script never prints the private key or generated JWT.
 */
import { createHash, createPrivateKey, createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

function loadPrivateKey() {
  const keyPath = process.env.GITHUB_APP_PRIVATE_KEY_PATH?.trim();
  const inlineKey = process.env.GITHUB_APP_PRIVATE_KEY;
  const source = keyPath ? 'GITHUB_APP_PRIVATE_KEY_PATH' : 'GITHUB_APP_PRIVATE_KEY';
  let value = keyPath ? readFileSync(keyPath, 'utf8') : inlineKey || '';

  value = value.trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) value = value.slice(1, -1);

  value = value.replaceAll('\\r\\n', '\n').replaceAll('\\n', '\n').replaceAll('\\r', '\n').trim();

  if (!value.startsWith('-----BEGIN')) {
    const decoded = Buffer.from(value, 'base64').toString('utf8').trim();
    if (decoded.startsWith('-----BEGIN') && decoded.includes('PRIVATE KEY-----')) value = decoded;
  }

  if (!value) throw new Error('No GitHub App private key is configured.');

  const key = createPrivateKey(value);
  if (key.asymmetricKeyType !== 'rsa') {
    throw new Error(`Expected an RSA private key; found ${key.asymmetricKeyType || 'unknown'}.`);
  }

  const publicDer = key.export({ type: 'spki', format: 'der' });
  const fingerprint = createHash('sha256').update(publicDer).digest('hex');
  return { key, source, fingerprint, modulusLength: key.asymmetricKeyDetails?.modulusLength };
}

async function main() {
  const appId = process.env.GITHUB_APP_ID?.trim();
  if (!appId || !/^\d+$/.test(appId)) {
    throw new Error('GITHUB_APP_ID must contain the numeric GitHub App ID.');
  }

  const { key, source, fingerprint, modulusLength } = loadPrivateKey();
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iat: now - 60,
    exp: now + 9 * 60,
    iss: Number(appId),
  })).toString('base64url');
  const unsigned = `${header}.${payload}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  const jwt = `${unsigned}.${signer.sign(key, 'base64url')}`;

  console.log('GitHub App authentication diagnostic');
  console.log(`Configured App ID: ${appId}`);
  console.log(`Private key source: ${source}`);
  console.log(`RSA modulus: ${modulusLength ?? 'unknown'} bits`);
  console.log(`Public-key SHA-256 fingerprint: ${fingerprint}`);
  console.log('Testing GET https://api.github.com/app ...');

  const response = await fetch('https://api.github.com/app', {
    headers: {
      Authorization: `Bearer ${jwt}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'KMS-GitHub-App-Diagnostic',
    },
  });

  const body = await response.json().catch(() => ({}));
  console.log(`HTTP status: ${response.status}`);

  if (!response.ok) {
    console.error(`GitHub response: ${body.message || 'No error message returned'}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Authenticated App ID: ${body.id}`);
  console.log(`Authenticated App name: ${body.name || 'unknown'}`);
  console.log(`Authenticated App slug: ${body.slug || 'unknown'}`);
  if (String(body.id) !== appId) {
    console.error('MISMATCH: the JWT authenticated as a different App ID than GITHUB_APP_ID.');
    process.exitCode = 1;
    return;
  }
  console.log('SUCCESS: this private key and App ID authenticate successfully with GitHub.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Diagnostic failed.');
  process.exitCode = 1;
});
