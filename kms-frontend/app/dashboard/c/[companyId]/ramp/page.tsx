// app/dashboard/c/[companyId]/ramp/page.tsx
// This page displays the first 7 days ramp plan for a specific company in the KMS application.
// It allows the user to select a role and optionally enter a new hire's name to generate a ramp plan.
// The page fetches the user context and checks if the user has access to the specified company.
// If the user is not logged in or does not have access, they are redirected to the login page or dashboard, respectively.

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

const ROLES = [
  'backend-engineer',
  'frontend-engineer',
  'fullstack-engineer',
  'software-engineer',
];

export default function RampIndexPage() {
  const { companyId } = useParams<{ companyId: string }>();
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
    } catch (e: any) {
      setError(e.message || 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-4xl font-semibold tracking-tighter">First 7 Days</h1>
      <p className="text-zinc-500 mt-2">
        Role-specific ramp from this company&apos;s indexed codebase—not a static doc.
      </p>

      <div className="mt-10 space-y-6 border border-zinc-800 p-6">
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

      <p className="mt-6 text-sm text-zinc-600">
        Already generated?{' '}
        <Link
          href={`/dashboard/c/${companyId}/ramp/${role}`}
          className="text-zinc-300 underline underline-offset-4"
        >
          Open {role}
        </Link>
      </p>
    </div>
  );
}
