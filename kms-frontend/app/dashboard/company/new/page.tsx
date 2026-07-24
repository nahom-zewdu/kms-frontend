// app/dashboard/company/new/page.tsx
// This is the page for creating a new company. 
// It allows the user to enter a company name and submit it to the backend.

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewCompanyPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    const res = await fetch('/api/companies', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-4xl font-semibold tracking-tighter mb-8">Create Company</h1>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Company Name"
        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-lg mb-6"
      />
      <button onClick={handleCreate} disabled={loading} className="w-full bg-white text-black py-4 rounded-2xl font-medium">
        Create Company
      </button>
    </div>
  );
}
