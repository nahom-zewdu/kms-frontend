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
  const roleKey = slug.replace(/-/g, ' ');

  // Fetch real playbook from Supabase
  const { data: playbook, error } = await supabase
    .from('playbooks')
    .select('*')
    .eq('role', roleKey)
    .eq('is_active', true)
    .single();

  if (error || !playbook) {
    notFound();
  }

  return (
    <PlaybookViewer 
      playbook={playbook.content} 
      role={roleKey} 
      playbookId={playbook.id}
    />
  );
}
