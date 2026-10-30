import { getUserContext } from '@/lib/auth';
import InviteForm from './InviteForm';
import MemberList from './MemberList';
import { PageHeader } from '@/components/ui/PageHeader';

export default async function MembersPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const user = await getUserContext();
  if (!user) return null;

  const membership = user.companies.find((c) => c.id === companyId);
  if (!membership) return null;

  const isAdmin = membership.role === 'admin';

  return (
    <div>
      <PageHeader title="Members" description="People who can work in this company." />

      <div className="space-y-6">
        {isAdmin && (
          <section className="kms-card p-5 sm:p-6">
            <h2 className="mb-4 text-sm font-medium text-white">Invite member</h2>
            <InviteForm companyId={companyId} />
          </section>
        )}

        <section className="kms-card p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-medium text-white">Team</h2>
          <MemberList companyId={companyId} />
        </section>
      </div>
    </div>
  );
}
