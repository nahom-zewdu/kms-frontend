import { getUserContext } from '@/lib/auth';
import NewPlaybookForm from './NewPlaybookForm';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';

export default async function NewPlaybookPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const user = await getUserContext();
  if (!user) return null;

  const membership = user.companies.find((c) => c.id === companyId);
  if (!membership) return null;

  if (membership.role === 'member') {
    return (
      <PageHeader
        title="Insufficient permissions"
        description="Only managers and admins can create playbooks for this company."
        actions={
          <Link href={`/dashboard/c/${companyId}/playbooks`} className="kms-btn-secondary">
            Back to playbooks
          </Link>
        }
      />
    );
  }

  return <NewPlaybookForm companyId={companyId} />;
}
