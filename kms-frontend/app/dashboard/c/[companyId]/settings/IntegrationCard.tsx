// app/dashboard/c/[companyId]/settings/IntegrationCard.tsx
// This is a client-side component that displays the integration status for a specific provider (Slack or GitHub) for a given company.
// It fetches the current integration status from the server and allows the user to connect or disconnect the integration.

'use client';
import { useEffect, useState } from 'react';

interface Integration {
  id: string;
  provider: string;
  external_id: string;
  is_active: boolean;
  metadata?: any;
}

interface Props {
  companyId: string;
  provider: 'slack' | 'github';
  title: string;
  description: string;
}

export default function IntegrationCard({ companyId, provider, title, description }: Props) {
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    fetch(`/api/integrations?companyId=${companyId}`)
      .then(r => r.json())
      .then(data => {
        const found = (data.integrations || []).find((i: Integration) => i.provider === provider);
        setIntegration(found || null);
        setLoading(false);
      });
  }, [companyId, provider]);

  const handleConnect = () => {
    window.location.href = `/api/integrations/${provider}/start?companyId=${companyId}`;
  };

  const handleDisconnect = async () => {
    if (!confirm(`Disconnect ${title}? Incoming events will stop being linked to this company.`)) return;
    setDisconnecting(true);
    await fetch('/api/integrations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId, provider }),
    });
    setIntegration(null);
    setDisconnecting(false);
  };

  if (loading) {
    return (
      <div className="bg-zinc-900 rounded-3xl p-8 animate-pulse">
        <div className="h-6 w-32 bg-zinc-800 rounded mb-4" />
        <div className="h-4 w-64 bg-zinc-800 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-3xl p-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-medium">{title}</h2>
          <p className="text-zinc-500 mt-1 text-sm max-w-md">{description}</p>
        </div>

        {integration ? (
          <span className="text-emerald-400 text-sm font-medium px-3 py-1 bg-emerald-400/10 rounded-full">
            Connected
          </span>
        ) : (
          <span className="text-zinc-500 text-sm font-medium px-3 py-1 bg-zinc-800 rounded-full">
            Not connected
          </span>
        )}
      </div>

      {integration ? (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-zinc-400">
            <span className="text-white font-medium">
              {integration.metadata?.team_name || integration.metadata?.login || integration.external_id}
            </span>
            <span className="mx-2">·</span>
            <span className="font-mono text-xs">{integration.external_id}</span>
          </div>
          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="text-red-400 hover:text-red-300 text-sm font-medium disabled:opacity-50"
          >
            {disconnecting ? 'Disconnecting...' : 'Disconnect'}
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          className="mt-6 bg-white text-black px-6 py-3 rounded-2xl font-medium hover:bg-zinc-200 transition"
        >
          Connect {title}
        </button>
      )}
    </div>
  );
}
