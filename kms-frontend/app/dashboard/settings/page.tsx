import { requireRole } from '@/lib/permissions';
import InviteForm from './InviteForm';
import UserList from './UserList';
import { PageHeader } from '@/components/ui/PageHeader';

export default async function SettingsPage() {
  const user = await requireRole('admin');
  if (!user) {
    return (
      <div>
        <PageHeader title="Account settings" description="Admin access only." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Account settings"
        description="Invite people and manage roles for this account."
      />

      <div className="space-y-6">
        <section className="kms-card p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-medium text-white">Invite team member</h2>
          <InviteForm />
        </section>

        <section className="kms-card p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-medium text-white">Team members</h2>
          <UserList />
        </section>
      </div>
    </div>
  );
}
