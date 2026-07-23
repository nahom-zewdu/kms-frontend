// app/dashboard/settings/UserList.tsx
// This is the user list component.
// It fetches the list of users from the /api/users endpoint and displays them.
// Each user is displayed with their email and role.

'use client';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  role: string;
}

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {users.map((user) => (
        <div key={user.id} className="bg-zinc-950 border border-zinc-700 rounded-2xl px-6 py-4 flex justify-between items-center">
          <div>
            <div className="text-lg font-medium">{user.email}</div>
            <div className="text-sm text-zinc-500">{user.role}</div>
          </div>
        </div>
      ))}
    </div>
  );
}