// components/ramp/StepWorkspace.tsx
// This component renders the workspace for a specific ramp step within a company's ramp plan.
// It displays the step's title, risk tier, path, owners, key files, checklist items, and evidence.
// It also includes a chat interface that allows users to ask questions about the step, scoped to the step's context.
// The component fetches answers from an external API and displays them in the chat interface.
'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';

type StepStatus = 'not_started' | 'in_progress' | 'completed';

type Evidence = {
  source?: string;
  module_path?: string;
  file_path?: string;
  record_id?: string;
};

type Step = {
  id?: string;
  order: number;
  title: string;
  why?: string;
  risk_tier?: string;
  owners?: string[];
  target?: {
    type?: string;
    path?: string;
    repo?: string | null;
    files?: string[];
  };
  summary?: { what?: string | null; how?: string | null; where?: string | null };
  resources?: { type?: string; label?: string; url?: string }[];
  checklist?: { id: string; label: string; done?: boolean }[];
  evidence?: Evidence[];
};

type Plan = {
  title?: string;
  role?: string;
  employee_name?: string;
  steps?: Step[];
};

type SourceRef = string | { source?: string; record_id?: string };

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceRef[];
  owners?: string[];
};

function riskClass(tier?: string) {
  if (tier === 'high-risk') return 'text-red-400 border-red-400/30 bg-red-400/5';
  if (tier === 'safe') return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5';
  return 'text-amber-400/90 border-amber-400/25 bg-amber-400/5';
}

function formatSource(s: SourceRef): string {
  if (typeof s === 'string') return s;
  const src = s.source || 'source';
  const id = s.record_id ? String(s.record_id).slice(0, 12) : '';
  return id ? `${src}:${id}` : src;
}

function githubTreeUrl(repo: string | null | undefined, path: string) {
  if (!repo) return null;
  return `https://github.com/${repo}/tree/HEAD/${path}`;
}

function githubBlobUrl(repo: string | null | undefined, filePath: string) {
  if (!repo) return null;
  return `https://github.com/${repo}/blob/HEAD/${filePath}`;
}

function buildStepContext(plan: Plan, step: Step): string {
  const path = step.target?.path || '';
  const files = (step.target?.files || []).slice(0, 6).join(', ');
  const owners = (step.owners || []).join(', ');
  return [
    `Ramp step context only (do not invent people or paths).`,
    `Role: ${plan.role || 'unknown'}`,
    `Step ${step.order}: ${step.title}`,
    path ? `Path: ${path}` : '',
    files ? `Files: ${files}` : '',
    owners ? `Owners: ${owners}` : 'Owners: unknown',
    step.risk_tier ? `Risk: ${step.risk_tier}` : '',
    step.why ? `Why: ${step.why}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export function StepWorkspace({
  plan,
  step,
  companyId,
  role,
}: {
  plan: Plan;
  step: Step;
  companyId: string;
  role: string;
}) {
  const path = step.target?.path || '';
  const repo = step.target?.repo || null;
  const treeUrl = path ? githubTreeUrl(repo, path) : null;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Questions stay scoped to this step${path ? ` (${path})` : ''}.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  async function send(preset?: string) {
    const q = (preset ?? input).trim();
    if (!q || loading) return;
    if (!preset) setInput('');
    setMessages((m) => [...m, { role: 'user', content: q }]);
    setLoading(true);
    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          company_id: companyId,
          context: buildStepContext(plan, step),
        }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: data.answer || "I don't know yet.",
          sources: data.sources || [],
          owners: data.owners || [],
        },
      ]);

  async function updateStatus(nextStatus: StepStatus) {
    if (isUpdating || !planId) {
      return;
    }

    const previousStatus = status;
    setError(null);
    setStatus(nextStatus);
    setIsUpdating(true);

    try {
      const res = await fetch(
        `/api/ramp-plans/${encodeURIComponent(planId)}/steps/${encodeURIComponent(stepId)}/progress`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus }),
        }
      );

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error || 'Could not update progress');
      }
    } catch (err) {
      setStatus(previousStatus);
      setError(err instanceof Error && err.message ? err.message : 'Could not update progress.');
    } finally {
      setIsUpdating(false);
    }
  }
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: 'Could not reach the knowledge service.' },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-10">
      <div>
        <div className="mb-6 flex flex-wrap gap-4 text-xs text-zinc-600">
          <Link
            href={`/dashboard/c/${companyId}/ramp/${encodeURIComponent(role)}`}
            className="hover:text-zinc-400"
          >
            ← Full path
          </Link>
          <span>Day {String(step.order).padStart(2, '0')}</span>
        </div>

        <header className="mb-10 border-b border-zinc-900 pb-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-3xl font-semibold tracking-tighter text-zinc-100">
              {step.title}
            </h1>
            {step.risk_tier && (
              <span
                className={`text-[10px] uppercase tracking-wide border px-2 py-0.5 ${riskClass(
                  step.risk_tier
                )}`}
              >
                {step.risk_tier}
              </span>
            )}
          </div>
          {path && (
            <p className="mt-3 font-mono text-sm text-zinc-500">
              {treeUrl ? (
                <a
                  href={treeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-zinc-300 underline underline-offset-4"
                >
                  {path}
                </a>
              ) : (
                path
              )}
            </p>
          )}
          {step.why && (
            <p className="mt-4 text-sm text-zinc-400 leading-relaxed max-w-2xl">
              {step.why}
            </p>
          )}
        </header>

        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-wide text-zinc-600 mb-3">
            People
          </h2>
          {step.owners && step.owners.length > 0 ? (
            <p className="text-sm text-zinc-200">
              Start with{' '}
              <span className="font-medium">{step.owners.join(', ')}</span>
            </p>
          ) : (
            <p className="text-sm text-zinc-600">No owner signal for this path yet.</p>
          )}
        </section>

        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-wide text-zinc-600 mb-3">
            Key files
          </h2>
          {(step.target?.files || []).length === 0 ? (
            <p className="text-sm text-zinc-600">No files attached to this step.</p>
          ) : (
            <ul className="space-y-2">
              {(step.target?.files || []).map((f) => {
                const href = githubBlobUrl(repo, f);
                return (
                  <li key={f} className="text-sm font-mono text-zinc-400">
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-zinc-200 underline underline-offset-4"
                      >
                        {f}
                      </a>
                    ) : (
                      f
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {!repo && path && (
            <p className="mt-3 text-xs text-zinc-600">
              Connect GitHub and set repo on the step to enable deep links.
            </p>
          )}
        </section>

        {(step.checklist || []).length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs uppercase tracking-wide text-zinc-600 mb-3">
              Do
            </h2>
            <ul className="space-y-2">
              {(step.checklist || []).map((c) => (
                <li key={c.id} className="text-sm text-zinc-400">
                  ○ {c.label}
                </li>
              ))}
            </ul>
          </section>
        )}

        {(step.evidence || []).length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-wide text-zinc-600 mb-3">
              Evidence
            </h2>
            <ul className="space-y-1 text-xs font-mono text-zinc-600">
              {(step.evidence || []).map((e, i) => (
                <li key={i}>
                  {e.source}
                  {e.module_path ? ` · ${e.module_path}` : ''}
                  {e.file_path ? ` · ${e.file_path}` : ''}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <aside className="xl:sticky xl:top-8 flex flex-col border border-zinc-800 bg-zinc-950 max-h-[min(70vh,640px)]">
        <div className="px-4 py-3 border-b border-zinc-800 shrink-0">
          <h3 className="text-sm font-medium">Ask about this step</h3>
          <p className="text-xs text-zinc-600 mt-0.5">Scoped context · company only</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
              <div
                className={`inline-block max-w-[95%] px-3 py-2 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-white text-black'
                    : 'bg-zinc-900 text-zinc-200'
                }`}
              >
                {m.content}
              </div>
              {m.role === 'assistant' && m.owners && m.owners.length > 0 && (
                <p className="text-[11px] text-zinc-500 mt-1">
                  Owners: {m.owners.join(', ')}
                </p>
              )}
              {m.role === 'assistant' && m.sources && m.sources.length > 0 && (
                <p className="text-[11px] text-zinc-600 mt-0.5 font-mono">
                  {m.sources.slice(0, 4).map(formatSource).join(' · ')}
                </p>
              )}
            </div>
          ))}
          {loading && <p className="text-xs text-zinc-600">Thinking…</p>}
          <div ref={endRef} />
        </div>
        <div className="p-3 border-t border-zinc-800 flex gap-2 shrink-0">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder={path ? `About ${path}…` : 'Ask…'}
            className="flex-1 bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm outline-none focus:border-zinc-600"
          />
          <button
            type="button"
            disabled={loading || !input.trim()}
            onClick={() => send()}
            className="bg-white text-black px-4 py-2 text-sm font-medium disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </aside>
    </div>
  );
}
