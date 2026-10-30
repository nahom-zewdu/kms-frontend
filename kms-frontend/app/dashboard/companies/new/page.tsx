'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';

export default function NewCompanyPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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

    await fetch('/api/companies/switch', {
      method: 'POST',
      body: JSON.stringify({ companyId: data.company_id }),
    });

    router.push(`/dashboard/c/${data.company_id}`);
  };

  return (
    <div className="mx-auto max-w-md">
      <PageHeader
        title="Create company"
        description="A company is the workspace for a codebase and its first-week paths."
      />

      <form onSubmit={handleCreate} className="space-y-4">
        {error && <p className="text-sm text-red-400">{error}</p>}

        <div>
          <label className="kms-label" htmlFor="company-name">
            Company name
          </label>
          <input
            id="company-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Acme Engineering"
            className="kms-input"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="kms-btn-primary w-full"
        >
          {loading ? 'Creating...' : 'Create company'}
        </button>
      </form>
    </div>
  );
}
