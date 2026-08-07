// app/dashboard/subscription/page.tsx
// This is the subscription page. 
// It displays the user's current plan and allows them to upgrade to the Pro plan if they are on the Starter plan.

import { getUserContext } from '@/lib/auth';
import Link from 'next/link';
import { Check, Star } from 'lucide-react';
import UpgradeButton from './UpgradeButton';

export default async function SubscriptionPage() {
  const user = await getUserContext();
  if (!user) return null;

  const isPro = user.plan === 'pro';

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-5xl font-semibold tracking-tighter mb-4">Subscription</h1>
      <p className="text-zinc-500 mb-12">Current plan: <span className="text-white font-medium">{user.plan.toUpperCase()}</span></p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Starter Plan */}
        <div className={`bg-zinc-900 rounded-3xl p-10 ${!isPro ? 'ring-2 ring-white' : ''}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="text-emerald-400">
              <Check className="w-8 h-8" />
            </div>
            <div>
              <div className="text-emerald-400 font-medium">STARTER</div>
              <div className="text-5xl font-semibold tracking-tighter">$0</div>
            </div>
          </div>

          <ul className="space-y-4 mb-12 text-sm">
            <li>✓ Up to 10 active playbooks</li>
            <li>✓ Basic knowledge graph</li>
            <li>✓ Slack + GitHub integration</li>
            <li>✓ Standard support</li>
          </ul>

          {!isPro && <div className="text-center text-emerald-400 font-medium">Current Plan</div>}
        </div>

        {/* Pro Plan */}
        <div className={`bg-zinc-900 rounded-3xl p-10 relative ${isPro ? 'ring-2 ring-amber-400' : ''}`}>
          {isPro && (
            <div className="absolute -top-3 right-8 bg-amber-400 text-black text-xs font-medium px-4 py-1 rounded-full flex items-center gap-1">
              <Star className="w-4 h-4" /> Active
            </div>
          )}

          <div className="flex items-center gap-3 mb-6">
            <div className="text-amber-400">
              <Star className="w-8 h-8" />
            </div>
            <div>
              <div className="text-amber-400 font-medium">PRO</div>
              <div className="text-5xl font-semibold tracking-tighter">$29</div>
              <div className="text-zinc-400 text-sm">per month</div>
            </div>
          </div>

          <ul className="space-y-4 mb-12 text-sm">
            <li>✓ Unlimited playbooks</li>
            <li>✓ Advanced analytics & insights</li>
            <li>✓ Priority support</li>
            <li>✓ Team management & RBAC</li>
            <li>✓ Custom integrations</li>
          </ul>

          {!isPro ? (
            <UpgradeButton />
          ) : (
            <div className="text-center text-amber-400 font-medium py-4">You are on Pro plan</div>
          )}
        </div>
      </div>

      <div className="mt-12 text-center text-sm text-zinc-500">
        Need custom enterprise pricing? <Link href="/contact" className="text-white hover:underline">Contact sales</Link>
      </div>
    </div>
  );
}
