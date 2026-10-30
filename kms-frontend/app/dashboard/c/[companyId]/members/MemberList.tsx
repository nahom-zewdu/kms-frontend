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

export default function MemberList({ companyId }: { companyId: string }) {
  const [result, setResult] = useState<{
    companyId: string;
    members: Member[];
    error: string;
  } | null>(null);

  useEffect(() => {
    let active = true;

    const loadMembers = async () => {
      try {
        const response = await fetch(`/api/companies/${encodeURIComponent(companyId)}/members`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load team members.');
        }

        if (active) {
          setResult({
            companyId,
            members: data.members || [],
            error: '',
          });
        }
      } catch (requestError) {
        if (active) {
          setResult({
            companyId,
            members: [],
            error:
              requestError instanceof Error
                ? requestError.message
                : 'Failed to load team members.',
          });
        }
      }
    };

    void loadMembers();
    return () => {
      active = false;
    };
  }, [companyId]);

  const loading = result?.companyId !== companyId;
  const members = loading ? [] : result?.members ?? [];
  const error = loading ? '' : result?.error ?? '';

  if (loading) {
    return (
      <p className="text-sm text-zinc-500" role="status">
        Loading members...
      </p>
    );
  }

  if (error) {
    return <p className="text-sm text-red-400" role="alert">{error}</p>;
  }

  if (members.length === 0) {
    return (
      <p className="text-sm text-zinc-500" role="status">
        No members yet.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {members.map((member) => (
        <li
          key={member.id}
          className="flex flex-col gap-1 border border-zinc-800 bg-zinc-950 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <div className="truncate font-medium">{member.name || 'User'}</div>
            <div className="truncate text-sm text-zinc-500">{member.email}</div>
          </div>
          <div className="text-sm capitalize text-zinc-400">
            {member.role} {member.is_owner && '· Owner'}
          </div>
        </li>
      ))}
    </ul>
  );
}
