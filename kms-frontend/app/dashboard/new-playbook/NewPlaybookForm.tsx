'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';

interface Props {
  limitReached: boolean;
  user: { plan?: string };
}

export default function NewPlaybookForm({ limitReached, user }: Props) {
  const router = useRouter();
  const [role, setRole] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!role || limitReached) return;
    setLoading(true);

    const res = await fetch('/api/playbooks/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, employeeName }),
    });

    if (res.ok) {
      router.push(`/onboard/${role.toLowerCase().replace(/\s+/g, '-')}`);
    } else {
      alert('Failed to create playbook');
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-md">
      <PageHeader
        title="Create playbook"
        description="Generate an onboarding workspace for a role."
      />

      {limitReached && (
        <div className="mb-6 border border-red-900 bg-red-950/40 p-4 text-sm text-red-200">
          You have reached your plan limit ({user.plan}). Upgrade to Pro for unlimited playbooks.
        </div>
      )}

      <div className="space-y-4">
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
            disabled={limitReached}
          />
        </div>

        <div>
          <label className="kms-label" htmlFor="playbook-name">
            Employee name (optional)
          </label>
          <input
            id="playbook-name"
            type="text"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            placeholder="e.g. Sarah Chen"
            className="kms-input"
            disabled={limitReached}
          />
        </div>

        <button
          type="button"
          onClick={handleCreate}
          disabled={!role || loading || limitReached}
          className="kms-btn-primary w-full"
        >
          {loading ? 'Generating...' : 'Generate playbook'}
        </button>
      </div>
    </div>
  );
}
