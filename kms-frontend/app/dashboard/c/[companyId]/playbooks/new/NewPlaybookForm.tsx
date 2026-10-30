'use client';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';

export default function NewPlaybookForm({ companyId }: { companyId: string }) {
  const router = useRouter();
  const [role, setRole] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedRole = role.trim();
    if (!normalizedRole) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/playbooks/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: normalizedRole,
          employeeName: employeeName.trim() || undefined,
          companyId,
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to create playbook.');
      }

      router.push(`/dashboard/c/${companyId}/playbooks`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Failed to create playbook.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <PageHeader
        title="Create playbook"
        description="Generate an onboarding workspace from this company."
      />

      <form onSubmit={handleCreate} className="space-y-4">
        {error && <p className="text-sm text-red-400" role="alert">{error}</p>}

        <div>
          <label className="kms-label" htmlFor="playbook-role">
            Role
          </label>
          <input
            id="playbook-role"
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Backend Engineer"
            className="kms-input"
            required
          />
        </div>

        <div>
          <label className="kms-label" htmlFor="employee-name">
            Employee name (optional)
          </label>
          <input
            id="employee-name"
            type="text"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            placeholder="e.g. Sarah Chen"
            className="kms-input"
            autoComplete="name"
          />
        </div>

        <button
          type="submit"
          disabled={!role.trim() || loading}
          className="kms-btn-primary w-full"
        >
          {loading ? 'Generating...' : 'Generate playbook'}
        </button>
      </form>
    </div>
  );
}
