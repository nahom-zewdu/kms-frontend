import { getUserContext } from '@/lib/auth';
import { Check, Star } from 'lucide-react';
import UpgradeButton from './UpgradeButton';
import { PageHeader } from '@/components/ui/PageHeader';

export default async function SubscriptionPage() {
  const user = await getUserContext();
  if (!user) return null;

  const isPro = user.plan === 'pro';

  return (
    <div>
      <PageHeader
        title="Subscription"
        description={`Current plan: ${user.plan.toUpperCase()}`}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className={`kms-card p-6 ${!isPro ? 'ring-1 ring-zinc-400' : ''}`}>
          <div className="mb-5 flex items-center gap-3">
            <Check className="h-5 w-5 text-emerald-400" />
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-400">
                Starter
              </div>
              <div className="text-3xl font-semibold tracking-tight">$0</div>
            </div>
          </div>

          <ul className="mb-8 space-y-2 text-sm text-zinc-400">
            <li>Up to 10 active playbooks</li>
            <li>Basic knowledge graph</li>
            <li>Slack + GitHub integration</li>
            <li>Standard support</li>
          </ul>

          {!isPro && <div className="text-sm font-medium text-emerald-400">Current plan</div>}
        </div>

        <div className={`kms-card relative p-6 ${isPro ? 'ring-1 ring-amber-400' : ''}`}>
          {isPro && (
            <div className="absolute -top-2.5 right-4 flex items-center gap-1 bg-amber-400 px-3 py-1 text-xs font-medium text-black">
              <Star className="h-3.5 w-3.5" /> Active
            </div>
          )}

          <div className="mb-5 flex items-center gap-3">
            <Star className="h-5 w-5 text-amber-400" />
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.14em] text-amber-400">
                Pro
              </div>
              <div className="text-3xl font-semibold tracking-tight">$29</div>
              <div className="text-sm text-zinc-500">per month</div>
            </div>
          </div>

          <ul className="mb-8 space-y-2 text-sm text-zinc-400">
            <li>Unlimited playbooks</li>
            <li>Advanced analytics and insights</li>
            <li>Priority support</li>
            <li>Team management and RBAC</li>
            <li>Custom integrations</li>
          </ul>

          {!isPro ? (
            <UpgradeButton />
          ) : (
            <div className="py-2 text-sm font-medium text-amber-400">You are on the Pro plan</div>
          )}
        </div>
      </div>
    </div>
  );
}
