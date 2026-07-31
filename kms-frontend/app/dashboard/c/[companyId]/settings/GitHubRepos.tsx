// app/dashboard/c/[companyId]/settings/GitHubRepos.tsx
// This is a client-side component that displays the list of GitHub repositories for a company that has connected their GitHub account.
// It allows the user to watch or unwatch repositories, which creates or deletes webhooks for those repositories.
// The component fetches the list of repositories from the server and displays them with their details and watch status. The user can toggle the watch status for each repository, which triggers an API call to update the webhook configuration.

'use client';
import { useEffect, useState } from 'react';

export default function GitHubRepos({ companyId }: { companyId: string }) {
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch(`/api/integrations/github/repos?companyId=${companyId}`)
      .then(r => r.json())
      .then(d => {
        setRepos(d.repos || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [companyId]);

  const toggle = async (fullName: string, watched: boolean) => {
    setBusy(fullName);
    await fetch('/api/integrations/github/repos/watch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId,
        fullName,
        action: watched ? 'unwatch' : 'watch',
      }),
    });
    await load();
    setBusy(null);
  };

  if (loading) return <div className="text-zinc-500 text-sm">Loading repositories...</div>;

  return (
    <div className="mt-8 space-y-3">
      <h3 className="text-lg font-medium">Repositories to watch</h3>
      <p className="text-sm text-zinc-500 mb-4">
        Select repos. We create webhooks so pushes, PRs, and issues are ingested for this company.
      </p>
      {repos.length === 0 ? (
        <p className="text-zinc-500 text-sm">No repos found for this GitHub account.</p>
      ) : (
        repos.map(r => (
          <div
            key={r.full_name}
            className="flex justify-between items-center bg-zinc-950 rounded-2xl px-5 py-4"
          >
            <div>
              <div className="font-medium text-sm">{r.full_name}</div>
              {r.private && <span className="text-xs text-zinc-500">Private</span>}
            </div>
            <button
              disabled={busy === r.full_name}
              onClick={() => toggle(r.full_name, r.watched)}
              className={`text-sm px-4 py-2 rounded-xl font-medium ${
                r.watched
                  ? 'bg-zinc-800 text-zinc-300'
                  : 'bg-white text-black'
              }`}
            >
              {busy === r.full_name ? '...' : r.watched ? 'Watching' : 'Watch'}
            </button>
          </div>
        ))
      )}
    </div>
  );
}
