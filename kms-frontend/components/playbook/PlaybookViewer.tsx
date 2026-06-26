// components/playbook/PlaybookViewer.tsx
// This component is responsible for rendering the onboarding playbook viewer. 
// It displays the playbook's title, welcome message, and sections in a structured format.
'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { FileText, MessageSquare, Target, User, Clock, Search } from 'lucide-react';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
};

interface Section { title: string; content: any; }

interface PlaybookViewerProps {
  playbook: { title: string; welcome_message: string; sections: Section[] };
  role: string;
  playbookId: string;
}

function PlaybookViewerContent({ playbook, role, playbookId }: PlaybookViewerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: playbook.welcome_message || "Explore the codebase or ask me anything." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [highlightRole, setHighlightRole] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load codebase
  useEffect(() => {
    const loadCodebase = async () => {
      try {
        const res = await fetch(`/api/codebase?role=${encodeURIComponent(role)}`);
        const data = await res.json();
        if (data.nodes) {
          setNodes(data.nodes);
          setEdges(data.edges || []);
        }
      } catch (err) {
        console.error('Failed to load codebase:', err);
      }
    };
    loadCodebase();
  }, [role]);

  const filteredNodes = useMemo(() => {
    if (!searchTerm) return nodes;
    return nodes.filter(n => 
      n.data.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.data.fullPath?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [nodes, searchTerm]);

  const onNodeClick = useCallback((_: any, node: any) => {
    setSelectedNode(node.data);
    
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `**${node.data.label || node.data.fullPath}**\n\nPath: ${node.data.fullPath}\nLanguage: ${node.data.language || 'Unknown'}\nLast changed by: ${node.data.author || 'Unknown'}\n\nWhat would you like to know?`
    }]);
  }, []);

  const highlightForRole = () => {
    setHighlightRole(!highlightRole);
  };

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
        body: JSON.stringify({ question: userMsg }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer || "I don't have enough context yet." }]);
    } catch {
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

        <nav className="space-y-1">
          {playbook.sections.map((section, i) => (
            <a key={i} href={`#section-${i}`} className="group flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-zinc-900 rounded-2xl transition-all">
              <Target className="w-4 h-4 text-zinc-500" />
              {section.title}
            </a>
          ))}
          <a href="#codebase" className="group flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-zinc-900 rounded-2xl transition-all bg-zinc-900">
            <FileText className="w-4 h-4" /> Codebase Map
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-5xl mx-auto px-12 py-16 overflow-auto">
        <h1 className="text-6xl font-semibold tracking-tighter mb-4">{playbook.title}</h1>
        <p className="text-zinc-400 text-lg mb-12">{playbook.welcome_message}</p>

        {/* Visualizer */}
        <div id="codebase" className="mb-24 scroll-mt-20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-4xl font-semibold flex items-center gap-3">
              <FileText className="w-8 h-8" /> Codebase Architecture
            </h2>
            
            <div className="flex gap-3">
              <div className="relative w-80">
                <Search className="absolute left-3 top-3 text-zinc-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search files or modules..."
                  className="w-full bg-zinc-900 border border-zinc-700 pl-10 py-3 rounded-2xl text-sm focus:border-white outline-none"
                />
              </div>
              <button
                onClick={highlightForRole}
                className="bg-white text-black px-6 py-3 rounded-2xl font-medium hover:bg-zinc-200 transition"
              >
                Highlight for {role}
              </button>
            </div>
          </div>

          <div className="h-[720px] bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden">
            <ReactFlow
              nodes={filteredNodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              fitView
            >
              <Controls />
              <Background color="#27272a" />
            </ReactFlow>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-96 border-l border-zinc-800 bg-zinc-950 p-8 flex-shrink-0 overflow-auto">
        <div className="sticky top-8 space-y-8">
          {selectedNode && (
            <div className="bg-zinc-900 rounded-3xl p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" /> {selectedNode.label}
              </h3>
              <div className="space-y-4 text-sm">
                <div><span className="text-zinc-500">Full Path:</span> {selectedNode.fullPath}</div>
                <div><span className="text-zinc-500">Language:</span> {selectedNode.language}</div>
                {selectedNode.author && <div><span className="text-zinc-500">Last Author:</span> {selectedNode.author}</div>}
                {selectedNode.lastModified && <div><span className="text-zinc-500">Last Modified:</span> {selectedNode.lastModified}</div>}
              </div>
            </div>
          )}

          {/* Chat */}
          <div>
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
                placeholder="Ask about any file or module..."
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
    </div>
  );
}

export function PlaybookViewer(props: PlaybookViewerProps) {
  return (
    <ReactFlowProvider>
      <PlaybookViewerContent {...props} />
    </ReactFlowProvider>
  );
}
