// app/dashboard/c/[companyId]/settings/IntegrationCards.tsx
// This is a client component that renders an integration card for a specific provider (Slack or GitHub).
// It allows the user to connect the integration by providing an external ID (Slack Team ID or GitHub Org/Username).

'use client';
import { useState } from 'react';

interface Props {
  companyId: string;
  provider: 'slack' | 'github';
  title: string;
  description: string;
}

export default function IntegrationCard({ companyId, provider, title, description }: Props) {
  const [externalId, setExternalId] = useState('');
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleConnect = async () => {
    if (!externalId.trim()) return;
    setLoading(true);

    const res = await fetch('/api/integrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId,
        provider,
        externalId: externalId.trim(),
      }),
    });

    if (res.ok) {
      setConnected(true);
    } else {
      alert('Failed to connect integration');
    }
    setLoading(false);
  };

  return (
    <div className="bg-zinc-900 rounded-3xl p-8">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-medium">{title}</h2>
          <p className="text-zinc-500 mt-1 text-sm">{description}</p>
        </div>
        {connected && (
          <span className="text-emerald-400 text-sm font-medium">Connected</span>
        )}
      </div>

      {!connected ? (
        <div className="flex gap-4 mt-6">
          <input
            type="text"
            value={externalId}
            onChange={(e) => setExternalId(e.target.value)}
            placeholder={provider === 'slack' ? 'Slack Team ID' : 'GitHub Org / Username'}
            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-2xl px-5 py-3 text-sm outline-none focus:border-white"
          />
          <button
            onClick={handleConnect}
            disabled={loading || !externalId.trim()}
            className="bg-white text-black px-6 py-3 rounded-2xl font-medium hover:bg-zinc-200 disabled:opacity-50 transition"
          >
            {loading ? 'Connecting...' : 'Connect'}
          </button>
        </div>
      ) : (
        <p className="text-sm text-zinc-400 mt-4">
          Integration active. Incoming events will be scoped to this company.
        </p>
      )}
    </div>
  );
}
