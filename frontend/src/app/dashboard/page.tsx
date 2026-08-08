'use client';

import React, { useEffect, useState } from 'react';
import { NavigationBar } from '@/components/NavigationBar';
import { Project } from '@/features/projects/types';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { CreateProjectModal } from '@/features/projects/components/CreateProjectModal';
import { apiRequest } from '@/lib/api';

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await apiRequest<Project[]>('/projects');
      setProjects(data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (name: string, description?: string) => {
    const newProject = await apiRequest<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
    setProjects((prev) => [newProject, ...prev]);
  };

  const handleDeleteProject = async (id: string) => {
    await apiRequest(`/projects/${id}`, { method: 'DELETE' });
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const totalFiles = projects.reduce((acc, p) => acc + (p._count?.files || 0), 0);
  const totalReviews = projects.reduce((acc, p) => acc + (p._count?.reviews || 0), 0);
  const totalChats = projects.reduce((acc, p) => acc + (p._count?.chatSessions || 0), 0);

  return (
    <div className="min-h-screen flex flex-col">
      <NavigationBar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Projects Dashboard</h1>
            <p className="text-sm text-slate-400">Manage and run AI reviews across your repositories</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs transition shadow-lg shadow-cyan-500/20 flex items-center space-x-2 w-fit cursor-pointer"
          >
            <span>+</span>
            <span>New Project</span>
          </button>
        </div>

        {/* Global Statistics Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-lg">
              📁
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">Total Projects</span>
              <span className="text-xl font-bold text-white">{projects.length}</span>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-lg">
              📄
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">Files Indexed</span>
              <span className="text-xl font-bold text-white">{totalFiles}</span>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-lg">
              ⚡
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">AI Reviews Completed</span>
              <span className="text-xl font-bold text-white">{totalReviews}</span>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-lg">
              💬
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">Chat Conversations</span>
              <span className="text-xl font-bold text-white">{totalChats}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 glass-card rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center space-y-4 border border-slate-800">
            <div className="text-4xl">🚀</div>
            <h3 className="text-lg font-semibold text-white">No projects found</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Create your first project to upload code repositories, trigger automated AI code reviews, and interact via code chat.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 text-xs font-medium transition cursor-pointer"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} onDelete={handleDeleteProject} />
            ))}
          </div>
        )}
      </main>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
}
