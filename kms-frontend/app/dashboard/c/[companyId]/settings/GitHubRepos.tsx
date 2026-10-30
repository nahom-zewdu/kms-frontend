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
  const [result, setResult] = useState<{
    companyId: string;
    repos: Repo[];
    installationId: number | null;
    error: string;
  } | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/integrations/github/repos?companyId=${encodeURIComponent(companyId)}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) {
          if (active) {
            setResult({
              companyId,
              repos: [],
              installationId: null,
              error: d.error || 'Failed to load repositories',
            });
          }
          return;
        }
        if (active) {
          setResult({
            companyId,
            repos: d.repos || [],
            installationId: d.installation_id ?? null,
            error: '',
          });
        }
      })
      .catch(() => {
        if (active) {
          setResult({
            companyId,
            repos: [],
            installationId: null,
            error: 'Failed to load repositories',
          });
        }
      });

    return () => {
      active = false;
    };
  }, [companyId]);

  const isLoading = result?.companyId !== companyId;
  const repos = isLoading ? [] : result?.repos ?? [];
  const installationId = isLoading ? null : result?.installationId ?? null;
  const error = isLoading ? '' : result?.error ?? '';

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

  if (isLoading) {
    return (
      <p className="mt-8 text-sm text-zinc-500" role="status">
        Loading repositories...
      </p>
    );
  }

  if (error) {
    return (
      <div className="mt-8 text-sm text-red-400" role="alert">
        {error}
        <p className="text-zinc-500 mt-2">
          Reconnect GitHub from the button above if the app is not installed.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 min-w-0 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-base font-medium">Installed repositories</h3>
          <p className="mt-1 text-sm leading-6 text-zinc-500">
            These repos were granted when the GitHub App was installed. Pushes, PRs, and
            issues are ingested automatically.
          </p>
        </div>
        <button
          type="button"
          onClick={openGitHubConfig}
          className="kms-btn-secondary min-h-10 whitespace-nowrap"
        >
          Configure on GitHub
        </button>
      </div>

      {repos.length === 0 ? (
        <p className="text-sm text-zinc-500" role="status">
          No repositories on this installation. Use &quot;Configure on GitHub&quot; to add
          repos.
        </p>
      ) : (
        <ul className="space-y-2">
          {repos.map((repo) => (
            <li
              key={repo.id || repo.full_name}
              className="flex min-w-0 flex-col gap-2 border border-zinc-800 bg-zinc-950 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="break-all text-sm font-medium">{repo.full_name}</div>
                {repo.description && (
                  <div className="mt-1 line-clamp-2 break-words text-xs text-zinc-500">
                    {repo.description}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-3 text-xs text-zinc-500">
                {repo.private && <span>Private</span>}
                <span className="text-emerald-400/90">Active</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
