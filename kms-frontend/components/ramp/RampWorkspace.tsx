// components/ramp/RampWorkspace.tsx
// This component renders the workspace for a specific company's ramp plan in the KMS application.
// It displays the ramp plan's title, role, employee name, and a list of steps with their details, including order, title, risk tier, owners, target path, and evidence.
// The component also handles cases where there are no steps in the ramp plan and provides appropriate messaging to the user.
'use client';

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

function riskClass(tier?: string) {
  if (tier === 'high-risk') return 'text-red-400 border-red-400/30';
  if (tier === 'safe') return 'text-emerald-400 border-emerald-400/30';
  return 'text-amber-400/90 border-amber-400/25';
}

export function RampWorkspace({ plan }: { plan: Plan }) {
  const steps = plan.steps || [];

  return (
    <div>
      <header className="mb-12 border-b border-zinc-900 pb-8">
        <p className="text-xs text-zinc-600 uppercase tracking-wide mb-2">First 7 Days</p>
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
            <li
              key={s.order}
              className="border border-zinc-800 bg-zinc-950/50 p-6"
            >
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

              {s.why && <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{s.why}</p>}

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
  );
}
