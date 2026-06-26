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
import { FileText, MessageSquare, Target, User, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { send } from 'process';

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

  const collapsedFolders = useRef<Set<string>>(new Set());

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(`/api/playbook/${playbookId}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input, role }),
      });

      const data = await res.json();
      const assistantMessage: ChatMessage = { role: 'assistant', content: data.answer || "I don't know the answer to that." };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: "There was an error processing your request." }]);
    } finally {
      setIsLoading(false);
    }
  }

  // Load codebase files
  useEffect(() => {
    const loadCodebase = async () => {
      try {
        const res = await fetch(`/api/codebase?role=${encodeURIComponent(role)}`);
        const data = await res.json();

        if (!data.nodes || data.nodes.length === 0) return;

        const flowNodes: Node[] = [];
        const flowEdges: Edge[] = [];
        const folderNodes = new Map();

        data.nodes.forEach((nodeData: any) => {
          const parts = nodeData.data.fullPath.split('/');
          const folderName = parts.length > 1 ? parts[0] : 'root';

          // Create folder node
          if (!folderNodes.has(folderName)) {
            const folderNode: Node = {
              id: `folder-${folderName}`,
              type: 'default',
              position: { x: 0, y: 0 },
              data: { 
                label: folderName, 
                isFolder: true,
                collapsed: collapsedFolders.current.has(folderName)
              },
              style: { 
                background: '#27272a', 
                color: '#e4e4e7', 
                border: '2px solid #52525b',
                width: 280,
                fontWeight: 600,
                padding: '12px 16px'
              },
            };
            flowNodes.push(folderNode);
            folderNodes.set(folderName, folderNode);
          }

          // File node
          const fileNode: Node = {
            id: nodeData.id,
            type: 'default',
            position: { x: 0, y: 0 },
            parentId: `folder-${folderName}`,
            extent: 'parent',
            data: nodeData.data,
            style: { 
              background: '#18181b', 
              color: '#e4e4e7', 
              border: '1px solid #3f3f46',
              width: 240 
            },
          };
          flowNodes.push(fileNode);
        });

        setNodes(flowNodes);
        setEdges(flowEdges);
      } catch (err) {
        console.error('Failed to load codebase:', err);
      }
    };

    loadCodebase();
  }, [role]);

  const onNodeClick = useCallback((_: any, node: any) => {
    if (node.data.isFolder) {
      const folderId = node.id;
      const isCollapsed = collapsedFolders.current.has(folderId);
      
      if (isCollapsed) {
        collapsedFolders.current.delete(folderId);
      } else {
        collapsedFolders.current.add(folderId);
      }
      
      setNodes(nds => [...nds]); // force re-render
      return;
    }

    setSelectedNode(node.data);
    
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `**${node.data.fullPath}**\n\nLanguage: ${node.data.language || 'Unknown'}\nLast changed by: ${node.data.author || 'Unknown'}\n\nWhat would you like to know about this file?`
    }]);
  }, []);

  const highlightForRole = () => {
    setHighlightRole(!highlightRole);
    // Future: filter/highlight based on role
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f4f4f5] flex">
      {/* Left Navigation - your existing nav */}

      {/* Main Content */}
      <div className="flex-1 max-w-5xl mx-auto px-12 py-16 overflow-auto">
        <h1 className="text-6xl font-semibold tracking-tighter mb-4">{playbook.title}</h1>
        <p className="text-zinc-400 text-lg mb-12">{playbook.welcome_message}</p>

        {/* Visualizer */}
        <div id="codebase" className="mb-24 scroll-mt-20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-4xl font-semibold flex items-center gap-3">
              <FileText className="w-8 h-8" /> Codebase Explorer
            </h2>
            
            <div className="flex gap-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search files..."
                className="bg-zinc-900 border border-zinc-700 pl-10 py-2.5 rounded-2xl text-sm focus:border-white outline-none w-80"
              />
              <button
                onClick={highlightForRole}
                className="bg-zinc-800 hover:bg-zinc-700 px-5 py-2.5 rounded-2xl text-sm flex items-center gap-2 transition"
              >
                Highlight for {role}
              </button>
            </div>
          </div>

          <div className="h-[720px] bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden">
            <ReactFlow
              nodes={nodes}
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

export function PlaybookViewer(props: PlaybookViewerProps) {
  return (
    <ReactFlowProvider>
      <PlaybookViewerContent {...props} />
    </ReactFlowProvider>
  );
}
