// app/onboard/[slug]/page.tsx
// This file defines the dynamic onboarding playbook page for different engineering roles based on the URL slug. It includes a sidebar for navigation, main content with playbook details, and a right sidebar for an embedded chat feature. The playbook data is currently hardcoded but will later be fetched from Supabase.

import { notFound } from 'next/navigation';

interface PlaybookPageProps {
  params: { slug: string };
}

export default async function PlaybookPage({ params }: PlaybookPageProps) {
  const { slug } = params;
  const role = slug.replace('-', ' ');

  // TODO: Later fetch real data from Supabase
  const playbook = {
    title: `Onboarding Playbook — ${role}`,
    welcome_message: `Welcome to the team. This playbook is designed to help you ramp up effectively as a ${role}.`,
    sections: [
      {
        title: "Week 1 Goals",
        content: "Focus on understanding our core systems, meeting key people, and setting up your development environment."
      },
      {
        title: "Key People & Ownership",
        content: "Nahom (Authentication), Helen (Payments), etc."
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar Navigation */}
      <div className="w-72 border-r border-zinc-800 p-8 flex-shrink-0">
        <div className="mb-12">
          <div className="text-xl font-semibold tracking-tight">KMS Onboard</div>
          <div className="text-sm text-zinc-500 mt-1">Engineering Intelligence</div>
        </div>

        <nav className="space-y-1">
          {playbook.sections.map((section, i) => (
            <a
              key={i}
              href={`#section-${i}`}
              className="block px-4 py-3 text-sm rounded-xl hover:bg-zinc-900 transition-colors"
            >
              {section.title}
            </a>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-12 max-w-3xl">
        <div className="mb-16">
          <div className="uppercase tracking-[3px] text-xs text-zinc-500 mb-2">ONBOARDING</div>
          <h1 className="text-5xl font-semibold tracking-tighter leading-none">
            {playbook.title}
          </h1>
          <p className="mt-6 text-xl text-zinc-400 leading-relaxed">
            {playbook.welcome_message}
          </p>
        </div>

        {playbook.sections.map((section, index) => (
          <div key={index} id={`section-${index}`} className="mb-20">
            <h2 className="text-3xl font-semibold tracking-tight mb-6 border-l-4 border-zinc-700 pl-6">
              {section.title}
            </h2>
            <div className="prose prose-zinc prose-invert max-w-none text-lg leading-relaxed">
              {section.content}
            </div>
          </div>
        ))}
      </div>

      {/* Right Sidebar — Embedded Chat */}
      <div className="w-96 border-l border-zinc-800 bg-zinc-950 p-8 flex-shrink-0">
        <div className="sticky top-8">
          <div className="text-sm uppercase tracking-widest text-zinc-500 mb-4">Ask KMS</div>
          <div className="bg-zinc-900 rounded-2xl p-6 text-sm">
            Ask anything about your role, systems, or tasks. I'm here to help.
          </div>
          {/* Chat input will go here later */}
        </div>
      </div>
    </div>
  );
}
