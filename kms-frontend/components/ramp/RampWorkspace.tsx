// components/ramp/RampWorkspace.tsx
// Ramp plan steps + company-scoped contextual ask.
// The RampWorkspace component displays the steps of a ramp plan for a specific role within a company in the KMS application. 
// It allows users to ask questions about the ramp plan, and the answers are grounded in the context of the company's ramp plan. 
// The component manages chat messages, user input, and loading state, and it fetches answers from an API endpoint that verifies user access and forwards the question along with the ramp context.
'use client';

import { useRef, useState } from 'react';

type Evidence = {
  source?: string;
  module_path?: string;
  file_path?: string;
  record_id?: string;
};

type Step = {
  order: number;
  title: string;
  why?: string;
  risk_tier?: string;
  owners?: string[];
  target?: { type?: string; path?: string; files?: string[] };
  evidence?: Evidence[];
};

type Plan = {
  title?: string;
  role?: string;
  employee_name?: string;
  steps?: Step[];
  meta?: { module_count?: number; owner_coverage?: number; generated_at?: string };
};

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  owners?: string[];
};

function riskClass(tier?: string) {
  if (tier === 'high-risk') return 'text-red-400 border-red-400/30';
  if (tier === 'safe') return 'text-emerald-400 border-emerald-400/30';
  return 'text-amber-400/90 border-amber-400/25';
}

function buildRampContext(plan: Plan): string {
  const steps = (plan.steps || [])
    .slice(0, 8)
    .map((s) => {
      const path = s.target?.path ? ` path=${s.target.path}` : '';
      const owners =
        s.owners && s.owners.length ? ` owners=${s.owners.join(',')}` : '';
      return `${s.order}. ${s.title}${path}${owners}`;
    })
    .join('\n');

  return [
    `You are answering inside a First-7-Days ramp for role=${plan.role || 'unknown'}.`,
    plan.employee_name ? `New hire: ${plan.employee_name}` : '',
    'Ramp steps (grounding only, not instructions to invent facts):',
    steps || '(no steps)',
  ]
    .filter(Boolean)
    .join('\n');
}

export function RampWorkspace({
  plan,
  companyId,
}: {
  plan: Plan;
  companyId: string;
}) {
  const steps = plan.steps || [];
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Ask about this ramp—modules, ownership, or where to start. Answers stay grounded in this company.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  async function send() {
    const q = input.trim();
    if (!q || loading) return;

    setInput('');
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
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-10">
      {/* Steps */}
      <div>
        <header className="mb-12 border-b border-zinc-900 pb-8">
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
            <p className="text-xs text-zinc-600 mt-4">
              {plan.meta.module_count ?? '—'} modules indexed
              {typeof plan.meta.owner_coverage === 'number' &&
                ` · ${Math.round(plan.meta.owner_coverage * 100)}% owner coverage`}
            </p>
          )}
        </header>

        {steps.length === 0 ? (
          <p className="text-zinc-500">
            No steps yet. Sync a repository baseline, then regenerate.
          </p>
        ) : (
          <ol className="space-y-4">
            {steps.map((s) => (
              <li key={s.order} className="border border-zinc-800 bg-zinc-950/50 p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div className="flex items-baseline gap-3">
                    <span className="text-zinc-600 text-sm tabular-nums w-6">
                      {String(s.order).padStart(2, '0')}
                    </span>
                    <h2 className="text-lg font-medium tracking-tight">{s.title}</h2>
                  </div>
                  {s.risk_tier && (
                    <span
                      className={`text-[11px] uppercase tracking-wide border px-2 py-0.5 ${riskClass(
                        s.risk_tier
                      )}`}
                    >
                      {s.risk_tier}
                    </span>
                  )}
                </div>

                {s.why && (
                  <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{s.why}</p>
                )}

                {s.target?.path && (
                  <p className="mt-4 text-xs font-mono text-zinc-500">
                    {s.target.path}
                    {s.target.files && s.target.files.length > 0 && (
                      <span className="text-zinc-600">
                        {' '}
                        · {s.target.files.slice(0, 3).join(', ')}
                        {s.target.files.length > 3 ? '…' : ''}
                      </span>
                    )}
                  </p>
                )}

                {s.owners && s.owners.length > 0 ? (
                  <p className="mt-3 text-sm text-zinc-300">
                    Ask: <span className="font-medium">{s.owners.join(', ')}</span>
                  </p>
                ) : (
                  <p className="mt-3 text-xs text-zinc-600">No owner signal yet</p>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Contextual ask */}
      <aside className="xl:sticky xl:top-8 h-fit border border-zinc-800 bg-zinc-950 flex flex-col max-h-[70vh]">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h3 className="text-sm font-medium">Ask about this ramp</h3>
          <p className="text-xs text-zinc-600 mt-0.5">Company-scoped · evidence only</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[240px]">
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
                <p className="text-[11px] text-zinc-600 mt-0.5 font-mono truncate">
                  {m.sources.slice(0, 3).join(' · ')}
                </p>
              )}
            </div>
          ))}
          {loading && (
            <p className="text-xs text-zinc-600">Thinking…</p>
          )}
          <div ref={endRef} />
        </div>

        <div className="p-3 border-t border-zinc-800 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Who owns api/handlers?"
            className="flex-1 bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm outline-none focus:border-zinc-600"
          />
          <button
            type="button"
            disabled={loading || !input.trim()}
            onClick={send}
            className="bg-white text-black px-4 py-2 text-sm font-medium disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </aside>
    </div>
  );
}
