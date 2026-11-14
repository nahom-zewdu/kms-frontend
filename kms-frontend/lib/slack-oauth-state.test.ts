import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildSlackOAuthState,
  encodeSlackOAuthState,
  verifySlackOAuthState,
} from './slack-oauth-state';

test('signs and verifies a Slack OAuth state bound to user and company', () => {
  const state = buildSlackOAuthState('company-a', 'user-a');
  const encoded = encodeSlackOAuthState(state);
  const decoded = verifySlackOAuthState(encoded, 'user-a');
  assert.equal(decoded.companyId, 'company-a');
  assert.equal(decoded.userId, 'user-a');
});

test('rejects tampered Slack OAuth state', () => {
  const encoded = encodeSlackOAuthState(buildSlackOAuthState('company-a', 'user-a'));
  const tampered = encoded.slice(0, -1) + (encoded.endsWith('A') ? 'B' : 'A');
  assert.throws(() => verifySlackOAuthState(tampered), /signature|Malformed/);
});

test('rejects expired, missing, and wrong-user Slack OAuth state', () => {
  const state = buildSlackOAuthState('company-a', 'user-a');
  const expired = encodeSlackOAuthState({ ...state, exp: Date.now() - 1 });
  assert.throws(() => verifySlackOAuthState(expired), /time window/);
  assert.throws(() => verifySlackOAuthState(null), /Missing/);
  assert.throws(() => verifySlackOAuthState(encodeSlackOAuthState(state), 'user-b'), /user mismatch/);
});
