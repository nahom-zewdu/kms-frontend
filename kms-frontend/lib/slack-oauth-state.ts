import crypto from 'crypto';

export type SlackOAuthState = {
  companyId: string;
  userId: string;
  nonce: string;
  iat: number;
  exp: number;
};

const STATE_TTL_MS = 10 * 60 * 1000;

function getStateSecret(): string {
  const secret = process.env.SLACK_OAUTH_STATE_SECRET || process.env.NEXTAUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SLACK_OAUTH_STATE_SECRET is required in production');
  }
  return 'kms-dev-slack-state-secret';
}

export function buildSlackOAuthState(companyId: string, userId: string): SlackOAuthState {
  const cleanCompanyId = companyId.trim();
  const cleanUserId = userId.trim();
  if (!cleanCompanyId || !cleanUserId) throw new Error('companyId and userId are required');
  const now = Date.now();
  return {
    companyId: cleanCompanyId,
    userId: cleanUserId,
    nonce: crypto.randomBytes(16).toString('hex'),
    iat: now,
    exp: now + STATE_TTL_MS,
  };
}

export function encodeSlackOAuthState(state: SlackOAuthState): string {
  const payload = Buffer.from(JSON.stringify(state)).toString('base64url');
  const signature = crypto.createHmac('sha256', getStateSecret()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifySlackOAuthState(
  rawState: string | null | undefined,
  expectedUserId?: string,
  now = Date.now()
): SlackOAuthState {
  if (!rawState?.trim()) throw new Error('Missing OAuth state');
  const [payload, signature] = rawState.split('.');
  if (!payload || !signature) throw new Error('Malformed OAuth state');

  const expected = crypto.createHmac('sha256', getStateSecret()).update(payload).digest('base64url');
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== actualBuffer.length || !crypto.timingSafeEqual(expectedBuffer, actualBuffer)) {
    throw new Error('Invalid OAuth state signature');
  }

  let parsed: Partial<SlackOAuthState>;
  try {
    parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Partial<SlackOAuthState>;
  } catch {
    throw new Error('Invalid OAuth state payload');
  }

  if (!parsed.companyId || !parsed.userId || !parsed.nonce ||
      typeof parsed.iat !== 'number' || typeof parsed.exp !== 'number') {
    throw new Error('Incomplete OAuth state payload');
  }
  if (parsed.exp <= now || parsed.iat > now + 30_000 || parsed.exp - parsed.iat > STATE_TTL_MS) {
    throw new Error('Expired or invalid OAuth state time window');
  }
  if (expectedUserId && parsed.userId !== expectedUserId) throw new Error('OAuth state user mismatch');
  return parsed as SlackOAuthState;
}
