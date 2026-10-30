// components/ramp/GenerateRampForm.tsx
// This component renders a form that allows users to generate a new ramp plan for a specific company in the KMS application.
// It includes a dropdown to select a role, an optional input for the new hire's name, and a button to submit the form.
// The component handles form submission by sending a POST request to the API route responsible for generating ramp plans and navigates to the newly generated ramp plan page upon success.

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FormEvent } from 'react';

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void generate();
  }

  return (
    <form onSubmit={handleSubmit} className="kms-card space-y-4 p-4 sm:p-5">
      <div>
        <h2 className="text-sm font-medium text-zinc-200">Generate new ramp</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Built from this company&apos;s indexed modules and ownership signals.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="kms-label" htmlFor="ramp-role">
            Role
          </label>
          <select
            id="ramp-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="kms-select w-full"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="kms-label" htmlFor="ramp-employee-name">
            New hire name <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <input
            id="ramp-employee-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Asha"
            className="kms-input"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-400" role="alert">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="kms-btn-primary w-full sm:w-auto"
      >
        {loading ? 'Generating…' : 'Generate ramp'}
      </button>
    </form>
  );
}
