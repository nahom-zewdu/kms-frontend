// app/onboard/[slug]/page.tsx
// This page component is responsible for rendering the onboarding playbook based on the dynamic slug in the URL.
// It fetches the relevant playbook data from Supabase using the slug to identify the role, and then renders the PlaybookViewer component with the fetched data. 
// If no playbook is found for the given slug, it returns a 404 not found response.

import { notFound } from 'next/navigation';
import { PlaybookViewer } from '@/components/playbook/PlaybookViewer';
import { supabase } from '@/lib/supabase';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PlaybookPage({ params }: Props) {
  const { slug } = await params;
  const roleKey = slug.toLowerCase();

  // Fetch the latest active playbook for this role from Supabase
  const { data: playbook, error } = await supabase
    .from('playbooks')
    .select('*')
    .eq('role', roleKey)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  console.log('Fetched playbook:', playbook, 'Error:', error);

  if (error || !playbook) {
    notFound();
  }

  const playbookContent = typeof playbook.content === 'string'
    ? JSON.parse(playbook.content)
    : playbook.content;

  return (
    <PlaybookViewer 
      playbook={playbookContent} 
      role={roleKey} 
      playbookId={playbook.id}
    />
  );
}
