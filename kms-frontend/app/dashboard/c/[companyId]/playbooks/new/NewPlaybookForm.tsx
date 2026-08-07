// app/dashboard/c/[companyId]/playbooks/new/NewPlaybookForm.tsx
// This component provides a form for creating a new playbook for a specific company in the KMS application.
// It allows the user to input a role and an optional employee name, then sends a request to generate the playbook via an API call.

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPlaybookForm({ companyId }: { companyId: string }) {
  const router = useRouter();
  const [role, setRole] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!role) return;
    setLoading(true);

    const res = await fetch('/api/playbooks/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, employeeName, companyId }),
    });

    if (res.ok) {
      router.push(`/dashboard/c/${companyId}/playbooks`);
    } else {
      alert('Failed to create playbook');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-4xl font-semibold tracking-tighter mb-8">Create Playbook</h1>

      <div className="space-y-6">
        <div>
          <label className="block text-sm text-zinc-500 mb-2">Role</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Backend Engineer"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-lg outline-none focus:border-white"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-500 mb-2">Employee Name (optional)</label>
          <input
            type="text"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            placeholder="e.g. Sarah Chen"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-lg outline-none focus:border-white"
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={!role || loading}
          className="w-full bg-white text-black py-4 rounded-2xl font-medium hover:bg-zinc-200 disabled:opacity-50 transition"
        >
          {loading ? 'Generating...' : 'Generate Playbook'}
        </button>
      </div>
    </div>
  );
}
