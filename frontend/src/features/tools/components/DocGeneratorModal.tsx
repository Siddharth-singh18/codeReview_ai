'use client';

import React, { useState, useEffect } from 'react';
import { AIProviderConfig } from '@/features/ai-providers/types';
import { apiRequest } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, Copy, Check, X, AlertCircle } from 'lucide-react';

interface DocGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export function DocGeneratorModal({ isOpen, onClose, projectId }: DocGeneratorModalProps) {
  const [providers, setProviders] = useState<AIProviderConfig[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) fetchProviders();
  }, [isOpen]);

  const fetchProviders = async () => {
    try {
      const data = await apiRequest<AIProviderConfig[]>('/ai-providers');
      setProviders(data);
      if (data.length > 0) setSelectedProviderId(data[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!selectedProviderId) return;
    setError(null);
    setLoading(true);
    setMarkdown(null);
    try {
      const res = await apiRequest<{ markdownDocs: string }>(
        `/projects/${projectId}/generate-docs`,
        {
          method: 'POST',
          body: JSON.stringify({ providerId: selectedProviderId }),
        }
      );
      setMarkdown(res.markdownDocs);
    } catch (err: any) {
      setError(err.message || 'Failed to generate documentation');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!markdown) return;
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-3xl glass-panel p-6 rounded-3xl shadow-2xl space-y-4 border border-white/[0.08] flex flex-col max-h-[85vh]"
        >
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                  AI Documentation Synthesizer
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                </h2>
                <p className="text-[11px] text-slate-400">Generate README.md documentation for your codebase</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-2 flex-1">
              <label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">AI Engine:</label>
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
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleGenerate}
              disabled={loading || !selectedProviderId}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-semibold text-xs transition shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="animate-spin text-sm">🌀</span>
                  <span>Building README Docs...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Markdown Docs</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Rendered Markdown Output */}
          <div className="flex-1 overflow-y-auto bg-[#070913] p-5 rounded-2xl border border-white/[0.08] text-xs text-slate-200 min-h-[300px]">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                </div>
                <span className="text-xs font-medium">Analyzing codebase modules & synthesizing README structure...</span>
              </div>
            ) : markdown ? (
              <div className="relative">
                <button
                  onClick={handleCopy}
                  className="absolute top-0 right-0 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-white/[0.08] rounded-xl text-[10px] font-semibold transition cursor-pointer flex items-center space-x-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Markdown'}</span>
                </button>
                <div className="prose prose-invert max-w-none pt-6 text-xs leading-relaxed font-mono">
                  <ReactMarkdown>{markdown}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-center">
                Click &quot;Generate Markdown Docs&quot; to auto-synthesize complete project documentation.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
