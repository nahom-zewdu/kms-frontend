// app/dashboard/settings/InviteForm.tsx
// This is the form for inviting a new team member. 
// It allows the user to enter an email and select a role (member or manager). 
// When the invite button is clicked, it sends a POST request to the /api/invite endpoint.

'use client';
import { useState } from 'react';

export default function InviteForm() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    setLoading(true);
    await fetch('/api/invite', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
    setLoading(false);
    setEmail('');
    alert('Invite sent!');
  };

  return (
    <div className="flex gap-4">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="teammate@email.com"
        className="flex-1 bg-zinc-950 border border-zinc-700 rounded-2xl px-6 py-4"
      />
      <select value={role} onChange={(e) => setRole(e.target.value)} className="bg-zinc-950 border border-zinc-700 rounded-2xl px-6">
        <option value="member">Member</option>
        <option value="manager">Manager</option>
      </select>
      <button onClick={handleInvite} disabled={loading} className="bg-white text-black px-8 rounded-2xl">
        {loading ? "Sending..." : "Invite"}
      </button>
    </div>
  );
}
