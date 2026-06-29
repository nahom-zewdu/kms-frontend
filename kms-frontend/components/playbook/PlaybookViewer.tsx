// src/components/playbook/PlaybookViewer.tsx
// This component renders the playbook content, including sections and an embedded chat interface.
// It also fetches and displays architecture layers and key modules from the codebase visualizer API.
'use client';

import React, { useEffect, useRef, useState, ReactNode } from 'react';
import { Target, MessageSquare, FileText, X } from 'lucide-react';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
};

interface Section {
  title: string;
  content: any;
}

interface PlaybookViewerProps {
  playbook: { title: string; welcome_message: string; sections: Section[] };
  role: string;
  playbookId: string;
}

export function PlaybookViewer({ playbook, role, playbookId }: PlaybookViewerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: playbook.welcome_message || "Hi! Ask me anything about this playbook or the codebase." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [visualizerData, setVisualizerData] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load visualizer data
  useEffect(() => {
    const loadVisualizer = async () => {
      try {
        const res = await fetch(`http://0.0.0.0:8000/visualizer?role=${encodeURIComponent(role)}`);
        const data = await res.json();
        setVisualizerData(data.data || {});
      } catch (e) {
        console.error("Failed to load visualizer", e);
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

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMsg,
          context: selectedItem ? `Current selection: ${selectedItem.name || selectedItem.path}` : `Playbook: ${playbook.title}`
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer || "I don't have enough context yet." }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't process that." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f4f4f5] flex">
      {/* Left Navigation */}
      <div className="w-72 border-r border-zinc-800 p-8 flex-shrink-0">
        <div className="mb-12">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-white rounded" />
            <span className="text-3xl font-semibold tracking-tighter">KMS</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">ONBOARDING</p>
        </div>

        <nav className="space-y-1 text-sm">
          {playbook.sections.map((section, i) => (
            <a key={i} href={`#section-${i}`} className="block px-4 py-3 hover:bg-zinc-900 rounded-2xl transition">
              {section.title}
            </a>
          ))}
          <a href="#visualizer" className="block px-4 py-3 hover:bg-zinc-900 rounded-2xl transition flex items-center gap-2">
            <FileText className="w-4 h-4" /> Codebase Explorer
          </a>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-5xl mx-auto px-12 py-16 overflow-auto">
        {/* Playbook Sections */}
        {playbook.sections.map((section, i) => (
          <div key={i} id={`section-${i}`} className="mb-24 scroll-mt-20">
            <h2 className="text-4xl font-semibold tracking-tight mb-8 border-l-4 border-zinc-700 pl-6">
              {section.title}
            </h2>
            <div className="prose prose-zinc prose-invert text-[17px] leading-relaxed">
              {typeof section.content === 'string' ? section.content : JSON.stringify(section.content)}
            </div>
          </div>
        ))}

        {/* Visualizer */}
        <div id="visualizer" className="mb-24 scroll-mt-20">
          <h2 className="text-4xl font-semibold tracking-tight mb-8 border-l-4 border-zinc-700 pl-6">Codebase Explorer</h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Architecture & Modules */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-zinc-900 rounded-3xl p-8">
                <h3 className="text-lg font-medium mb-6">Architecture Layers</h3>
                {visualizerData?.architecture?.map((layer: any, i: number) => (
                  <div 
                    key={i} 
                    className="mb-4 p-5 bg-zinc-950 rounded-2xl cursor-pointer hover:bg-zinc-800 transition-all"
                    onClick={() => setSelectedItem(layer)}
                  >
                    <div className="font-semibold">{layer.name}</div>
                    <div className="text-sm text-zinc-400 mt-1">{layer.description}</div>
                  </div>
                ))}
              </div>

              <div className="bg-zinc-900 rounded-3xl p-8">
                <h3 className="text-lg font-medium mb-6">Key Modules</h3>
                {visualizerData?.modules?.map((mod: any, i: number) => (
                  <div 
                    key={i} 
                    className="mb-3 p-5 bg-zinc-950 rounded-2xl cursor-pointer hover:bg-zinc-800 transition flex justify-between"
                    onClick={() => setSelectedItem(mod)}
                  >
                    <div>
                      <div className="font-medium">{mod.name}</div>
                      <div className="text-xs text-zinc-500">{mod.file_count} files</div>
                    </div>
                    <div className="text-xs px-3 py-1 bg-zinc-800 rounded-full self-start">
                      {Math.round(mod.importance * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Context Panel (as requested) */}
            <div className="lg:col-span-7">
              <div className="bg-zinc-900 rounded-3xl p-8 min-h-[520px] sticky top-8">
                {selectedItem ? (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-semibold">{selectedItem.name || selectedItem.path}</h3>
                    <p className="text-zinc-400 leading-relaxed">
                      {selectedItem.description || "This component is central to the system's core functionality."}
                    </p>
                    {selectedItem.file_count && (
                      <p className="text-sm"><strong>{selectedItem.file_count}</strong> files in this module</p>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-zinc-500 text-center">
                    Select an architecture layer or module on the left to see rich context and recommendations
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition z-50"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Floating Chat Panel */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-8 w-96 bg-zinc-900 border border-zinc-700 rounded-3xl shadow-2xl z-50 overflow-hidden">
          <div className="p-4 border-b border-zinc-700 flex items-center justify-between">
            <div className="font-medium">Ask KMS</div>
            <button onClick={() => setIsChatOpen(false)} className="text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="h-96 overflow-auto p-4 space-y-4 text-sm" ref={chatEndRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-white text-black' : 'bg-zinc-800'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && <div className="text-zinc-500 pl-4">Thinking...</div>}
          </div>

          <div className="p-4 border-t border-zinc-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about the selected item..."
                className="flex-1 bg-zinc-950 border border-zinc-700 focus:border-zinc-600 rounded-2xl px-5 py-3 text-sm outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-white text-black px-6 rounded-2xl font-medium hover:bg-zinc-200 transition disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
