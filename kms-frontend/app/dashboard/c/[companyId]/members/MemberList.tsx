// app/dashboard/c/[companyId]/members/MemberList.tsx
// This component fetches and displays the list of members for a specific company in the KMS application.
// It shows each member's name, email, role, and whether they are the owner of the company.

'use client';
import { useEffect, useState } from 'react';

interface Member {
  id: string;
  user_id: string;
  role: string;
  is_owner: boolean;
  name?: string;
  email?: string;
}

export default function MemberList({ companyId, isAdmin }: { companyId: string; isAdmin: boolean }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/companies/${companyId}/members`)
      .then(res => res.json())
      .then(data => {
        setMembers(data.members || []);
        setLoading(false);
      });
  }, [companyId]);

  if (loading) return <div className="text-zinc-500">Loading members...</div>;

  return (
    <div className="space-y-4">
      {members.map((m) => (
        <div key={m.id} className="flex justify-between items-center bg-zinc-950 p-6 rounded-2xl">
          <div>
            <div className="font-medium">{m.name || 'User'}</div>
            <div className="text-sm text-zinc-500">{m.email}</div>
          </div>
          <div className="text-sm capitalize text-zinc-400">
            {m.role} {m.is_owner && '• Owner'}
          </div>
        </div>
      ))}
    </div>
  );
}
