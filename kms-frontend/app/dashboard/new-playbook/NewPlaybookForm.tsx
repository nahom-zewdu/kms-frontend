// app/dashboard/new-playbook/NewPlaybookForm.tsx
// This is the form for creating a new playbook. 
// It allows the user to input a role and an optional employee name, and handles the creation of the playbook.

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  limitReached: boolean;
  user: any;
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
      alert("Failed to create playbook");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-4xl font-semibold tracking-tighter mb-8">Create New Playbook</h1>
      
      {limitReached && (
        <div className="bg-red-950 border border-red-900 p-6 rounded-2xl mb-8">
          You have reached your plan limit ({user.plan}). Upgrade to Pro for unlimited playbooks.
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm text-zinc-500 mb-2">Role / Position</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Backend Engineer"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-lg outline-none focus:border-white"
            disabled={limitReached}
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
            disabled={limitReached}
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={!role || loading || limitReached}
          className="w-full bg-white text-black py-4 rounded-2xl font-medium hover:bg-zinc-200 disabled:opacity-50 transition"
        >
          {loading ? "Generating..." : "Generate Playbook"}
        </button>
      </div>
    </div>
  );
}
