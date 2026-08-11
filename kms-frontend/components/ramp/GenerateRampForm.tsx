// components/ramp/GenerateRampForm.tsx
// This component renders a form that allows users to generate a new ramp plan for a specific company in the KMS application.
// It includes a dropdown to select a role, an optional input for the new hire's name, and a button to submit the form.
// The component handles form submission by sending a POST request to the API route responsible for generating ramp plans and navigates to the newly generated ramp plan page upon success.

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const ROLES = [
  'backend-engineer',
  'frontend-engineer',
  'fullstack-engineer',
  'software-engineer',
];

export function GenerateRampForm({ companyId }: { companyId: string }) {
  const router = useRouter();
  const [role, setRole] = useState('backend-engineer');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generate() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ramp-plans/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          role,
          employee_name: name || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || 'Generate failed');
      }
      router.push(`/dashboard/c/${companyId}/ramp/${encodeURIComponent(role)}`);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-zinc-800 p-6 space-y-5">
      <div>
        <h2 className="text-sm font-medium text-zinc-200">Generate new ramp</h2>
        <p className="text-xs text-zinc-600 mt-1">
          Built from this company&apos;s indexed modules and ownership signals.
        </p>
      </div>

      <label className="block">
        <span className="text-xs text-zinc-500 uppercase tracking-wide">Role</span>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="mt-2 w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm outline-none focus:border-zinc-600"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-xs text-zinc-500 uppercase tracking-wide">
          New hire name (optional)
        </span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Asha"
          className="mt-2 w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm outline-none focus:border-zinc-600"
        />
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="button"
        disabled={loading}
        onClick={generate}
        className="bg-white text-black px-6 py-3 text-sm font-medium hover:bg-zinc-200 disabled:opacity-50"
      >
        {loading ? 'Generating…' : 'Generate ramp'}
      </button>
    </div>
  );
}
