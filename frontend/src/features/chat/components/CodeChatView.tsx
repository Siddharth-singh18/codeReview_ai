'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Message } from '../types';
import { AIProviderConfig } from '@/features/ai-providers/types';
import { apiRequest } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Send, Sparkles, AlertCircle, Settings } from 'lucide-react';
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
  }, [messages, sending]);

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
    <div className="glass-panel rounded-2xl border border-white/[0.08] flex flex-col h-[650px] overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 bg-slate-900/90 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              Codebase AI Pair Programmer
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            </h3>
            <p className="text-[11px] text-slate-400">Grounded in repository source files</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {providers.length === 0 ? (
            <Link
              href="/settings"
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium flex items-center gap-1"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configure AI Provider</span>
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#090b13]">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Bot className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-white">Ask anything about your codebase!</h4>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              &quot;How does authentication work?&quot;, &quot;Suggest refactoring for file X&quot;, or &quot;Explain the architecture&quot;.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex space-x-3 ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'ASSISTANT' && (
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] space-y-1 ${msg.role === 'USER' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`rounded-2xl p-4 text-xs leading-relaxed ${
                    msg.role === 'USER'
                      ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-violet-600 text-white rounded-br-none shadow-md shadow-cyan-500/10'
                      : 'glass-card border border-white/[0.08] text-slate-200 rounded-bl-none prose prose-invert max-w-none prose-pre:bg-[#060810] prose-pre:border prose-pre:border-white/[0.08]'
                  }`}
                >
                  {msg.role === 'USER' ? (
                    msg.content
                  ) : (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 block px-1">
                  {msg.role === 'USER' ? 'You' : 'AI Assistant'}
                </span>
              </div>

              {msg.role === 'USER' && (
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </motion.div>
          ))
        )}

        {/* Animated Thinking State */}
        {sending && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex space-x-3 items-center">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="glass-card border border-white/[0.08] p-3 rounded-2xl text-xs text-cyan-400 flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
              </div>
              <span className="font-medium text-slate-300">AI Assistant is analyzing codebase & thinking...</span>
            </div>
          </motion.div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <form onSubmit={handleSend} className="p-3 bg-slate-900/90 border-t border-white/[0.06] flex items-center space-x-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your repository codebase..."
          className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs focus:outline-none"
        />
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={sending || !input.trim() || providers.length === 0}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-semibold text-xs transition shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer flex items-center space-x-1.5"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </motion.button>
      </form>
    </div>
  );
}
