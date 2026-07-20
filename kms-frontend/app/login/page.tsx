// app/login/page.tsx
// Login page for the KMS application with client-side validation and friendly feedback.

'use client';
import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const emailValid = emailPattern.test(email.trim());
  const passwordValid = password.length >= 8;
  const formValid = emailValid && passwordValid;

  const validationHint = useMemo(() => {
    if (!email) return '';
    if (!emailValid) return 'Enter a valid email address.';
    if (!passwordValid) return 'Password must be at least 8 characters.';
    return '';
  }, [email, emailValid, passwordValid]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setInfo('');

    if (!formValid) {
      setError('Please enter a valid email and password before signing in.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error || 'Unable to sign in right now. Please try again.');
        return;
      }

      router.push(payload.redirect || '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md p-10 bg-zinc-900 rounded-3xl"
        noValidate
      >
        <h1 className="text-4xl font-semibold tracking-tighter mb-8">Sign in to KMS</h1>

        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl px-6 py-4 mb-4"
        />

        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl px-6 py-4 mb-2"
        />

        {validationHint && <p className="text-zinc-400 text-sm mb-4">{validationHint}</p>}
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        {info && <p className="text-emerald-400 text-sm mb-4">{info}</p>}

        <button
          type="submit"
          disabled={loading || !formValid}
          className="w-full bg-white text-black py-4 rounded-2xl font-medium hover:bg-zinc-200 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="text-center text-sm text-zinc-500 mt-6">
          No account? <Link href="/signup" className="text-white hover:underline">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
