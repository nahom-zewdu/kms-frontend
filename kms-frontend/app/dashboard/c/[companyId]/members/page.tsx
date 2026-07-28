// app/dashboard/c/[companyId]/members/page.tsx
// This page displays the members of a specific company in the KMS application.
// It fetches the user context to determine if the user has access to the company and whether they have admin privileges.

import { getUserContext } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase-server';
import InviteForm from './InviteForm';
import MemberList from './MemberList';

export default async function MembersPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const user = await getUserContext();
  if (!user) return null;

  const membership = user.companies.find(c => c.id === companyId);
  if (!membership) return null;

  const isAdmin = membership.role === 'admin';

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-5xl font-semibold tracking-tighter mb-12">Members</h1>

      {isAdmin && (
        <div className="bg-zinc-900 rounded-3xl p-10 mb-12">
          <h2 className="text-2xl font-medium mb-6">Invite Member</h2>
          <InviteForm companyId={companyId} />
        </div>
      )}

      <div className="bg-zinc-900 rounded-3xl p-10">
        <h2 className="text-2xl font-medium mb-6">Team</h2>
        <MemberList companyId={companyId} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
