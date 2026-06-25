// components/playbook/PlaybookViewer.tsx
// This component is responsible for rendering the onboarding playbook viewer. 
// It displays the playbook's title, welcome message, and sections in a structured format.
'use client';

import React, { useEffect, useRef, useState, ReactNode, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Target, MessageSquare, FileText, Users } from 'lucide-react';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
};

interface Section {
  title: string;
  content: string | Record<string, any> | Array<any>;
}

interface PlaybookViewerProps {
  playbook: {
    title: string;
    welcome_message: string;
    sections: Section[];
  };
  role: string;
  playbookId: string;
}

function renderSectionContent(content: any): ReactNode {
  if (typeof content === 'string') return <p className="text-zinc-300">{content}</p>;
  if (Array.isArray(content)) {
    return <div className="space-y-4">{content.map((item, i) => <div key={i}>{renderSectionContent(item)}</div>)}</div>;
  }
  if (content && typeof content === 'object') {
    return (
      <div className="space-y-4">
        {Object.entries(content).map(([key, value]) => (
          <div key={key}>
            <div className="font-semibold text-white mb-1">{key}</div>
            <div>{renderSectionContent(value)}</div>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function PlaybookViewer({ playbook, role, playbookId }: PlaybookViewerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: playbook.welcome_message || "Hi! Ask me anything about this playbook or the codebase." },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // React Flow
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Load codebase files
  useEffect(() => {
    const loadCodebase = async () => {
      try {
        const res = await fetch(`/api/codebase?role=${encodeURIComponent(role)}`);
        const data = await res.json();
        
        if (data.nodes && data.nodes.length > 0) {
          setNodes(data.nodes);
        } else {
          // Fallback nodes if no data
          setNodes([{
            id: 'no-files',
            type: 'default',
            position: { x: 100, y: 100 },
            data: { label: 'No files indexed yet' },
            style: { background: '#18181b', color: '#e4e4e7' }
          }]);
        }
      } catch (err) {
        console.error('Failed to load codebase:', err);
      }
    };

    loadCodebase();
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
        body: JSON.stringify({ question: userMsg, context: `Playbook: ${playbook.title}` }),
      });
      const data = await res.json();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer || "I couldn't find relevant information.",
        sources: data.sources,
      }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, something went wrong." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const onNodeClick = useCallback((event: any, node: any) => {
    // Open context in chat or dedicated panel
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `Selected: ${node.data.fullPath}\n\nThis file is part of the ${node.data.folder} module.`
    }]);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f4f4f5] flex">
      {/* Left Navigation */}
      <div className="w-72 border-r border-zinc-800 p-8 flex-shrink-0 overflow-auto">
        <div className="mb-12">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-white rounded" />
            <span className="text-3xl font-semibold tracking-tighter">KMS</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">ONBOARDING</p>
        </div>

        <nav className="space-y-1">
          {playbook.sections.map((section, i) => (
            <a
              key={i}
              href={`#section-${i}`}
              className="group flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-zinc-900 rounded-2xl transition-all"
            >
              <Target className="w-4 h-4 text-zinc-500" />
              {section.title}
            </a>
          ))}
          <a href="#codebase" className="group flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-zinc-900 rounded-2xl transition-all">
            <FileText className="w-4 h-4 text-zinc-500" />
            Codebase Map
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-4xl mx-auto px-12 py-16 overflow-auto">
        <div className="mb-16">
          <h1 className="text-6xl font-semibold tracking-tighter leading-none">{playbook.title}</h1>
          <p className="mt-8 text-[17px] leading-relaxed text-zinc-400">{playbook.welcome_message}</p>
        </div>

        {playbook.sections.map((section, i) => (
          <div key={i} id={`section-${i}`} className="mb-24 scroll-mt-20">
            <h2 className="text-4xl font-semibold tracking-tight mb-8 border-l-4 border-zinc-700 pl-6">
              {section.title}
            </h2>
            <div className="prose prose-zinc prose-invert text-[17px] leading-relaxed">
              {renderSectionContent(section.content)}
            </div>
          </div>
        ))}

        {/* Codebase Visualizer Section */}
        <div id="codebase" className="mb-24 scroll-mt-20">
          <h2 className="text-4xl font-semibold tracking-tight mb-8 border-l-4 border-zinc-700 pl-6 flex items-center gap-3">
            <FileText className="w-8 h-8" /> Codebase Explorer
          </h2>
          
          <div className="h-[680px] bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
              attributionPosition="bottom-left"
              onNodeClick={onNodeClick}
            >
              <Controls />
              <Background color="#27272a" />
            </ReactFlow>
          </div>

          <p className="text-xs text-zinc-500 mt-3 text-center">
            Nodes show files from your repository. Click a node to see context in the sidebar.
          </p>
        </div>
      </div>

      {/* Embedded Chat Sidebar */}
      <div className="w-96 border-l border-zinc-800 bg-zinc-950 p-8 flex-shrink-0">
        <div className="sticky top-8">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-5 h-5" />
            <div className="font-medium">Ask KMS</div>
          </div>

          <div className="h-[520px] bg-zinc-900 rounded-3xl p-5 overflow-auto mb-4 space-y-4 text-sm">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-white text-black' : 'bg-zinc-800'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && <div className="text-zinc-500 pl-4">Thinking...</div>}
            <div ref={chatEndRef} />
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about any file or concept..."
              className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-zinc-700 rounded-2xl px-5 py-3 text-sm outline-none"
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
    </div>
  );
}
