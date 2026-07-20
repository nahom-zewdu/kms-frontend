// app/signup/page.tsx
// This is the signup page for the KMS application.
// It allows users to create a new account by providing their full name, email, and password.

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || 'Failed to sign up.');
    } else if (payload.redirect) {
      router.push(payload.redirect);
    } else {
      setMessage(payload.message || 'Signup completed. Please check your email.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-full max-w-md p-10 bg-zinc-900 rounded-3xl">
        <h1 className="text-4xl font-semibold tracking-tighter mb-8">Create Account</h1>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl px-6 py-4 mb-4"
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl px-6 py-4 mb-4"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 6 chars)"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl px-6 py-4 mb-6"
        />

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        {message && <p className="text-emerald-400 text-sm mb-4">{message}</p>}

        <button
          onClick={handleSignup}
          disabled={loading || !email || !password}
          className="w-full bg-white text-black py-4 rounded-2xl font-medium hover:bg-zinc-200 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </div>
    </div>
  );
}
