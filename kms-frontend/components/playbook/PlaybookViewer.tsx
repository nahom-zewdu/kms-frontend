// src/components/playbook/PlaybookViewer.tsx
// This component renders the playbook content, including sections and an embedded chat interface.
// It also fetches and displays architecture layers and key modules from the codebase visualizer API.
'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { MessageSquare, FileText, X } from 'lucide-react';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
};

interface Section {
  title: string;
  content: unknown;
}

type VisualizerItem = {
  name?: string;
  path?: string;
  description?: string;
  file_count?: number;
  importance?: number;
};

interface VisualizerData {
  learning_path?: {
    step: string | number;
    title: string;
    why?: string;
    effort?: string;
    difficulty?: string;
  }[];
  request_flows?: {
    name: string;
    description?: string;
    steps: string[];
  }[];
  architecture?: VisualizerItem[];
  modules?: VisualizerItem[];
  safe_zones?: {
    safe_first?: { path: string }[];
    high_risk?: { path: string }[];
  };
  dependency_impact?: {
    file: string;
    impact: string;
    downstream: string[];
  }[];
}

interface PlaybookViewerProps {
  playbook: { title: string; welcome_message: string; sections: Section[] };
  role: string;
}

export function PlaybookViewer({ playbook, role }: PlaybookViewerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: playbook.welcome_message || "Hi! Ask me anything about this playbook." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [visualizerData, setVisualizerData] = useState<VisualizerData | null>(null);
  const [selectedItem, setSelectedItem] = useState<VisualizerItem | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Load visualizer data
  useEffect(() => {
    const loadVisualizer = async () => {
      try {
        const res = await fetch(`http://localhost:8000/visualizer?role=${encodeURIComponent(role)}`);
        const data = await res.json();
        setVisualizerData(data.data || {});
      } catch (error) {
        console.error('Failed to load visualizer', error);
      }
    };
    loadVisualizer();
  }, [role]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    const context = selectedItem 
      ? `Current selection: ${selectedItem.name || selectedItem.path}. Description: ${selectedItem.description || ''}. This is part of the ${role} onboarding playbook.`
      : `Playbook: ${playbook.title}`;

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMsg,
          context: context
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.answer || "I don't have enough context yet." 
      }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't process that right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage();
  };

  return (
    <div className="flex min-h-dvh min-w-0 flex-col bg-[#0a0a0a] text-[#f4f4f5] lg:flex-row">
      <header className="border-b border-zinc-800 px-4 py-3 lg:hidden">
        <a href="#" className="text-sm font-semibold tracking-tight text-white">
          KMS
        </a>
        <p className="mt-0.5 text-[11px] uppercase tracking-wide text-zinc-500">Onboarding</p>
        <nav
          aria-label="Playbook sections"
          className="mt-3 flex gap-1 overflow-x-auto pb-1 text-sm"
        >
          {playbook.sections.map((section, i) => (
            <a
              key={i}
              href={`#section-${i}`}
              className="shrink-0 px-3 py-2 text-zinc-400 hover:bg-zinc-900 hover:text-white"
            >
              {section.title}
            </a>
          ))}
          <a
            href="#visualizer"
            className="shrink-0 px-3 py-2 text-zinc-400 hover:bg-zinc-900 hover:text-white"
          >
            Codebase Explorer
          </a>
        </nav>
      </header>

      <aside className="hidden w-56 shrink-0 flex-col overflow-y-auto border-r border-zinc-800 bg-[#080808] px-4 py-5 lg:sticky lg:top-0 lg:flex lg:h-dvh xl:w-60">
        <div className="mb-8">
          <a href="#" className="text-lg font-semibold tracking-tight text-white">KMS</a>
          <p className="mt-1 text-[11px] uppercase tracking-wide text-zinc-500">Onboarding</p>
        </div>
        <nav aria-label="Playbook sections" className="space-y-1 text-sm">
          {playbook.sections.map((section, i) => (
            <a
              key={i}
              href={`#section-${i}`}
              className="block break-words px-3 py-2 text-zinc-400 hover:bg-zinc-900 hover:text-white"
            >
              {section.title}
            </a>
          ))}
          <a
            href="#visualizer"
            className="flex items-center gap-2 px-3 py-2 text-zinc-400 hover:bg-zinc-900 hover:text-white"
          >
            <FileText className="h-4 w-4 shrink-0" />
            Codebase Explorer
          </a>
        </nav>
      </aside>

      <main className="mx-auto min-w-0 w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Playbook Sections */}
        {playbook.sections.map((section, i) => (
          <section key={i} id={`section-${i}`} className="mb-16 scroll-mt-6 sm:mb-20">
            <h2 className="mb-5 border-l-2 border-zinc-700 pl-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              {section.title}
            </h2>
            <div className="min-w-0 break-words text-sm leading-7 text-zinc-300 sm:text-base">
              {typeof section.content === 'string' ? section.content : JSON.stringify(section.content)}
            </div>
          </section>
        ))}



        {/* Visualizer Section */}
        <section id="visualizer" className="mb-16 scroll-mt-6 sm:mb-20">
          <h2 className="mb-6 border-l-2 border-zinc-700 pl-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            Codebase Explorer
          </h2>

          <div className="space-y-10">
            {/* Learning Path */}
            <div className="mt-12">
              <h3 className="mb-4 text-base font-medium">Recommended Learning Path</h3>
              <div className="space-y-2">
                {visualizerData?.learning_path?.map((step, i) => (
                  <div key={i} className="kms-card flex min-w-0 gap-4 p-4">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-zinc-800 text-sm font-medium text-zinc-200">
                      {step.step}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{step.title}</div>
                      <div className="text-sm text-zinc-400 mt-1">{step.why}</div>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                        <div>Effort: <span className="text-zinc-300">{step.effort}</span></div>
                        <div>Difficulty: <span className="text-zinc-300">{step.difficulty}</span></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Request Flows */}
            <div className="mt-12">
              <h3 className="mb-4 text-base font-medium">Key Request Flows</h3>
              <div className="grid min-w-0 grid-cols-1 gap-2">
                {visualizerData?.request_flows?.map((flow, i) => (
                  <div key={i} className="kms-card min-w-0 p-4">
                    <div className="font-medium">{flow.name}</div>
                    <div className="text-sm text-zinc-400 mt-2">{flow.description}</div>
                    <div className="mt-3 break-words text-xs text-zinc-500">{flow.steps.join(' → ')}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Architecture Map */}
            <div>
              <h3 className="mb-4 text-base font-medium">Architecture Overview</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 2xl:grid-cols-4">
                {visualizerData?.architecture?.map((layer, i) => (
                  <button
                    key={i}
                    type="button"
                    className="kms-card min-w-0 cursor-pointer p-4 text-left transition-colors hover:border-zinc-700 hover:bg-zinc-900"
                    onClick={() => setSelectedItem(layer)}
                  >
                    <div className="font-semibold">{layer.name}</div>
                    <div className="text-sm text-zinc-400 mt-2">{layer.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Modules */}
            <div>
              <h3 className="mb-4 text-base font-medium">Key Modules</h3>
              <div className="grid min-w-0 grid-cols-1 gap-2 md:grid-cols-2">
                {visualizerData?.modules?.map((mod, i) => (
                  <button
                    key={i}
                    type="button"
                    className="kms-card flex min-w-0 cursor-pointer items-start justify-between gap-3 p-4 text-left transition-colors hover:border-zinc-700 hover:bg-zinc-900"
                    onClick={() => setSelectedItem(mod)}
                  >
                    <div className="min-w-0">
                      <div className="font-medium">{mod.name}</div>
                      <div className="text-sm text-zinc-400">{mod.file_count} files</div>
                    </div>
                    <div className="shrink-0 bg-zinc-800 px-2 py-1 text-xs">
                      {Math.round(mod.importance * 100)}% importance
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Safe Contribution Zones */}
            <div className="mt-12">
              <h3 className="mb-4 text-base font-medium">Contribution Risk</h3>
              <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
                <div className="border border-emerald-900 bg-emerald-950/30 p-4 sm:p-5">
                  <h4 className="mb-3 text-sm font-medium text-emerald-400">Safe First Contributions</h4>
                  {visualizerData?.safe_zones?.safe_first?.map((item, i) => (
                    <div key={i} className="mb-2 break-words bg-zinc-900 p-3 text-sm last:mb-0">
                      {item.path} <span className="text-emerald-500">(Low Risk)</span>
                    </div>
                  ))}
                </div>

                <div className="border border-red-900 bg-red-950/30 p-4 sm:p-5">
                  <h4 className="mb-3 text-sm font-medium text-red-400">High-Risk Areas</h4>
                  {visualizerData?.safe_zones?.high_risk?.map((item, i) => (
                    <div key={i} className="mb-2 break-words bg-zinc-900 p-3 text-sm last:mb-0">
                      {item.path} <span className="text-red-500">(High Risk)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Dependency Impact */}
            <div className="mt-12">
              <h3 className="mb-4 text-base font-medium">Dependency Impact</h3>
              {visualizerData?.dependency_impact?.map((item, i) => (
                <div key={i} className="kms-card mb-2 min-w-0 p-4">
                  <div className="break-words font-medium">If you modify <span className="text-white">{item.file}</span></div>
                  <div className="text-sm text-zinc-400 mt-2">{item.impact}</div>
                  <div className="mt-3 break-words text-xs text-zinc-500">Affects: {item.downstream.join(", ")}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Context Panel (Right Sticky) */}
          {selectedItem && (
            <div className="kms-card mt-8 min-w-0 p-4 sm:p-5">
              <h3 className="break-words text-lg font-semibold">{selectedItem.name || selectedItem.path}</h3>
              <p className="text-zinc-400 leading-relaxed">{selectedItem.description}</p>
              {selectedItem.file_count && (
                <p className="mt-6"><strong>{selectedItem.file_count}</strong> files in this module</p>
              )}
            </div>
          )}
        </section>
      </main>

      <aside aria-label="Selected context" className="hidden w-72 shrink-0 overflow-y-auto border-l border-zinc-800 bg-zinc-950 p-5 xl:sticky xl:top-0 xl:flex xl:h-dvh xl:flex-col 2xl:w-80">
        <h2 className="mb-5 flex items-center gap-2 text-sm font-medium">
          <FileText className="h-4 w-4" /> Selected context
        </h2>

        {selectedItem ? (
          <div className="space-y-6">
            <div>
              <div className="font-semibold text-xl">{selectedItem.name || selectedItem.path}</div>
              <div className="text-sm text-zinc-400 mt-1">{selectedItem.description}</div>
            </div>

            {selectedItem.file_count && (
              <div className="kms-card p-4">
                <div className="text-sm text-zinc-400">Contains</div>
              <div className="text-xl font-semibold">{selectedItem.file_count} files</div>
              </div>
            )}

            <div className="text-sm text-zinc-400">
              Click on architecture layers or modules on the left to see detailed insights.
            </div>
          </div>
        ) : (
          <div className="text-zinc-500 text-center py-20">
            Select an item from the left to see rich context here
          </div>
        )}
      </aside>

      {/* Floating Chat Button */}
      <button
        type="button"
        onClick={() => setIsChatOpen((open) => !open)}
        aria-label={isChatOpen ? 'Close Ask KMS chat' : 'Open Ask KMS chat'}
        aria-expanded={isChatOpen}
        aria-controls={isChatOpen ? 'playbook-chat' : undefined}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center border border-zinc-700 bg-white text-black shadow-lg transition-colors hover:bg-zinc-200 sm:bottom-6 sm:right-6"
      >
        {isChatOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
      </button>

      {/* Floating Chat Panel */}
      {isChatOpen && (
        <section
          id="playbook-chat"
          aria-label="Ask KMS"
          className="fixed inset-x-3 bottom-20 z-50 flex h-[min(32rem,calc(100dvh-6.5rem))] min-h-0 flex-col overflow-hidden border border-zinc-700 bg-zinc-900 shadow-xl sm:inset-x-auto sm:bottom-24 sm:right-6 sm:w-[min(24rem,calc(100vw-3rem))]"
        >
          <div className="flex items-center justify-between border-b border-zinc-700 px-4 py-3">
            <h2 className="text-sm font-medium">Ask KMS</h2>
            <button
              type="button"
              onClick={() => setIsChatOpen(false)}
              aria-label="Close Ask KMS chat"
              className="inline-flex h-9 w-9 items-center justify-center text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 text-sm">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] break-words px-3 py-2 ${msg.role === 'user' ? 'bg-white text-black' : 'bg-zinc-800'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && <div className="text-zinc-500 pl-4">Thinking...</div>}
          </div>

          <form onSubmit={handleChatSubmit} className="flex min-w-0 gap-2 border-t border-zinc-700 p-3">
            <label htmlFor="playbook-chat-input" className="sr-only">
              Ask about the playbook
            </label>
            <input
              id="playbook-chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the selected item..."
              className="kms-input flex-1"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="kms-btn-primary h-auto px-3"
            >
              Send
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
