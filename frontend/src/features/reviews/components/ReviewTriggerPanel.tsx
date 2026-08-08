'use client';

import React, { useEffect, useState } from 'react';
import { FileTreeNode } from '@/features/files/types';
import { AIProviderConfig } from '@/features/ai-providers/types';
import { Review, ReviewScope, TemplateType } from '../types';
import { apiRequest } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Zap, Sparkles, Play, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface ReviewTriggerPanelProps {
  projectId: string;
  files: FileTreeNode[];
  onReviewCreated: (review: Review) => void;
}

export function ReviewTriggerPanel({
  projectId,
  files,
  onReviewCreated,
}: ReviewTriggerPanelProps) {
  const [providers, setProviders] = useState<AIProviderConfig[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [scope, setScope] = useState<ReviewScope>('PROJECT');
  const [templateType, setTemplateType] = useState<TemplateType>('SECURITY');
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProviders();
  }, []);

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

  const flattenFiles = (nodes: FileTreeNode[]): FileTreeNode[] => {
    let result: FileTreeNode[] = [];
    for (const node of nodes) {
      if (node.type === 'file') {
        result.push(node);
      }
      if (node.children) {
        result = result.concat(flattenFiles(node.children));
      }
    }
    return result;
  };

  const allFiles = flattenFiles(files);

  const handleTrigger = async () => {
    if (!selectedProviderId) {
      setError('Please select an AI Provider configuration in Settings first.');
      return;
    }

    if ((scope === 'FILE' || scope === 'MULTI_FILE') && selectedFileIds.length === 0) {
      setError('Please select at least one file for targeted scope review');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const review = await apiRequest<Review>(`/projects/${projectId}/reviews`, {
        method: 'POST',
        body: JSON.stringify({
          providerId: selectedProviderId,
          scope,
          templateType,
          fileIds: selectedFileIds,
        }),
      });

      onReviewCreated(review);
    } catch (err: any) {
      setError(err.message || 'Failed to execute automated AI review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Trigger Automated AI Audit</h3>
            <p className="text-xs text-slate-400">Select template ruleset, context scope, and AI engine</p>
          </div>
        </div>

        {providers.length === 0 && (
          <Link
            href="/settings"
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition flex items-center space-x-1 cursor-pointer"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Configure AI Provider</span>
          </Link>
        )}
      </div>

      {/* Grouped Field Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Template Selector Card */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-white/[0.05] space-y-2">
          <label className="text-xs font-semibold text-slate-300 block uppercase tracking-wider">
            1. Audit Template
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { type: 'SECURITY', label: 'Security', icon: ShieldCheck },
              { type: 'PERFORMANCE', label: 'Perf', icon: Zap },
              { type: 'QUALITY', label: 'Quality', icon: Sparkles },
            ].map((tmpl) => {
              const Icon = tmpl.icon;
              const isSelected = templateType === tmpl.type;
              return (
                <button
                  key={tmpl.type}
                  type="button"
                  onClick={() => setTemplateType(tmpl.type as TemplateType)}
                  className={`p-2 rounded-lg text-xs font-semibold transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    isSelected
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-sm shadow-amber-500/10'
                      : 'bg-slate-800/40 text-slate-400 hover:text-white border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tmpl.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scope Selector Card */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-white/[0.05] space-y-2">
          <label className="text-xs font-semibold text-slate-300 block uppercase tracking-wider">
            2. Review Scope
          </label>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as ReviewScope)}
            className="w-full px-3 py-2 rounded-xl glass-input text-xs focus:outline-none"
          >
            <option value="PROJECT">Entire Project Context</option>
            <option value="MULTI_FILE">Selected Multi-Files</option>
            <option value="FILE">Single Targeted File</option>
          </select>

          {(scope === 'FILE' || scope === 'MULTI_FILE') && (
            <div className="pt-1">
              <select
                multiple={scope === 'MULTI_FILE'}
                value={selectedFileIds}
                onChange={(e) => {
                  const options = Array.from(e.target.selectedOptions, (opt) => opt.value);
                  setSelectedFileIds(options);
                }}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs focus:outline-none max-h-24 font-mono"
              >
                {allFiles.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.path}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Provider Selector & Action Card */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-white/[0.05] space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 block uppercase tracking-wider">
              3. AI Provider
            </label>
            <select
              value={selectedProviderId}
              onChange={(e) => setSelectedProviderId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono focus:outline-none"
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.modelName})
                </option>
              ))}
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleTrigger}
            disabled={loading || providers.length === 0}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-white font-bold text-xs transition shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="animate-spin text-sm">🌀</span>
                <span>Running Audit...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run AI Review</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
