import { getUserContext } from '@/lib/auth';
import IntegrationCard from './IntegrationCard';
import { PageHeader } from '@/components/ui/PageHeader';

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const user = await getUserContext();
  if (!user) return null;

  const membership = user.companies.find((c) => c.id === companyId);
  if (!membership || membership.role !== 'admin') {
    return (
      <PageHeader
        title="Admin access only"
        description="Only company admins can manage integrations."
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description={`Manage integrations for ${membership.name}.`}
      />

      <div className="space-y-4">
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
