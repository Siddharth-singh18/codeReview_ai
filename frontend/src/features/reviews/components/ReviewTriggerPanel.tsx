'use client';

import React, { useEffect, useState } from 'react';
import { ReviewScope, TemplateType, Review } from '../types';
import { AIProviderConfig } from '@/features/ai-providers/types';
import { FileTreeNode } from '@/features/files/types';
import { apiRequest } from '@/lib/api';
import Link from 'next/link';

interface ReviewTriggerPanelProps {
  projectId: string;
  files: FileTreeNode[];
  onReviewCreated: (review: Review) => void;
}

export function ReviewTriggerPanel({ projectId, files, onReviewCreated }: ReviewTriggerPanelProps) {
  const [providers, setProviders] = useState<AIProviderConfig[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [scope, setScope] = useState<ReviewScope>('PROJECT');
  const [templateType, setTemplateType] = useState<TemplateType>('SECURITY');
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const flatFiles = extractFlatFiles(files);

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

  const handleTrigger = async () => {
    if (!selectedProviderId) {
      setError('Please select an AI Provider configuration in Settings first.');
      return;
    }

    if ((scope === 'FILE' || scope === 'MULTI_FILE') && selectedFileIds.length === 0) {
      setError('Please select at least one file for targeted review.');
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
          fileIds: scope !== 'PROJECT' ? selectedFileIds : undefined,
        }),
      });
      onReviewCreated(review);
    } catch (err: any) {
      setError(err.message || 'Failed to generate review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">Trigger Automated AI Review</h3>
          <p className="text-xs text-slate-400">Select template, scope, and AI model to inspect codebase</p>
        </div>
        {providers.length === 0 && (
          <Link
            href="/settings"
            className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium"
          >
            ⚠️ Configure AI Provider First
          </Link>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Template Selector */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300">Review Template</label>
          <select
            value={templateType}
            onChange={(e) => setTemplateType(e.target.value as TemplateType)}
            className="w-full px-3 py-2 rounded-xl glass-input text-xs focus:outline-none"
          >
            <option value="SECURITY">🔒 Security Audit</option>
            <option value="PERFORMANCE">⚡ Performance Tuning</option>
            <option value="QUALITY">✨ Code Quality & Patterns</option>
          </select>
        </div>

        {/* Scope Selector */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300">Review Scope</label>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as ReviewScope)}
            className="w-full px-3 py-2 rounded-xl glass-input text-xs focus:outline-none"
          >
            <option value="PROJECT">🌐 Entire Project</option>
            <option value="MULTI_FILE">📁 Multiple Files</option>
            <option value="FILE">📄 Single File</option>
          </select>
        </div>

        {/* Provider Selector */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300">AI Provider Config</label>
          <select
            value={selectedProviderId}
            onChange={(e) => setSelectedProviderId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl glass-input text-xs focus:outline-none font-mono"
          >
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.modelName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* File Target Picker for Single/Multi scope */}
      {(scope === 'FILE' || scope === 'MULTI_FILE') && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300">Target Files</label>
          <div className="max-h-40 overflow-y-auto p-2 glass-input rounded-xl border border-slate-800 space-y-1">
            {flatFiles.map((file) => (
              <label
                key={file.id}
                className="flex items-center space-x-2 text-xs text-slate-300 hover:text-white cursor-pointer"
              >
                <input
                  type={scope === 'FILE' ? 'radio' : 'checkbox'}
                  name="selectedFiles"
                  checked={selectedFileIds.includes(file.id!)}
                  onChange={(e) => {
                    if (scope === 'FILE') {
                      setSelectedFileIds([file.id!]);
                    } else {
                      if (e.target.checked) {
                        setSelectedFileIds((prev) => [...prev, file.id!]);
                      } else {
                        setSelectedFileIds((prev) => prev.filter((id) => id !== file.id));
                      }
                    }
                  }}
                />
                <span className="font-mono text-xs truncate">{file.path}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleTrigger}
          disabled={loading || providers.length === 0}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs transition shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
        >
          {loading ? (
            <>
              <span className="animate-spin">🌀</span>
              <span>Executing AI Review Pipeline...</span>
            </>
          ) : (
            <>
              <span>⚡</span>
              <span>Run AI Review</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function extractFlatFiles(nodes: FileTreeNode[]): FileTreeNode[] {
  let result: FileTreeNode[] = [];
  for (const node of nodes) {
    if (node.type === 'file') {
      result.push(node);
    }
    if (node.children) {
      result = result.concat(extractFlatFiles(node.children));
    }
  }
  return result;
}
