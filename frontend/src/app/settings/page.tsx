'use client';

import React, { useEffect, useState } from 'react';
import { NavigationBar } from '@/components/NavigationBar';
import { AIProviderConfig, ProviderType } from '@/features/ai-providers/types';
import { ProviderConfigModal } from '@/features/ai-providers/components/ProviderConfigModal';
import { apiRequest } from '@/lib/api';

export default function SettingsPage() {
  const [configs, setConfigs] = useState<AIProviderConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const data = await apiRequest<AIProviderConfig[]>('/ai-providers');
      setConfigs(data);
    } catch (err) {
      console.error('Failed to fetch provider configs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConfig = async (data: {
    name: string;
    baseUrl: string;
    apiKey?: string;
    modelName: string;
    providerType: ProviderType;
  }) => {
    const newConfig = await apiRequest<AIProviderConfig>('/ai-providers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setConfigs((prev) => [newConfig, ...prev]);
  };

  const handleDeleteConfig = async (id: string) => {
    if (!confirm('Are you sure you want to delete this provider configuration?')) return;
    await apiRequest(`/ai-providers/${id}`, { method: 'DELETE' });
    setConfigs((prev) => prev.filter((c) => c.id !== id));
  };

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    setTestResult(null);
    try {
      const res = await apiRequest<{ success: boolean; message: string; responseSample: string }>(
        `/ai-providers/${id}/test`,
        { method: 'POST' }
      );
      setTestResult({
        id,
        success: true,
        message: `${res.message} (Output: "${res.responseSample}")`,
      });
    } catch (err: any) {
      setTestResult({
        id,
        success: false,
        message: err.message || 'Connection failed',
      });
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavigationBar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">AI Provider Settings</h1>
            <p className="text-sm text-slate-400">Configure cloud or local OpenAI-compatible AI providers</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs transition shadow-lg shadow-cyan-500/20 flex items-center space-x-2 w-fit cursor-pointer"
          >
            <span>+</span>
            <span>Add Provider</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 glass-card rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : configs.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center space-y-4 border border-slate-800">
            <div className="text-4xl">🤖</div>
            <h3 className="text-lg font-semibold text-white">No AI Providers Configured</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Add your OpenAI API key or connect local providers like LM Studio / Ollama to enable automated code reviews and AI chat.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 text-xs font-medium transition cursor-pointer"
            >
              Add Configuration
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {configs.map((config) => (
              <div
                key={config.id}
                className="glass-card p-6 rounded-2xl space-y-4 border border-slate-800/80 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-lg">
                      ⚡
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-white">{config.name}</h3>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 text-[10px] uppercase font-mono font-medium">
                        {config.providerType}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteConfig(config.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                  >
                    🗑️
                  </button>
                </div>

                <div className="space-y-1.5 text-xs font-mono bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-slate-400">
                    <span>Base URL:</span>
                    <span className="text-slate-200 truncate max-w-[240px]">{config.baseUrl}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Model:</span>
                    <span className="text-cyan-400">{config.modelName}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>API Key:</span>
                    <span className={config.hasApiKey ? 'text-emerald-400' : 'text-amber-400'}>
                      {config.hasApiKey ? '•••••••• (Encrypted)' : 'Not set (Local/Public)'}
                    </span>
                  </div>
                </div>

                {testResult && testResult.id === config.id && (
                  <div
                    className={`p-3 rounded-xl text-xs ${
                      testResult.success
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/10 border border-red-500/20 text-red-400'
                    }`}
                  >
                    {testResult.message}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleTestConnection(config.id)}
                    disabled={testingId === config.id}
                    className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition cursor-pointer flex items-center space-x-2 disabled:opacity-50"
                  >
                    {testingId === config.id ? (
                      <>
                        <span className="animate-spin">🌀</span>
                        <span>Testing Connection...</span>
                      </>
                    ) : (
                      <>
                        <span>🔌</span>
                        <span>Test Connection</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ProviderConfigModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateConfig}
      />
    </div>
  );
}
