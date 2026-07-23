// app/dashboard/subscription/UpgradeButton.tsx
// This is the button for upgrading to the Pro plan. 
// It currently shows an alert when clicked, but will eventually integrate with Stripe Checkout.
'use client';

export default function UpgradeButton() {
  const handleUpgrade = () => {
    alert("In production this would open Stripe Checkout for Pro plan.");
    // TODO: Integrate Stripe later
  };

  return (
    <button 
      onClick={handleUpgrade}
      className="w-full bg-white text-black py-4 rounded-2xl font-medium hover:bg-zinc-200 transition"
    >
      Upgrade to Pro — $29/month
    </button>
  );
}
