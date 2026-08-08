'use client';

import React, { useState } from 'react';
import { ProviderType } from '../types';

interface ProviderConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    baseUrl: string;
    apiKey?: string;
    modelName: string;
    providerType: ProviderType;
  }) => Promise<void>;
}

export function ProviderConfigModal({ isOpen, onClose, onSubmit }: ProviderConfigModalProps) {
  const [name, setName] = useState('OpenAI Main');
  const [providerType, setProviderType] = useState<ProviderType>('OPENAI');
  const [baseUrl, setBaseUrl] = useState('https://api.openai.com/v1');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('gpt-4o-mini');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProviderTypeChange = (type: ProviderType) => {
    setProviderType(type);
    if (type === 'OPENAI') {
      setBaseUrl('https://api.openai.com/v1');
      setModelName('gpt-4o-mini');
    } else if (type === 'GROQ' as any) {
      setBaseUrl('https://api.groq.com/openai/v1');
      setModelName('llama-3.3-70b-versatile');
    } else if (type === 'LM_STUDIO') {
      setBaseUrl('http://localhost:1234/v1');
      setModelName('local-model');
    } else if (type === 'OLLAMA') {
      setBaseUrl('http://localhost:11434/v1');
      setModelName('llama3');
    } else if (type === 'OPENROUTER') {
      setBaseUrl('https://openrouter.ai/api/v1');
      setModelName('meta-llama/llama-3.1-70b-instruct');
    } else {
      setBaseUrl('http://localhost:8000/v1');
      setModelName('default');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit({ name, baseUrl, apiKey, modelName, providerType });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg glass-panel p-6 rounded-2xl shadow-2xl space-y-5 border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-lg font-semibold text-white">Add AI Provider Configuration</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition text-sm">
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Preset Provider Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(['OPENAI', 'GROQ', 'LM_STUDIO', 'OLLAMA', 'OPENROUTER', 'GENERIC'] as ProviderType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleProviderTypeChange(type)}
                  className={`py-2 px-2 rounded-xl text-[11px] font-semibold border transition cursor-pointer ${
                    providerType === type
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Config Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. OpenAI GPT-4, Local LM Studio"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Base URL *</label>
            <input
              type="text"
              required
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none font-mono text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">API Key (Encrypted at rest)</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none font-mono text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Model Name *</label>
            <input
              type="text"
              required
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="gpt-4o-mini"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none font-mono text-xs"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white border border-slate-700/50 hover:bg-slate-800/50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white transition shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
