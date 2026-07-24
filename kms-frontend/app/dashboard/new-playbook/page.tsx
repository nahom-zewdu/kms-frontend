// app/dashboard/new-playbook/page.tsx
// This is the page for creating a new playbook. 
// It checks if the user is authenticated and if they have reached their limit of active playbooks.

// app/dashboard/new-playbook/page.tsx
import { getUserContext } from '@/lib/auth';
import NewPlaybookForm from './NewPlaybookForm';

export default async function NewPlaybookPage() {
  const user = await getUserContext();
  if (!user) return null;

  const canCreate = user.isManager; // Only managers and admins
  const limitReached = user.activePlaybooks >= user.maxPlaybooks;

  return <NewPlaybookForm limitReached={limitReached} user={user} />;
}
