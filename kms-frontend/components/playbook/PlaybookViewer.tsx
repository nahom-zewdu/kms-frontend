// components/playbook/PlaybookViewer.tsx
// This component renders the onboarding playbook viewer, which includes a left navigation for sections, the main content area displaying the playbook details, and a right sidebar with an embedded chat interface for asking questions about the playbook. The design is inspired by modern documentation sites and is built using Tailwind CSS for styling.

'use client';

import React from 'react';
import { Users, Settings, Clock, Target, MessageSquare } from 'lucide-react';

interface Section {
  id: string;
  title: string;
  content: string;
}

interface PlaybookViewerProps {
  playbook: {
    title: string;
    welcome_message: string;
    sections: Section[];
  };
  role: string;
}

export function PlaybookViewer({ playbook, role }: PlaybookViewerProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f4f4f5] flex">
      {/* Left Navigation */}
      <div className="w-72 border-r border-zinc-800 p-8 flex-shrink-0">
        <div className="mb-12">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-white rounded-sm" />
            <span className="text-2xl font-semibold tracking-tighter">KMS</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1 tracking-widest">ONBOARD</p>
        </div>

        <div className="uppercase text-xs tracking-widest text-zinc-500 mb-4">SECTIONS</div>
        <nav className="space-y-1">
          {playbook.sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="group flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-zinc-900 rounded-2xl transition-all duration-200"
            >
              <Target className="w-4 h-4 text-zinc-500 group-hover:text-white" />
              <span>{section.title}</span>
            </a>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-3xl mx-auto px-12 py-16">
        <div className="mb-16">
          <div className="text-xs uppercase tracking-[3px] text-zinc-500 mb-3">PERSONAL ONBOARDING</div>
          <h1 className="text-6xl font-semibold tracking-tighter leading-none">
            {playbook.title}
          </h1>
          <p className="mt-8 text-[17px] leading-relaxed text-zinc-400 max-w-prose">
            {playbook.welcome_message}
          </p>
        </div>

        {playbook.sections.map((section, index) => (
          <div key={section.id} id={section.id} className="mb-24 scroll-mt-24">
            <div className="flex items-center gap-4 mb-6">
              <div className="text-xs uppercase tracking-widest text-zinc-500">SECTION {index + 1}</div>
              <div className="flex-1 h-px bg-gradient-to-r from-zinc-800 to-transparent" />
            </div>

            <h2 className="text-4xl font-semibold tracking-tighter mb-8">
              {section.title}
            </h2>

            <div className="prose prose-zinc prose-invert max-w-none text-[17px] leading-relaxed">
              {section.content}
            </div>
          </div>
        ))}
      </div>

      {/* Right Sidebar — Embedded Chat */}
      <div className="w-96 border-l border-zinc-800 bg-zinc-950 p-8 flex-shrink-0">
        <div className="sticky top-8">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-5 h-5" />
            <div className="font-medium">Talk to KMS</div>
          </div>

          <div className="bg-zinc-900 rounded-3xl p-6 text-sm mb-6 h-[460px] overflow-auto">
            Hi! I'm here to help you with anything in this playbook.
            <br /><br />
            Ask me about systems, people, tasks, or how things work here.
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Ask anything about your role..."
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-700 rounded-3xl px-6 py-4 text-sm outline-none transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
