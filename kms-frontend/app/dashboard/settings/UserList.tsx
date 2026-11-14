'use client';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/users')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load users: ${response.status}`);
        }
        return response.json() as Promise<{ users?: User[] }>;
      })
      .then((data) => {
        if (!cancelled) {
          setUsers(Array.isArray(data.users) ? data.users : []);
          setLoading(false);
        }
      })
      .catch((error: unknown) => {
        console.error('Failed to load team members', error);
        if (!cancelled) {
          setUsers([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const changeRole = async (userId: string, newRole: string) => {
    await fetch('/api/users/role', {
      method: 'POST',
      body: JSON.stringify({ userId, role: newRole }),
    });
    window.location.reload();
  };

  const removeUser = async (userId: string) => {
    if (!confirm('Remove user?')) return;
    try {
      const response = await fetch('/api/users/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to remove user: ${response.status}`);
      }

      // Update local state instead of calling an undefined refresh helper.
      setUsers((currentUsers) => currentUsers.filter((user) => user.id !== userId));
    } catch (error) {
      console.error('Failed to remove team member', error);
    }
  };

  if (loading) return <div className="text-sm text-zinc-500">Loading team members...</div>;

  if (users.length === 0) {
    return <div className="text-sm text-zinc-500">No team members yet.</div>;
  }

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex flex-col gap-3 border border-zinc-800 bg-zinc-950 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <div className="truncate font-medium">{user.name}</div>
            <div className="truncate text-sm text-zinc-500">{user.email}</div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="sr-only" htmlFor={`role-${user.id}`}>
              Role for {user.name}
            </label>
            <select
              id={`role-${user.id}`}
              value={user.role}
              onChange={(e) => changeRole(user.id, e.target.value)}
              className="kms-select py-2"
            >
              <option value="member">Member</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>

            <button
              type="button"
              onClick={() => removeUser(user.id)}
              className="min-h-10 text-sm text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
