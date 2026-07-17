// app/login/page.tsx
// This is the login page for the KMS application.
// It allows users to sign in using their email address by sending a magic link via Supabase authentication.

'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { 
        emailRedirectTo: `${window.location.origin}/auth/callback` 
      }
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email for the magic link.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-zinc-100">
      <div className="w-full max-w-md p-10 bg-zinc-900 rounded-3xl">
        <h1 className="text-4xl font-semibold tracking-tighter mb-8">Sign in to KMS</h1>
        
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl px-6 py-4 text-lg focus:border-white outline-none mb-6"
        />

        <button
          onClick={handleLogin}
          disabled={loading || !email}
          className="w-full bg-white text-black py-4 rounded-2xl font-medium hover:bg-zinc-200 disabled:opacity-50 transition"
        >
          {loading ? "Sending magic link..." : "Send Magic Link"}
        </button>

        {message && <p className="mt-6 text-center text-sm text-zinc-400">{message}</p>}
      </div>
    </div>
  );
}
