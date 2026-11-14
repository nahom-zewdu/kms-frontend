// app/onboard/[slug]/page.tsx
// Legacy role-based playbooks are private to the active company until a
// revocable, unguessable public share-token model is implemented.

import { notFound, redirect } from 'next/navigation';
import { PlaybookViewer } from '@/components/playbook/PlaybookViewer';
import { getUserContext } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase-server';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PlaybookPage({ params }: Props) {
  const user = await getUserContext();
  if (!user) redirect('/login');

  const companyId = user.activeCompany?.id;
  if (!companyId) notFound();

  const { slug } = await params;
  const roleKey = slug.toLowerCase();
  const supabase = await createServerSupabase();

  const { data: playbook, error } = await supabase
    .from('playbooks')
    .select('content')
    .eq('company_id', companyId)
    .eq('role', roleKey)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !playbook) notFound();

  const playbookContent = typeof playbook.content === 'string'
    ? JSON.parse(playbook.content)
    : playbook.content;

  return <PlaybookViewer playbook={playbookContent} role={roleKey} />;
}
