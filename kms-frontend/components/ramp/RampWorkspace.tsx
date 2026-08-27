// components/ramp/RampWorkspace.tsx
// This component renders a workspace for a ramp plan, displaying the steps and allowing users to ask questions about the plan. 
// It includes a chat interface that interacts with an API to fetch answers based on the context of the ramp plan.

'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';

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
  evidence?: Evidence[];
};

type Plan = {
  title?: string;
  role?: string;
  employee_name?: string;
  steps?: Step[];
  meta?: {
    module_count?: number;
    file_count?: number;
    owner_coverage?: number;
    architecture_layers?: string[];
    generated_at?: string;
  };
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

function buildRampContext(plan: Plan): string {
  const steps = (plan.steps || [])
    .slice(0, 8)
    .map((s) => {
      const path = s.target?.path ? ` path=${s.target.path}` : '';
      const files = s.target?.files?.length
        ? ` files=${s.target.files.slice(0, 3).join(',')}`
        : '';
      const owners = s.owners?.length ? ` owners=${s.owners.join(',')}` : '';
      return `${s.order}. ${s.title}${path}${files}${owners} risk=${s.risk_tier || 'review'}`;
    })
    .join('\n');

  return [
    `First-7-Days ramp role=${plan.role || 'unknown'}.`,
    plan.employee_name ? `New hire: ${plan.employee_name}` : '',
    'Steps (facts only — do not invent people or paths):',
    steps || '(no steps)',
  ]
    .filter(Boolean)
    .join('\n');
}

export function RampWorkspace({
  plan,
  companyId,
  role,
}: {
  plan: Plan;
  companyId: string;
  role: string;
}) {
  const steps = plan.steps || [];
  const roleKey = (role || plan.role || '').toLowerCase();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Ask about a step, a path, or who to talk to. Answers stay inside this company.',
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
          context: buildRampContext(plan),
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
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: 'Could not reach the knowledge service. Try again.',
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-10">
      {/* Path */}
      <div>
        <header className="mb-10 border-b border-zinc-900 pb-8">
          <p className="text-xs text-zinc-600 uppercase tracking-wide mb-2">
            First 7 Days
          </p>
          <h1 className="text-4xl font-semibold tracking-tighter">
            {plan.title || `Ramp — ${plan.role}`}
          </h1>
          {plan.employee_name && (
            <p className="text-zinc-500 mt-2">For {plan.employee_name}</p>
          )}
          {plan.meta && (
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600">
              {typeof plan.meta.module_count === 'number' && (
                <span>{plan.meta.module_count} modules</span>
              )}
              {typeof plan.meta.owner_coverage === 'number' && (
                <span>
                  {Math.round(plan.meta.owner_coverage * 100)}% owner coverage
                </span>
              )}
              {plan.meta.architecture_layers?.length ? (
                <span>{plan.meta.architecture_layers.slice(0, 3).join(' · ')}</span>
              ) : null}
            </div>
          )}
        </header>

        {steps.length === 0 ? (
          <p className="text-zinc-500">
            No steps yet. Sync a repository baseline, then regenerate.
          </p>
        ) : (
          <ol className="space-y-3">
            {steps.map((s) => {
              const href = s.id
                ? `/dashboard/c/${companyId}/ramp/${encodeURIComponent(roleKey)}/step/${s.id}`
                : null;

              return (
                <li
                  key={s.id || s.order}
                  className="border border-zinc-800 bg-zinc-950/40 p-5 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="shrink-0 text-center">
                        <div className="text-[10px] uppercase tracking-wide text-zinc-600">
                          Day
                        </div>
                        <div className="text-sm tabular-nums text-zinc-400">
                          {String(s.order).padStart(2, '0')}
                        </div>
                      </div>
                      <div className="min-w-0">
                        {href ? (
                          <Link href={href} className="group">
                            <h2 className="text-base font-medium tracking-tight text-zinc-100 group-hover:text-white">
                              {s.title}
                            </h2>
                          </Link>
                        ) : (
                          <h2 className="text-base font-medium tracking-tight text-zinc-100">
                            {s.title}
                          </h2>
                        )}
                        {s.target?.path && (
                          <p className="mt-1 text-xs font-mono text-zinc-500 truncate">
                            {s.target.path}
                          </p>
                        )}
                      </div>
                    </div>
                    {s.risk_tier && (
                      <span
                        className={`shrink-0 text-[10px] uppercase tracking-wide border px-2 py-0.5 ${riskClass(
                          s.risk_tier
                        )}`}
                      >
                        {s.risk_tier}
                      </span>
                    )}
                  </div>

                  {s.why && (
                    <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                      {s.why}
                    </p>
                  )}

                  {s.target?.files && s.target.files.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {s.target.files.slice(0, 4).map((f) => (
                        <li
                          key={f}
                          className="text-xs font-mono text-zinc-500 truncate"
                        >
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {s.owners && s.owners.length > 0 ? (
                      <p className="text-sm text-zinc-300">
                        <span className="text-zinc-600">Ask </span>
                        <span className="font-medium">{s.owners.join(', ')}</span>
                      </p>
                    ) : (
                      <p className="text-xs text-zinc-600">No owner signal</p>
                    )}

                    {href && (
                      <Link
                        href={href}
                        className="text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-4"
                      >
                        Open step
                      </Link>
                    )}

                    {s.target?.path && (
                      <button
                        type="button"
                        onClick={() =>
                          send(
                            `What should I know about ${s.target?.path} as a ${plan.role || 'new engineer'}?`
                          )
                        }
                        className="text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-4"
                      >
                        Ask about this step
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* Ask */}
      <aside className="xl:sticky xl:top-8 flex flex-col border border-zinc-800 bg-zinc-950 max-h-[min(70vh,640px)]">
        <div className="px-4 py-3 border-b border-zinc-800 shrink-0">
          <h3 className="text-sm font-medium">Ask</h3>
          <p className="text-xs text-zinc-600 mt-0.5">
            Grounded in this company · abstains when unsure
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {messages.map((m, i) => (
            <div
              key={i}
              className={m.role === 'user' ? 'text-right' : 'text-left'}
            >
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
            placeholder="Who owns api?"
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
