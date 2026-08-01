// app/dashboard/c/[companyId]/settings/GitHubRepos.tsx
// Lists repos covered by the GitHub App installation for this company.
// Repo selection is managed on GitHub (all vs selected repos), not via per-repo webhooks.

'use client';
import { useEffect, useState } from 'react';

type Repo = {
  id: number;
  full_name: string;
  private?: boolean;
  description?: string | null;
};

export default function GitHubRepos({ companyId }: { companyId: string }) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [installationId, setInstallationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`/api/integrations/github/repos?companyId=${companyId}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) {
          setError(d.error || 'Failed to load repositories');
          setRepos([]);
          setInstallationId(null);
          return;
        }
        setRepos(d.repos || []);
        setInstallationId(d.installation_id ?? null);
      })
      .catch(() => setError('Failed to load repositories'))
      .finally(() => setLoading(false));
  }, [companyId]);

  const openGitHubConfig = () => {
    if (installationId) {
      window.open(
        `https://github.com/settings/installations/${installationId}`,
        '_blank',
        'noopener,noreferrer'
      );
      return;
    }
    // Fallback: app install/update page
    const slug = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG;
    if (slug) {
      window.open(
        `https://github.com/apps/${slug}/installations/new`,
        '_blank',
        'noopener,noreferrer'
      );
    }
  };

  if (loading) {
    return <div className="mt-8 text-zinc-500 text-sm">Loading repositories...</div>;
  }

  if (error) {
    return (
      <div className="mt-8 text-sm text-red-400">
        {error}
        <p className="text-zinc-500 mt-2">
          Reconnect GitHub from the button above if the app is not installed.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium">Installed repositories</h3>
          <p className="text-sm text-zinc-500 mt-1">
            These repos were granted when the GitHub App was installed. Pushes, PRs, and
            issues are ingested automatically.
          </p>
        </div>
        <button
          type="button"
          onClick={openGitHubConfig}
          className="shrink-0 text-sm px-4 py-2 rounded-xl font-medium bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition"
        >
          Configure on GitHub
        </button>
      </div>

      {repos.length === 0 ? (
        <p className="text-zinc-500 text-sm">
          No repositories on this installation. Use &quot;Configure on GitHub&quot; to add
          repos.
        </p>
      ) : (
        repos.map((r) => (
          <div
            key={r.id || r.full_name}
            className="flex justify-between items-center bg-zinc-950 rounded-2xl px-5 py-4"
          >
            <div>
              <div className="font-medium text-sm">{r.full_name}</div>
              {r.description && (
                <div className="text-xs text-zinc-500 mt-1 line-clamp-1">{r.description}</div>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              {r.private && <span>Private</span>}
              <span className="text-emerald-400/90">Active</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
