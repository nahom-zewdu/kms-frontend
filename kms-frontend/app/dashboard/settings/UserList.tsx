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
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  };

  const changeRole = async (userId: string, newRole: string) => {
    await fetch('/api/users/role', {
      method: 'POST',
      body: JSON.stringify({ userId, role: newRole }),
    });
    fetchUsers();
  };

  const removeUser = async (userId: string) => {
    if (!confirm('Remove user?')) return;
    await fetch('/api/users/remove', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    fetchUsers();
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
