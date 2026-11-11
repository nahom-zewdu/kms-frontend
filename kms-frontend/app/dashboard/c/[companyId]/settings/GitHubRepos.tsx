// app/dashboard/c/[companyId]/settings/GitHubRepos.tsx
// Lists repositories covered by the GitHub App installation and lets admins queue
// the initial codebase baseline required by Ramp.

'use client';
import { useEffect, useState } from 'react';

type Repo = {
  id: number;
  full_name: string;
  private?: boolean;
  description?: string | null;
};

type SyncState = { kind: 'queued' | 'error'; message: string };

export default function GitHubRepos({ companyId }: { companyId: string }) {
  const [result, setResult] = useState<{
    companyId: string;
    repos: Repo[];
    installationId: number | null;
    error: string;
  } | null>(null);
  const [syncingRepo, setSyncingRepo] = useState<string | null>(null);
  const [syncStates, setSyncStates] = useState<Record<string, SyncState>>({});

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
    const slug = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG;
    if (slug) {
      window.open(
        `https://github.com/apps/${slug}/installations/new`,
        '_blank',
        'noopener,noreferrer'
      );
    }
  };

  async function queueIndex(repo: Repo) {
    setSyncingRepo(repo.full_name);
    setSyncStates((current) => {
      const next = { ...current };
      delete next[repo.full_name];
      return next;
    });

    try {
      const response = await fetch('/api/integrations/github/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, repo: repo.full_name }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not queue repository indexing.');

      setSyncStates((current) => ({
        ...current,
        [repo.full_name]: {
          kind: 'queued',
          message: data.message || 'Baseline indexing has been queued.',
        },
      }));
    } catch (error) {
      setSyncStates((current) => ({
        ...current,
        [repo.full_name]: {
          kind: 'error',
          message: error instanceof Error ? error.message : 'Could not queue repository indexing.',
        },
      }));
    } finally {
      setSyncingRepo(null);
    }
  }

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
            Choose a repository to index its codebase for Ramp. Pushes, PRs, and issues
            continue to be ingested automatically.
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
          {repos.map((repo) => {
            const syncState = syncStates[repo.full_name];
            const isSyncing = syncingRepo === repo.full_name;
            return (
              <li
                key={repo.id || repo.full_name}
                className="flex min-w-0 flex-col gap-3 border border-zinc-800 bg-zinc-950 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="break-all text-sm font-medium">{repo.full_name}</div>
                  {repo.description && (
                    <div className="mt-1 line-clamp-2 break-words text-xs text-zinc-500">
                      {repo.description}
                    </div>
                  )}
                  {syncState && (
                    <p
                      className={`mt-2 text-xs ${syncState.kind === 'error' ? 'text-red-400' : 'text-emerald-400'}`}
                      role={syncState.kind === 'error' ? 'alert' : 'status'}
                    >
                      {syncState.message}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {repo.private && <span className="text-xs text-zinc-500">Private</span>}
                  <button
                    type="button"
                    onClick={() => void queueIndex(repo)}
                    disabled={isSyncing || syncingRepo !== null}
                    className="kms-btn-secondary min-h-10 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSyncing ? 'Queueing…' : syncState?.kind === 'queued' ? 'Queue re-index' : 'Index codebase'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
