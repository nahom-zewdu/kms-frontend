'use client';
export default function UpgradeButton() {
  const handleUpgrade = () => {
    alert('In production this would open Stripe Checkout for Pro plan.');
  };

  return (
    <button type="button" onClick={handleUpgrade} className="kms-btn-primary w-full">
      Upgrade to Pro
    </button>
  );
}
