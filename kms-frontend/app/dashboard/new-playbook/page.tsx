// app/dashboard/new-playbook/page.tsx
// This page component allows users to create a new onboarding playbook by specifying the role and optionally the employee name. 
// When the user submits the form, it sends a POST request to the /api/playbooks/generate endpoint with the provided information. 
// The API route is responsible for generating the playbook content based on the role and employee name, saving it to the database, and returning the new playbook's details. 
// Upon successful creation, the user is redirected to the onboarding page for the newly created playbook where they can view and interact with it. 
// The form includes basic validation to ensure that a role is provided before allowing submission, and it provides feedback during the loading state while the playbook is being generated.

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPlaybookPage() {
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
      body: JSON.stringify({ role, employeeName }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/onboard/${role.toLowerCase().replace(/\s+/g, '-')}`);
    } else {
      alert("Failed to create playbook");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-4xl font-semibold tracking-tighter mb-8">Create New Playbook</h1>

      <div className="space-y-6">
        <div>
          <label className="block text-sm text-zinc-500 mb-2">Role / Position</label>
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
          {loading ? "Generating..." : "Generate Playbook"}
        </button>
      </div>
    </div>
  );
}
