// app/dashboard/c/[companyId]/members/InviteForm.tsx
// This component provides a form for inviting new members to a specific company in the KMS application.
// It allows the user to input an email address and select a role for the new member, then sends an invitation via an API call.

'use client';
import { useState } from 'react';

export default function InviteForm({ companyId }: { companyId: string }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    setLoading(true);
    await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role, companyId }),
    });
    setLoading(false);
    setEmail('');
    alert('Invite sent (check console for now)');
  };

  return (
    <div className="flex gap-4">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email@company.com"
        className="flex-1 bg-zinc-950 border border-zinc-700 rounded-2xl px-6 py-4"
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="bg-zinc-950 border border-zinc-700 rounded-2xl px-6"
      >
        <option value="member">Member</option>
        <option value="manager">Manager</option>
        <option value="admin">Admin</option>
      </select>
      <button
        onClick={handleInvite}
        disabled={loading || !email}
        className="bg-white text-black px-8 rounded-2xl font-medium disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Invite'}
      </button>
    </div>
  );
}
