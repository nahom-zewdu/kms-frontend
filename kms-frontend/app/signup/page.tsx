'use client';
import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const nameValid = name.trim().length >= 2;
  const emailValid = emailPattern.test(email.trim());
  const passwordValid = passwordPattern.test(password);
  const formValid = nameValid && emailValid && passwordValid;

  const validationHint = useMemo(() => {
    if (!name) return '';
    if (!nameValid) return 'Please enter your full name.';
    if (!emailValid) return 'Enter a valid email address.';
    if (!passwordValid) return 'Password must be at least 8 characters and include at least one number.';
    return '';
  }, [emailValid, name, nameValid, passwordValid]);

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!formValid) {
      setError('Please fix the highlighted fields before creating your account.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error || 'Unable to create account. Please try again.');
        return;
      }

      if (payload.redirect) {
        router.push(payload.redirect);
      } else {
        setMessage(payload.message || 'Account created. Please check your email if confirmation is required.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#0a0a0a] px-4 py-10">
      <form onSubmit={handleSignup} className="kms-card w-full max-w-md p-6 sm:p-8" noValidate>
        <Link href="/" className="text-sm font-semibold tracking-tight text-white">
          KMS
        </Link>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">Create account</h1>
        <p className="mt-1.5 text-sm text-zinc-500">Start with your engineering workspace.</p>

        <label className="kms-label mt-8" htmlFor="name">
          Full name
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          className="kms-input"
        />

        <label className="kms-label mt-4" htmlFor="email">
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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          className="kms-input"
        />

        {validationHint && <p className="mt-3 text-sm text-zinc-400">{validationHint}</p>}
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        {message && <p className="mt-3 text-sm text-emerald-400">{message}</p>}

        <button
          type="submit"
          disabled={loading || !formValid}
          className="kms-btn-primary mt-6 w-full"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <Link href="/login" className="text-white hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
