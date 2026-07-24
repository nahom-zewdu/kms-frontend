// app/invite/[token]/page.tsx
// This is the page for accepting an invite to join a company.
// It uses the invite token from the URL to call the API and accept the invite, then redirects the user to the dashboard.

'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function InviteAcceptPage() {
  const router = useRouter();
  const { token } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const acceptInvite = async () => {
      const res = await fetch('/api/invite/accept', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        router.push('/dashboard');
      } else {
        alert('Invalid invite');
      }
      setLoading(false);
    };
    acceptInvite();
  }, [token]);

  return <div>{loading ? "Accepting invite..." : "Redirecting..."}</div>;
}
