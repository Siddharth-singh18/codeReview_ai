'use client';

import React, { useState, useEffect } from 'react';
import { AIProviderConfig } from '@/features/ai-providers/types';
import { apiRequest } from '@/lib/api';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-3xl glass-panel p-6 rounded-2xl shadow-2xl space-y-4 border border-slate-800 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">📚</span>
            <h2 className="text-base font-semibold text-white">AI Documentation Generator</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition text-sm">
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2 flex-1">
            <label className="text-xs text-slate-300 font-medium">Provider:</label>
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

          <button
            onClick={handleGenerate}
            disabled={loading || !selectedProviderId}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs transition shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="animate-spin">🌀</span>
                <span>Generating README...</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>Generate Markdown Docs</span>
              </>
            )}
          </button>
        </div>

        {/* Documentation Content Viewer */}
        <div className="flex-1 overflow-y-auto bg-[#0d1117] p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 min-h-[300px]">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-500 space-x-2">
              <span className="animate-spin">🌀</span>
              <span>Analyzing code modules and building comprehensive docs...</span>
            </div>
          ) : markdown ? (
            <div className="relative">
              <button
                onClick={handleCopy}
                className="absolute top-0 right-0 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-[10px] font-sans font-medium transition cursor-pointer"
              >
                {copied ? 'Copied! ✓' : 'Copy Markdown'}
              </button>
              <pre className="whitespace-pre-wrap pt-6 leading-relaxed">{markdown}</pre>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-center">
              Click &quot;Generate Markdown Docs&quot; to auto-synthesize complete project documentation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
