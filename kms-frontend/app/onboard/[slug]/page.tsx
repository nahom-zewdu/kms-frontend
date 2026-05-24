// app/onboard/[slug]/page.tsx
// This file defines the page component for displaying an onboarding playbook based on the URL slug. It uses a placeholder playbook for demonstration purposes, which should be replaced with a real fetch from Supabase in the future.

import { notFound } from 'next/navigation';
import { PlaybookViewer } from '@/components/playbook/PlaybookViewer';

interface Props {
  params: { slug: string };
}

export default async function PlaybookPage({ params }: Props) {
  const { slug } = params;
  const role = slug.replace(/-/g, ' ');

  // TODO: Replace with real Supabase fetch later
  const playbook = {
    title: `Onboarding Playbook — ${role}`,
    welcome_message: `Welcome. This playbook is tailored for you as a ${role}. It pulls from our real knowledge base to help you ramp up effectively.`,
    sections: [
      {
        id: "week1",
        title: "Week 1 Goals",
        content: "Focus on understanding our core systems, meeting key people, and setting up your development environment."
      },
      {
        id: "people",
        title: "Key People & Ownership",
        content: "Nahom leads authentication and KMS systems. Helen owns payment infrastructure."
      },
      {
        id: "systems",
        title: "Core Systems",
        content: "Authentication Service, Payment Feature, KMS Repository."
      }
    ]
  };

  return <PlaybookViewer playbook={playbook} role={role} />;
}
