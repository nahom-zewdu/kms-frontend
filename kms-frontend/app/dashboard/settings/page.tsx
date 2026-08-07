// app/dashboard/settings/page.tsx
// This is the settings page.
// It checks if the user is an admin and displays the invite form and user list if they are.
// If the user is not an admin, it displays an "Admin access only" message.

import { requireRole } from '@/lib/permissions';
import InviteForm from './InviteForm';
import UserList from './UserList';

export default async function SettingsPage() {
  const user = await requireRole('admin');
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-semibold tracking-tighter mb-12">Company Settings</h1>
        <p className="text-lg text-zinc-400">Admin access only.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-5xl font-semibold tracking-tighter mb-12">Company Settings</h1>

      <div className="bg-zinc-900 rounded-3xl p-10 mb-12">
        <h2 className="text-2xl font-medium mb-6">Invite Team Member</h2>
        <InviteForm />
      </div>

      <div className="bg-zinc-900 rounded-3xl p-10">
        <h2 className="text-2xl font-medium mb-6">Team Members</h2>
        <UserList />
      </div>
    </div>
  );
}
