// app/dashboard/subscription/page.tsx
// This is the subscription page. 
// It displays the user's current plan and allows them to upgrade to the Pro plan if they are on the Starter plan.

import { getUserContext } from '@/lib/auth';
import Link from 'next/link';

export default async function SubscriptionPage() {
  const user = await getUserContext();
  if (!user) return null;

  const isPro = user.plan === 'pro';

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-5xl font-semibold tracking-tighter mb-12">Subscription</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Starter Plan */}
        <div className={`bg-zinc-900 rounded-3xl p-10 ${!isPro ? 'ring-2 ring-white' : ''}`}>
          <div className="text-emerald-400 font-medium mb-4">STARTER</div>
          <div className="text-6xl font-semibold tracking-tighter mb-2">$0</div>
          <div className="text-zinc-400 mb-8">per month</div>

          <ul className="space-y-4 mb-12 text-sm">
            <li>✓ Up to 10 playbooks</li>
            <li>✓ Basic knowledge graph</li>
            <li>✓ Slack + GitHub integration</li>
          </ul>

          <div className="text-center text-sm text-zinc-500">Current Plan</div>
        </div>

        {/* Pro Plan */}
        <div className={`bg-zinc-900 rounded-3xl p-10 relative ${isPro ? 'ring-2 ring-white' : ''}`}>
          <div className="absolute -top-3 right-8 bg-white text-black text-xs font-medium px-4 py-1 rounded-full">
            RECOMMENDED
          </div>

          <div className="text-amber-400 font-medium mb-4">PRO</div>
          <div className="text-6xl font-semibold tracking-tighter mb-2">$29</div>
          <div className="text-zinc-400 mb-8">per month</div>

          <ul className="space-y-4 mb-12 text-sm">
            <li>✓ Unlimited playbooks</li>
            <li>✓ Advanced analytics</li>
            <li>✓ Priority support</li>
            <li>✓ Team management</li>
          </ul>

          <button className="w-full bg-white text-black py-4 rounded-2xl font-medium hover:bg-zinc-200 transition">
            Upgrade to Pro
          </button>
        </div>
      </div>

      <div className="mt-12 text-center text-sm text-zinc-500">
        Need custom pricing for your team? <Link href="/contact" className="text-white hover:underline">Contact us</Link>
      </div>
    </div>
  );
}
