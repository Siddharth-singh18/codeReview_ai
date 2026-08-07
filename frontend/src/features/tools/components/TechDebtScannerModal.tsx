'use client';

import React, { useState, useEffect } from 'react';
import { AIProviderConfig } from '@/features/ai-providers/types';
import { apiRequest } from '@/lib/api';

interface TechDebtScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

interface TechDebtItem {
  filePath: string;
  category: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  effortToFix: 'EASY' | 'MEDIUM' | 'HARD';
  description: string;
  refactoringTip?: string;
}

interface TechDebtReport {
  debtScore: number;
  complexityRating: string;
  summary: string;
  items: TechDebtItem[];
}

export function TechDebtScannerModal({ isOpen, onClose, projectId }: TechDebtScannerModalProps) {
  const [providers, setProviders] = useState<AIProviderConfig[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<TechDebtReport | null>(null);
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

  const handleScan = async () => {
    if (!selectedProviderId) return;
    setError(null);
    setLoading(true);
    setReport(null);
    try {
      const res = await apiRequest<TechDebtReport>(`/projects/${projectId}/tech-debt`, {
        method: 'POST',
        body: JSON.stringify({ providerId: selectedProviderId }),
      });
      setReport(res);
    } catch (err: any) {
      setError(err.message || 'Failed to scan tech debt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-3xl glass-panel p-6 rounded-2xl shadow-2xl space-y-4 border border-slate-800 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🕸️</span>
            <h2 className="text-base font-semibold text-white">Tech Debt & Cyclomatic Complexity Radar</h2>
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
            onClick={handleScan}
            disabled={loading || !selectedProviderId}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-medium text-xs transition shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="animate-spin">🌀</span>
                <span>Scanning Repository...</span>
              </>
            ) : (
              <>
                <span>🔍</span>
                <span>Scan Tech Debt</span>
              </>
            )}
          </button>
        </div>

        {/* Report Results */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-[300px]">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-500 space-x-2">
              <span className="animate-spin">🌀</span>
              <span>Measuring cognitive complexity and code smells...</span>
            </div>
          ) : report ? (
            <div className="space-y-4">
              {/* Score Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium">Tech Debt Score</span>
                    <h3 className="text-2xl font-bold text-white mt-0.5">{report.debtScore} / 100</h3>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-xs ${
                      report.debtScore > 70
                        ? 'border-red-500 text-red-400 bg-red-500/10'
                        : report.debtScore > 40
                        ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                        : 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                    }`}
                  >
                    {report.debtScore > 70 ? 'CRITICAL' : report.debtScore > 40 ? 'MODERATE' : 'CLEAN'}
                  </div>
                </div>

                <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium">Cyclomatic Complexity</span>
                    <h3 className="text-2xl font-bold text-cyan-400 mt-0.5">{report.complexityRating}</h3>
                  </div>
                  <div className="text-3xl">🧩</div>
                </div>
              </div>

              <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                {report.summary}
              </p>

              {/* Debt Refactoring List */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Prioritized Refactoring Opportunities ({report.items?.length || 0})
                </h4>
                {report.items?.map((item, idx) => (
                  <div key={idx} className="glass-card p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-cyan-400 font-semibold">{item.filePath}</span>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                          {item.category}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] uppercase font-bold">
                          Fix: {item.effortToFix}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-300">{item.description}</p>
                    {item.refactoringTip && (
                      <div className="p-2 rounded-lg bg-[#0d1117] border border-slate-800 text-slate-400 font-mono text-[11px]">
                        💡 {item.refactoringTip}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-center">
              Click &quot;Scan Tech Debt&quot; to compute cyclomatic complexity score and refactoring tasks.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
