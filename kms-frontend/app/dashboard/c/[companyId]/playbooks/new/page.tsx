// app/dashboard/c/[companyId]/playbooks/new/page.tsx
// This page allows users with sufficient permissions to create a new playbook for a specific company in the KMS application.

import { getUserContext } from '@/lib/auth';
import NewPlaybookForm from './NewPlaybookForm';

export default async function NewPlaybookPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const user = await getUserContext();
  if (!user) return null;

  const membership = user.companies.find(c => c.id === companyId);
  if (!membership || membership.role === 'member') {
    return <div className="text-red-400">Insufficient permissions</div>;
  }

  return <NewPlaybookForm companyId={companyId} />;
}