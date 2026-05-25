// components/playbook/PlaybookViewer.tsx
// This component is responsible for rendering the playbook content and providing an embedded chat interface for users to ask questions about the playbook. 
// It receives the playbook data, role, and playbook ID as props, and manages the chat state locally. 
// The chat interface allows users to interact with KMS by sending questions, which are then processed by an API route that queries the relevant information from the playbook context. 
// The component uses React's useState hook to manage the chat messages, user input, and loading state. 
// When a user sends a message, it updates the chat state and makes a POST request to the /api/query endpoint with the user's question and the playbook context. 
// The response from the API is then added to the chat messages, allowing for an interactive experience as users can ask follow-up questions based on the playbook content.

'use client';

import React, { useEffect, useRef, useState, ReactNode } from 'react';
import { Target, MessageSquare } from 'lucide-react';

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: string[];
  confidence?: string;
  reasoning?: string;
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

function renderSectionContent(content: string | Record<string, any> | Array<any>): ReactNode {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return (
      <div className="space-y-4">
        {content.map((item, idx) => (
          <div key={idx}>{renderSectionContent(item)}</div>
        ))}
      </div>
    );
  }

  if (content && typeof content === 'object') {
    return (
      <div className="space-y-4">
        {Object.entries(content).map(([key, value]) => (
          <div key={key} className="space-y-1">
            <div className="font-semibold">{key}</div>
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
    { role: 'assistant', content: playbook.welcome_message || "Hi! I'm KMS. Ask me anything about this playbook." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: userMessage,
          context: `Playbook: ${playbook.title}`
        })
      });

      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer || "I couldn't find relevant information.",
        sources: Array.isArray(data.sources) ? data.sources : [],
        confidence: data.confidence,
        reasoning: data.reasoning,
      }] );
    } catch (error) {
      console.error('Chat query failed:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I couldn't process that right now. Please try again later.",
      }] );
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
            <div className="w-5 h-5 bg-white rounded" />
            <span className="text-2xl font-semibold tracking-tighter">KMS</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">ONBOARD</p>
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
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-3xl mx-auto px-12 py-16">
        <div className="mb-16">
          <h1 className="text-6xl font-semibold tracking-tighter leading-none">
            {playbook.title}
          </h1>
          <p className="mt-8 text-[17px] leading-relaxed text-zinc-400">
            {playbook.welcome_message}
          </p>
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
                  <div>{msg.content}</div>
                  {(msg.confidence || msg.sources?.length || msg.reasoning) && (
                    <div className="mt-3 text-[11px] text-zinc-400 space-y-2">
                      {msg.confidence && <div><span className="font-medium text-zinc-300">Confidence:</span> {msg.confidence}</div>}
                      {msg.sources?.length ? <div><span className="font-medium text-zinc-300">Sources:</span> {msg.sources.join(', ')}</div> : null}
                      {msg.reasoning ? <div><span className="font-medium text-zinc-300">Reasoning:</span> {msg.reasoning}</div> : null}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && <div className="text-zinc-500">Thinking...</div>}
            <div ref={chatEndRef} />
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask anything about this playbook..."
              className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-zinc-700 rounded-2xl px-5 py-3 text-sm outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-white text-black px-6 rounded-2xl font-medium hover:bg-zinc-200 transition"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
