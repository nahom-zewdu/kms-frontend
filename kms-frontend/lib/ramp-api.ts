const NLP_API_URL = process.env.NLP_API_URL || 'http://localhost:8000';

export class MissingRampAccessTokenError extends Error {
  constructor() {
    super('A verified Supabase access token is required to call the Ramp API.');
    this.name = 'MissingRampAccessTokenError';
  }
}

export async function fetchRampApi(
  path: string,
  {
    accessToken,
    companyId,
    request = {},
  }: {
    accessToken: string | null;
    companyId: string;
    request?: RequestInit;
  },
  fetcher: typeof fetch = fetch
) {
  if (typeof accessToken !== 'string' || accessToken.trim().length === 0) {
    throw new MissingRampAccessTokenError();
  }

  if (!path.startsWith('?') && !path.startsWith('/')) {
    throw new Error('Ramp API path must be relative to /ramp-plans.');
  }

  const headers = new Headers(request.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);
  headers.set('X-Company-Id', companyId);

  return fetcher(`${NLP_API_URL.replace(/\/+$/, '')}/ramp-plans${path}`, {
    ...request,
    cache: 'no-store',
    headers,
  });
}
