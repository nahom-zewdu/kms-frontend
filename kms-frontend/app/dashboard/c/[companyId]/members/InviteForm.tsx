'use client';
import { useState } from 'react';
import type { FormEvent } from 'react';

export default function InviteForm({ companyId }: { companyId: string }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleInvite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role, companyId }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || 'Unable to send the invitation.');
      }

      setEmail('');
      setMessage('Invite sent.');
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to send the invitation.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleInvite} className="flex flex-col gap-3 sm:flex-row">
      <label className="sr-only" htmlFor="member-email">
        Email
      </label>
      <input
        id="member-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email@company.com"
        className="kms-input flex-1"
        autoComplete="email"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'member-invite-error' : undefined}
        required
      />
      <label className="sr-only" htmlFor="member-role">
        Role
      </label>
      <select
        id="member-role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="kms-select sm:w-36"
      >
        <option value="member">Member</option>
        <option value="manager">Manager</option>
        <option value="admin">Admin</option>
      </select>
      <button
        type="submit"
        disabled={loading || !email.trim()}
        className="kms-btn-primary w-full sm:w-auto"
      >
        {loading ? 'Sending...' : 'Invite'}
      </button>
      {error && (
        <p id="member-invite-error" className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="text-sm text-emerald-400" role="status">
          {message}
        </p>
      )}
    </form>
  );
}
