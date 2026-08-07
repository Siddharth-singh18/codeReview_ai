'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Message } from '../types';
import { AIProviderConfig } from '@/features/ai-providers/types';
import { apiRequest } from '@/lib/api';
import Link from 'next/link';

interface CodeChatViewProps {
  projectId: string;
}

export function CodeChatView({ projectId }: CodeChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [providers, setProviders] = useState<AIProviderConfig[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProviders();
    fetchLatestSession();
  }, [projectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchProviders = async () => {
    try {
      const data = await apiRequest<AIProviderConfig[]>('/ai-providers');
      setProviders(data);
      if (data.length > 0) {
        setSelectedProviderId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load AI providers', err);
    }
  };

  const fetchLatestSession = async () => {
    try {
      const sessions = await apiRequest<any[]>(`/projects/${projectId}/chat/sessions`);
      if (sessions.length > 0) {
        setSessionId(sessions[0].id);
        setMessages(sessions[0].messages || []);
      }
    } catch (err) {
      console.error('Failed to load chat session', err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    if (!selectedProviderId) {
      setError('Please select an AI Provider configuration in Settings first.');
      return;
    }

    const userMessageContent = input.trim();
    setInput('');
    setError(null);

    // Optimistically update message list
    const tempUserMsg: Message = { role: 'USER', content: userMessageContent };
    setMessages((prev) => [...prev, tempUserMsg]);
    setSending(true);

    try {
      const res = await apiRequest<{
        sessionId: string;
        userMessage: string;
        assistantMessage: string;
      }>(`/projects/${projectId}/chat`, {
        method: 'POST',
        body: JSON.stringify({
          message: userMessageContent,
          providerId: selectedProviderId,
          sessionId,
        }),
      });

      setSessionId(res.sessionId);
      setMessages((prev) => [
        ...prev,
        { role: 'ASSISTANT', content: res.assistantMessage },
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to get response');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 flex flex-col h-[650px] overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            💬
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white">Repository AI Assistant</h3>
            <p className="text-[11px] text-slate-400">Grounded in project source files</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {providers.length === 0 ? (
            <Link
              href="/settings"
              className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium"
            >
              ⚠️ Configure AI Provider
            </Link>
          ) : (
            <select
              value={selectedProviderId}
              onChange={(e) => setSelectedProviderId(e.target.value)}
              className="px-3 py-1.5 rounded-xl glass-input text-xs font-mono focus:outline-none"
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.modelName})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0b0f19]">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
            <div className="text-4xl">🤖</div>
            <h4 className="text-sm font-semibold text-white">Ask anything about your codebase!</h4>
            <p className="text-xs text-slate-400 max-w-sm">
              &quot;How does authentication work?&quot;, &quot;Suggest refactoring for file X&quot;, or &quot;Explain the architecture&quot;.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${msg.role === 'USER' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.role === 'USER'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none'
                    : 'glass-card border border-slate-800/90 text-slate-200 rounded-bl-none font-mono whitespace-pre-wrap'
                }`}
              >
                {msg.content}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 px-1">
                {msg.role === 'USER' ? 'You' : 'AI Assistant'}
              </span>
            </div>
          ))
        )}
        {sending && (
          <div className="flex flex-col items-start">
            <div className="glass-card border border-slate-800 p-3 rounded-2xl text-xs text-cyan-400 flex items-center space-x-2">
              <span className="animate-spin">🌀</span>
              <span>AI Assistant is analyzing codebase & thinking...</span>
            </div>
          </div>
        )}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <form onSubmit={handleSend} className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center space-x-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your project codebase..."
          className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs focus:outline-none"
        />
        <button
          type="submit"
          disabled={sending || !input.trim() || providers.length === 0}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs transition shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer flex items-center space-x-1"
        >
          <span>Send</span>
          <span>🚀</span>
        </button>
      </form>
    </div>
  );
}
