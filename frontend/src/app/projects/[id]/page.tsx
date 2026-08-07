'use client';

import React, { useEffect, useState, use } from 'react';
import { NavigationBar } from '@/components/NavigationBar';
import { Project } from '@/features/projects/types';
import { apiRequest } from '@/lib/api';
import Link from 'next/link';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'explorer' | 'reviews' | 'chat'>('explorer');

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const data = await apiRequest<Project>(`/projects/${id}`);
      setProject(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavigationBar />
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 animate-pulse space-y-4">
          <div className="h-8 w-48 bg-slate-800 rounded-lg" />
          <div className="h-64 glass-panel rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavigationBar />
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-16 text-center space-y-4">
          <div className="text-3xl">⚠️</div>
          <h2 className="text-xl font-bold text-white">Project Not Found</h2>
          <p className="text-sm text-slate-400">{error || 'Could not find requested project'}</p>
          <Link
            href="/dashboard"
            className="inline-block px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-medium"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavigationBar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
          <div>
            <div className="flex items-center space-x-3">
              <Link href="/dashboard" className="text-xs text-slate-400 hover:text-white transition">
                ← Dashboard
              </Link>
              <span className="text-slate-600">/</span>
              <span className="text-xs text-cyan-400 font-mono">{project.id.slice(0, 8)}</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">{project.name}</h1>
            <p className="text-xs text-slate-400 mt-1">{project.description || 'No description provided.'}</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('explorer')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === 'explorer'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📂 Code Explorer ({project._count?.files || 0})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🔍 AI Reviews ({project._count?.reviews || 0})
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              💬 Code Chat ({project._count?.chatSessions || 0})
            </button>
          </div>
        </div>

        {/* Tab Shell Content */}
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 min-h-[400px]">
          {activeTab === 'explorer' && (
            <div className="text-center py-12 space-y-3">
              <div className="text-4xl">📦</div>
              <h3 className="text-base font-semibold text-white">Code Explorer Module Shell</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                File upload pipeline, ZIP extraction, tree view, and Shiki code preview will be wired here in Phase 3.
              </p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="text-center py-12 space-y-3">
              <div className="text-4xl">🔬</div>
              <h3 className="text-base font-semibold text-white">AI Review Engine Shell</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Automated Security, Performance, and Quality reviews with structured issue cards will be wired here in Phase 5 & 6.
              </p>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="text-center py-12 space-y-3">
              <div className="text-4xl">🤖</div>
              <h3 className="text-base font-semibold text-white">Code Chat Module Shell</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Contextual codebase chat interface grounded in repository files will be wired here in Phase 7.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
