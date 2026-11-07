import test from 'node:test';
import assert from 'node:assert/strict';

import { fetchRampApi, MissingRampAccessTokenError } from './ramp-api';

test('forwards the verified Supabase access token unchanged to the Ramp plan endpoint', async () => {
  const token = 'user-access-token-value';
  const companyId = 'company-123';
  const role = 'backend-engineer';
  const calls: Array<{ url: string; init?: RequestInit }> = [];

  const response = await fetchRampApi(
    `?${new URLSearchParams({ company_id: companyId, role })}`,
    {
      accessToken: token,
      companyId,
      request: { headers: { Authorization: 'internal-service-secret' } },
    },
    async (input, init) => {
      calls.push({ url: String(input), init });
      return new Response('{"plan":{}}', { status: 200 });
    }
  );

  assert.equal(calls.length, 1);
  const expectedBase = (process.env.NLP_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
  assert.equal(
    calls[0].url,
    `${expectedBase}/ramp-plans?company_id=${companyId}&role=${role}`
  );
  assert.equal(new Headers(calls[0].init?.headers).get('Authorization'), `Bearer ${token}`);
  assert.equal(new Headers(calls[0].init?.headers).get('X-Company-Id'), companyId);
  assert.equal(calls[0].init?.cache, 'no-store');
  assert.equal(response.status, 200);
});

test('does not make a Ramp request when the Supabase access token is missing', async () => {
  let called = false;

  await assert.rejects(
    fetchRampApi(
      '?company_id=company-123&role=backend-engineer',
      { accessToken: null, companyId: 'company-123' },
      async () => {
        called = true;
        return new Response(null);
      }
    ),
    MissingRampAccessTokenError
  );

  assert.equal(called, false);
});

test('preserves Ramp 401 and 403 responses without treating them as local session errors', async () => {
  for (const status of [401, 403]) {
    const response = await fetchRampApi(
      '?company_id=company-123&role=backend-engineer',
      { accessToken: 'user-access-token-value', companyId: 'company-123' },
      async () => new Response('{"error":"denied"}', { status })
    );

    assert.equal(response.status, status);
  }
});
