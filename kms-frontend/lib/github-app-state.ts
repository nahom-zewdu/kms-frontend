import crypto from 'crypto';

export type GitHubAppState = {
  companyId: string;
  userId: string;
  nonce: string;
  iat: number;
  exp: number;
};

const STATE_TTL_MS = 10 * 60 * 1000;

function getStateSecret(): string {
  const configuredSecret = process.env.GITHUB_APP_STATE_SECRET || process.env.NEXTAUTH_SECRET;
  if (configuredSecret) return configuredSecret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('GITHUB_APP_STATE_SECRET is required in production');
  }
  return 'kms-dev-github-state-secret';
}

export function buildGitHubAppState(companyId: string, userId: string): GitHubAppState {
  const cleanCompanyId = (companyId || '').trim();
  const cleanUserId = (userId || '').trim();
  if (!cleanCompanyId || !cleanUserId) {
    throw new Error('companyId and userId are required');
  }

  const now = Date.now();
  return {
    companyId: cleanCompanyId,
    userId: cleanUserId,
    nonce: crypto.randomBytes(16).toString('hex'),
    iat: now,
    exp: now + STATE_TTL_MS,
  };
}

export function encodeGitHubAppState(state: GitHubAppState): string {
  const payload = Buffer.from(JSON.stringify(state)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getStateSecret())
    .update(payload)
    .digest('base64url');

  return `${payload}.${signature}`;
}

export function verifyGitHubAppState(
  rawState: string | null | undefined,
  expectedUserId?: string,
  expectedCompanyId?: string,
  now = Date.now()
): GitHubAppState {
  if (!rawState || rawState.trim() === '') {
    throw new Error('Missing OAuth state');
  }

  const [payloadPart, signaturePart] = rawState.split('.');
  if (!payloadPart || !signaturePart) {
    throw new Error('Malformed OAuth state');
  }

  const expectedSignature = crypto
    .createHmac('sha256', getStateSecret())
    .update(payloadPart)
    .digest('base64url');

  const expectedSigBuffer = Buffer.from(expectedSignature);
  const actualSigBuffer = Buffer.from(signaturePart);
  if (expectedSigBuffer.length !== actualSigBuffer.length) {
    throw new Error('Invalid OAuth state signature');
  }

  if (!crypto.timingSafeEqual(expectedSigBuffer, actualSigBuffer)) {
    throw new Error('Invalid OAuth state signature');
  }

  let parsed: Partial<GitHubAppState>;
  try {
    parsed = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8')) as Partial<GitHubAppState>;
  } catch {
    throw new Error('Invalid OAuth state payload');
  }

  if (!parsed.companyId || !parsed.userId || !parsed.nonce || typeof parsed.iat !== 'number' || typeof parsed.exp !== 'number') {
    throw new Error('Incomplete OAuth state payload');
  }

  if (now > parsed.exp) {
    throw new Error('Expired OAuth state');
  }

  if (expectedUserId && parsed.userId !== expectedUserId) {
    throw new Error('OAuth state user mismatch');
  }

  if (expectedCompanyId && parsed.companyId !== expectedCompanyId) {
    throw new Error('OAuth state company mismatch');
  }

  return parsed as GitHubAppState;
}

export function hashGitHubAppState(rawState: string): string {
  return crypto.createHmac('sha256', getStateSecret()).update(rawState).digest('hex');
}
