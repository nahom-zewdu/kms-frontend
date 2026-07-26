// app/dashboard/company/new/page.tsx
// It provides a form for the user to enter the company name and create it.
// Upon successful creation, it switches the active company to the newly created one and redirects the user to the company's dashboard.

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewCompanyPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError('');

    const res = await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Failed to create company');
      setLoading(false);
      return;
    }

    // Switch to the new company
    await fetch('/api/companies/switch', {
      method: 'POST',
      body: JSON.stringify({ companyId: data.company_id }),
    });

    router.push(`/dashboard/c/${data.company_id}`);
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-4xl font-semibold tracking-tighter mb-8">Create Company</h1>
      
      {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Company name"
        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-lg outline-none focus:border-white mb-6"
      />

      <button
        onClick={handleCreate}
        disabled={loading || !name.trim()}
        className="w-full bg-white text-black py-4 rounded-2xl font-medium hover:bg-zinc-200 disabled:opacity-50 transition"
      >
        {loading ? 'Creating...' : 'Create Company'}
      </button>
    </div>
  );
}
