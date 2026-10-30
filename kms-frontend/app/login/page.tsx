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
    <div className="flex min-h-dvh items-center justify-center bg-[#0a0a0a] px-4 py-10">
      <form
        onSubmit={handleLogin}
        className="kms-card w-full max-w-md p-6 sm:p-8"
        noValidate
      >
        <Link href="/" className="text-sm font-semibold tracking-tight text-white">
          KMS
        </Link>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">Sign in</h1>
        <p className="mt-1.5 text-sm text-zinc-500">Continue to your workspace.</p>

        <label className="kms-label mt-8" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="kms-input"
        />

        <label className="kms-label mt-4" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="kms-input"
        />

        {validationHint && <p className="mt-3 text-sm text-zinc-400">{validationHint}</p>}
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        {info && <p className="mt-3 text-sm text-emerald-400">{info}</p>}

        <button
          type="submit"
          disabled={loading || !formValid}
          className="kms-btn-primary mt-6 w-full"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <p className="mt-6 text-center text-sm text-zinc-500">
          No account?{' '}
          <Link href="/signup" className="text-white hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
