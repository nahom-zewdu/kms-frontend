'use client';
import { FormEvent, useState } from 'react';

export default function InviteForm() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInvite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    await fetch('/api/invite', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
    setLoading(false);
    setEmail('');
    setMessage('Invite sent.');
  };

  return (
    <form onSubmit={handleInvite} className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
      <label className="sr-only" htmlFor="invite-email">
        Email
      </label>
      <input
        id="invite-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="teammate@email.com"
        className="kms-input flex-1"
        required
      />
      <label className="sr-only" htmlFor="invite-role">
        Role
      </label>
      <select
        id="invite-role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="kms-select sm:w-36"
      >
        <option value="member">Member</option>
        <option value="manager">Manager</option>
      </select>
      <button type="submit" disabled={loading || !email} className="kms-btn-primary sm:w-auto">
        {loading ? 'Sending...' : 'Invite'}
      </button>
      {message && <p className="text-sm text-zinc-400 sm:hidden">{message}</p>}
    </form>
  );
}
