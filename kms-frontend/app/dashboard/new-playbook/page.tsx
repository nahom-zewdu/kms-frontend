import { getUserContext } from '@/lib/auth';
import NewPlaybookForm from './NewPlaybookForm';
import { PageHeader } from '@/components/ui/PageHeader';

export default async function NewPlaybookPage() {
  const user = await getUserContext();
  if (!user) return null;

  const canCreate = user.isManager;
  const limitReached =
    user.maxPlaybooks !== null && user.activePlaybooks >= user.maxPlaybooks;

  if (!canCreate) {
    return (
      <PageHeader
        title="Create playbook"
        description="Managers and admins can generate playbooks."
      />
    );
  }

  return <NewPlaybookForm limitReached={limitReached} user={user} />;
}
