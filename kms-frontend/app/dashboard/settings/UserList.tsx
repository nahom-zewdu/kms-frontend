// app/dashboard/settings/UserList.tsx
// This is the user list component.
// It fetches the list of users from the /api/users endpoint and displays them.
// It allows changing the role of a user by sending a POST request to the /api/users/role endpoint.

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

  if (loading) return <div>Loading team...</div>;

  return (
    <div className="space-y-4">
      {users.map((u) => (
        <div key={u.id} className="flex justify-between items-center bg-zinc-950 p-6 rounded-2xl">
          <div>
            <div className="font-medium">{u.name}</div>
            <div className="text-sm text-zinc-500">{u.email}</div>
          </div>

          <select 
            value={u.role} 
            onChange={(e) => changeRole(u.id, e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2"
          >
            <option value="member">Member</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      ))}
    </div>
  );
}
