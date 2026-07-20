// app/signup/page.tsx
// Signup page for the KMS application with client-side validation and user-friendly messaging.

'use client';
import { FormEvent, useMemo, useState } from 'react';
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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <form onSubmit={handleSignup} className="w-full max-w-md p-10 bg-zinc-900 rounded-3xl" noValidate>
        <h1 className="text-4xl font-semibold tracking-tighter mb-8">Create Account</h1>

        <input
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl px-6 py-4 mb-4"
        />

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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl px-6 py-4 mb-2"
        />

        {validationHint && <p className="text-zinc-400 text-sm mb-4">{validationHint}</p>}
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        {message && <p className="text-emerald-400 text-sm mb-4">{message}</p>}

        <button
          type="submit"
          disabled={loading || !formValid}
          className="w-full bg-white text-black py-4 rounded-2xl font-medium hover:bg-zinc-200 disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}
