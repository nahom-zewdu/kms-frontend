import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildGitHubAppState,
  encodeGitHubAppState,
  hashGitHubAppState,
  verifyGitHubAppState,
} from './github-app-state';

test('builds and verifies a valid GitHub OAuth state', () => {
  const state = buildGitHubAppState('company-123', 'user-456');
  const encoded = encodeGitHubAppState(state);

  const parsed = verifyGitHubAppState(encoded, 'user-456', 'company-123');
  assert.equal(parsed.companyId, 'company-123');
  assert.equal(parsed.userId, 'user-456');
  assert.equal(typeof parsed.nonce, 'string');
  assert.ok(parsed.exp > Date.now());
});

test('rejects tampered GitHub OAuth state', () => {
  const state = buildGitHubAppState('company-123', 'user-456');
  const encoded = encodeGitHubAppState(state);
  const tampered = encoded.slice(0, -1) + (encoded.at(-1) === 'A' ? 'B' : 'A');

  assert.throws(() => verifyGitHubAppState(tampered), /Invalid OAuth state signature|Malformed OAuth state/);
});

test('rejects expired GitHub OAuth state', () => {
  const state = buildGitHubAppState('company-123', 'user-456');
  const expired = { ...state, exp: Date.now() - 1000 };
  const encoded = encodeGitHubAppState(expired);

  assert.throws(() => verifyGitHubAppState(encoded), /Expired OAuth state/);
});

test('rejects missing or empty state values', () => {
  assert.throws(() => verifyGitHubAppState(null), /Missing OAuth state/);
  assert.throws(() => verifyGitHubAppState('   '), /Missing OAuth state/);
});

test('rejects state for the wrong authenticated user or company', () => {
  const state = buildGitHubAppState('company-123', 'user-456');
  const encoded = encodeGitHubAppState(state);

  assert.throws(() => verifyGitHubAppState(encoded, 'user-999', 'company-123'), /OAuth state user mismatch/);
  assert.throws(() => verifyGitHubAppState(encoded, 'user-456', 'company-999'), /OAuth state company mismatch/);
});

test('replay checks can detect reused state hashes', () => {
  const state = buildGitHubAppState('company-123', 'user-456');
  const encoded = encodeGitHubAppState(state);
  const replayMarker = hashGitHubAppState(encoded);

  assert.equal(replayMarker, hashGitHubAppState(encoded));
  assert.notEqual(replayMarker, hashGitHubAppState(encodeGitHubAppState(buildGitHubAppState('company-456', 'user-789'))));
});
