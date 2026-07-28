// app/dashboard/c/[companyId]/settings/page.tsx

import { getUserContext } from '@/lib/auth';
import IntegrationCard from './IntegrationCard';

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const user = await getUserContext();
  if (!user) return null;

  const membership = user.companies.find(c => c.id === companyId);
  if (!membership || membership.role !== 'admin') {
    return <div className="text-red-400">Admin access only.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-5xl font-semibold tracking-tighter mb-4">Settings</h1>
      <p className="text-zinc-500 mb-12">Manage integrations for {membership.name}</p>

      <div className="space-y-8">
        <IntegrationCard
          companyId={companyId}
          provider="slack"
          title="Slack"
          description="Connect your Slack workspace to ingest messages and answer questions."
        />

        <IntegrationCard
          companyId={companyId}
          provider="github"
          title="GitHub"
          description="Connect your GitHub organization to index repositories and track code changes."
        />
      </div>
    </div>
  );
}
