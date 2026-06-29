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
    { role: 'assistant', content: playbook.welcome_message || "Hi! Ask me anything about this playbook." }
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
        const res = await fetch(`http://localhost:8000/visualizer?role=${encodeURIComponent(role)}`);
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
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't process that right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f4f4f5] flex relative">
      {/* Left Navigation */}
      <div className="w-72 border-r border-zinc-800 p-8 flex-shrink-0 overflow-auto">
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

      {/* Main Content */}
      <div className="flex-1 max-w-4xl mx-auto px-12 py-16 overflow-auto">
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



        {/* Visualizer Section */}
        <div id="visualizer" className="mb-24 scroll-mt-20">
          <h2 className="text-4xl font-semibold tracking-tight mb-8 border-l-4 border-zinc-700 pl-6">Codebase Explorer</h2>

          <div className="space-y-12">
            {/* Learning Path */}
            <div className="mt-12">
              <h3 className="text-xl font-medium mb-6">Recommended Learning Path</h3>
              <div className="space-y-4">
                {visualizerData?.learning_path?.map((step: any, i: number) => (
                  <div key={i} className="bg-zinc-900 rounded-3xl p-6 flex gap-6">
                    <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{step.title}</div>
                      <div className="text-sm text-zinc-400 mt-1">{step.why}</div>
                      <div className="flex gap-4 mt-3 text-xs">
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
              <h3 className="text-xl font-medium mb-6">Key Request Flows</h3>
              <div className="grid grid-cols-1 gap-4">
                {visualizerData?.request_flows?.map((flow: any, i: number) => (
                  <div key={i} className="bg-zinc-900 rounded-3xl p-6">
                    <div className="font-medium">{flow.name}</div>
                    <div className="text-sm text-zinc-400 mt-2">{flow.description}</div>
                    <div className="mt-4 text-xs text-zinc-500">{flow.steps.join(" → ")}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Architecture Map */}
            <div>
              <h3 className="text-xl font-medium mb-6">Architecture Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {visualizerData?.architecture?.map((layer: any, i: number) => (
                  <div 
                    key={i} 
                    className="bg-zinc-900 rounded-3xl p-6 cursor-pointer hover:bg-zinc-800 transition"
                    onClick={() => setSelectedItem(layer)}
                  >
                    <div className="font-semibold">{layer.name}</div>
                    <div className="text-sm text-zinc-400 mt-2">{layer.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modules */}
            <div>
              <h3 className="text-xl font-medium mb-6">Key Modules</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visualizerData?.modules?.map((mod: any, i: number) => (
                  <div 
                    key={i} 
                    className="bg-zinc-900 rounded-3xl p-6 cursor-pointer hover:bg-zinc-800 transition flex justify-between items-start"
                    onClick={() => setSelectedItem(mod)}
                  >
                    <div>
                      <div className="font-medium">{mod.name}</div>
                      <div className="text-sm text-zinc-400">{mod.file_count} files</div>
                    </div>
                    <div className="text-xs px-3 py-1 bg-zinc-800 rounded-full">
                      {Math.round(mod.importance * 100)}% importance
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Safe Contribution Zones */}
            <div className="mt-12">
              <h3 className="text-xl font-medium mb-6">Safe Contribution Zones</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-emerald-950/50 border border-emerald-900 rounded-3xl p-8">
                  <h4 className="text-emerald-400 font-medium mb-4">Safe First Contributions</h4>
                  {visualizerData?.safe_zones?.safe_first?.map((item: any, i: number) => (
                    <div key={i} className="mb-4 p-4 bg-zinc-900 rounded-2xl text-sm">
                      {item.path} <span className="text-emerald-500">(Low Risk)</span>
                    </div>
                  ))}
                </div>

                <div className="bg-red-950/50 border border-red-900 rounded-3xl p-8">
                  <h4 className="text-red-400 font-medium mb-4">High-Risk Areas</h4>
                  {visualizerData?.safe_zones?.high_risk?.map((item: any, i: number) => (
                    <div key={i} className="mb-4 p-4 bg-zinc-900 rounded-2xl text-sm">
                      {item.path} <span className="text-red-500">(High Risk)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Dependency Impact */}
            <div className="mt-12">
              <h3 className="text-xl font-medium mb-6">Dependency Impact</h3>
              {visualizerData?.dependency_impact?.map((item: any, i: number) => (
                <div key={i} className="bg-zinc-900 rounded-3xl p-8 mb-6">
                  <div className="font-medium">If you modify <span className="text-white">{item.file}</span></div>
                  <div className="text-sm text-zinc-400 mt-2">{item.impact}</div>
                  <div className="text-xs text-zinc-500 mt-4">Affects: {item.downstream.join(", ")}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Context Panel (Right Sticky) */}
          {selectedItem && (
            <div className="mt-12 bg-zinc-900 rounded-3xl p-8 border border-zinc-700">
              <h3 className="text-2xl font-semibold mb-6">{selectedItem.name}</h3>
              <p className="text-zinc-400 leading-relaxed">{selectedItem.description}</p>
              {selectedItem.file_count && (
                <p className="mt-6"><strong>{selectedItem.file_count}</strong> files in this module</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Right Context Panel */}
      <div className="w-96 border-l border-zinc-800 bg-zinc-950 p-8 flex-shrink-0 overflow-auto sticky top-0 h-screen">
        <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5" /> Selected Context
        </h3>

        {selectedItem ? (
          <div className="space-y-6">
            <div>
              <div className="font-semibold text-xl">{selectedItem.name || selectedItem.path}</div>
              <div className="text-sm text-zinc-400 mt-1">{selectedItem.description}</div>
            </div>

            {selectedItem.file_count && (
              <div className="bg-zinc-900 rounded-2xl p-4">
                <div className="text-sm text-zinc-400">Contains</div>
                <div className="text-2xl font-semibold">{selectedItem.file_count} files</div>
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
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition z-50"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Floating Chat Panel */}
      {isChatOpen && (
        <div className="fixed bottom-28 right-8 w-96 bg-zinc-900 border border-zinc-700 rounded-3xl shadow-2xl overflow-hidden z-50 flex flex-col h-[520px]">
          <div className="p-4 border-b border-zinc-700 flex items-center justify-between">
            <div className="font-medium">Ask KMS</div>
            <button onClick={() => setIsChatOpen(false)} className="text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-5 overflow-auto space-y-4 text-sm">
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
                className="flex-1 bg-zinc-950 border border-zinc-700 rounded-2xl px-5 py-3 text-sm outline-none focus:border-zinc-600"
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
