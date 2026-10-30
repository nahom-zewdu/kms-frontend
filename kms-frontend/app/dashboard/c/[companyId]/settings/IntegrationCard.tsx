'use client';
import { useEffect, useState } from 'react';
import GitHubRepos from './GitHubRepos';

interface Integration {
  id: string;
  provider: string;
  external_id: string;
  metadata?: { team_name?: string; login?: string };
}

interface Props {
  companyId: string;
  provider: 'slack' | 'github';
  title: string;
  description: string;
}

export default function IntegrationCard({ companyId, provider, title, description }: Props) {
  const [result, setResult] = useState<{
    companyId: string;
    provider: Props['provider'];
    integration: Integration | null;
    error: string;
  } | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    const loadIntegration = async () => {
      try {
        const response = await fetch(
          `/api/integrations?companyId=${encodeURIComponent(companyId)}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Failed to load ${title} integration.`);
        }

        if (!Array.isArray(data.integrations)) {
          throw new Error('Invalid integration response.');
        }

        const found = data.integrations.find(
          (integration: Integration) => integration.provider === provider
        );

        if (active) {
          setResult({
            companyId,
            provider,
            integration: found || null,
            error: '',
          });
        }
      } catch (requestError) {
        if (active) {
          setResult({
            companyId,
            provider,
            integration: null,
            error:
              requestError instanceof Error
                ? requestError.message
                : `Failed to load ${title} integration.`,
          });
        }
      }
    };

    void loadIntegration();
    return () => {
      active = false;
    };
  }, [companyId, provider, retryCount, title]);

  const handleConnect = () => {
    window.location.href = `/api/integrations/${provider}/start?companyId=${encodeURIComponent(companyId)}`;
  };

  const handleDisconnect = async () => {
    if (!confirm(`Disconnect ${title}? Incoming events will stop being linked to this company.`)) return;
    setActionError('');
    setDisconnecting(true);
    try {
      const response = await fetch('/api/integrations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, provider }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || `Failed to disconnect ${title}.`);
      }

      setResult((current) =>
        current?.companyId === companyId && current.provider === provider
          ? { ...current, integration: null }
          : current
      );
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : `Failed to disconnect ${title}.`
      );
    } finally {
      setDisconnecting(false);
    }
  };

  const loading =
    result?.companyId !== companyId || result.provider !== provider;
  const integration = loading ? null : result?.integration ?? null;
  const loadError = loading ? '' : result?.error ?? '';

  if (loading) {
    return (
      <div
        className="kms-card animate-pulse p-5"
        role="status"
        aria-label={`Loading ${title} integration`}
      >
        <div className="mb-3 h-5 w-24 bg-zinc-800" />
        <div className="h-4 w-48 bg-zinc-800" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="kms-card p-5 sm:p-6">
        <h2 className="text-base font-medium">{title}</h2>
        <p className="mt-2 text-sm text-red-400" role="alert">{loadError}</p>
        <button
          type="button"
          onClick={() => setRetryCount((count) => count + 1)}
          className="kms-btn-secondary mt-4"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="kms-card p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-medium">{title}</h2>
          <p className="mt-1 max-w-md text-sm text-zinc-500">{description}</p>
        </div>

        {integration ? (
          <span role="status" className="shrink-0 px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-400/10">
            Connected
          </span>
        ) : (
          <span className="shrink-0 bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-500">
            Not connected
          </span>
        )}
      </div>

      {integration ? (
        <>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 text-sm text-zinc-400">
              <span className="font-medium text-white">
                {integration.metadata?.team_name ||
                  integration.metadata?.login ||
                  integration.external_id}
              </span>
              <span className="mx-2">·</span>
              <span className="break-all font-mono text-xs">{integration.external_id}</span>
            </div>
            <button
              type="button"
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="min-h-10 text-sm font-medium text-red-400 hover:text-red-300 disabled:opacity-50"
            >
              {disconnecting ? 'Disconnecting...' : 'Disconnect'}
            </button>
          </div>
          {actionError && (
            <p className="mt-3 text-sm text-red-400" role="alert">
              {actionError}
            </p>
          )}

          {provider === 'github' && <GitHubRepos companyId={companyId} />}

          {provider === 'slack' && (
            <p className="mt-5 text-sm text-zinc-500">
              Invite the bot into channels you want to index:{' '}
              <code className="text-zinc-300">/invite @kms</code>
            </p>
          )}
        </>
      ) : (
        <button type="button" onClick={handleConnect} className="kms-btn-primary mt-5">
          Connect {title}
        </button>
      )}
    </div>
  );
}
