'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

export default function InviteAcceptPage() {
  const router = useRouter();
  const { token } = useParams();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [message, setMessage] = useState('Accepting invite...');

  useEffect(() => {
    const acceptInvite = async () => {
      try {
        const res = await fetch('/api/invite/accept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        if (res.ok) {
          router.push('/dashboard');
          return;
        }
        const payload = await res.json().catch(() => ({}));
        setMessage(payload.error || 'This invite is invalid or has expired.');
        setStatus('error');
      } catch {
        setMessage('Unable to accept this invite right now.');
        setStatus('error');
      }
    };
    acceptInvite();
  }, [token, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#0a0a0a] px-4 py-10">
      <div className="kms-card w-full max-w-md p-6 text-center sm:p-8">
        <p className="text-sm font-semibold tracking-tight text-white">KMS</p>
        <h1 className="mt-4 text-xl font-semibold tracking-tight">
          {status === 'loading' ? 'Joining company' : 'Invite unavailable'}
        </h1>
        <p className="mt-2 text-sm text-zinc-500">{message}</p>
        {status === 'error' && (
          <Link href="/login" className="kms-btn-primary mt-6 inline-flex">
            Go to sign in
          </Link>
        )}
      </div>
    </div>
  );
}
