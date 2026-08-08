'use client';

import React, { useEffect, useState } from 'react';
import { NavigationBar } from '@/components/NavigationBar';
import { Project } from '@/features/projects/types';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { CreateProjectModal } from '@/features/projects/components/CreateProjectModal';
import { apiRequest } from '@/lib/api';
import { motion } from 'framer-motion';
import { FolderPlus, FileCode2, ShieldAlert, MessagesSquare, Sparkles, Plus } from 'lucide-react';

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavigationBar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Workspace Overview
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage your repositories, trigger automated security audits, and interact with codebase AI.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-medium text-xs transition shadow-lg shadow-cyan-500/25 flex items-center space-x-2 w-fit cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Project Workspace</span>
          </motion.button>
        </div>

        {/* Global Statistics Banner Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            whileHover={{ y: -2 }}
            className="glass-card p-5 rounded-2xl border border-white/[0.07] flex items-center justify-between"
          >
            <div>
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                Total Projects
              </span>
              <span className="text-2xl font-black text-white mt-1 block">{projects.length}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <FolderPlus className="w-6 h-6" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="glass-card p-5 rounded-2xl border border-white/[0.07] flex items-center justify-between"
          >
            <div>
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                Files Indexed
              </span>
              <span className="text-2xl font-black text-white mt-1 block">{totalFiles}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FileCode2 className="w-6 h-6" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="glass-card p-5 rounded-2xl border border-white/[0.07] flex items-center justify-between"
          >
            <div>
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                Audits Completed
              </span>
              <span className="text-2xl font-black text-white mt-1 block">{totalReviews}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="glass-card p-5 rounded-2xl border border-white/[0.07] flex items-center justify-between"
          >
            <div>
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                Chat Conversations
              </span>
              <span className="text-2xl font-black text-white mt-1 block">{totalChats}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <MessagesSquare className="w-6 h-6" />
            </div>
          </motion.div>
        </div>

        {/* Projects Grid Section */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-52 glass-card rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel rounded-3xl p-12 text-center space-y-4 border border-white/[0.08] max-w-xl mx-auto"
          >
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto">
              <FolderPlus className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">No projects created yet</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Create your first project workspace to upload source repositories, trigger AI vulnerability reviews, and chat with codebase context.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition cursor-pointer"
            >
              + Create First Workspace
            </button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {projects.map((project) => (
              <motion.div key={project.id} variants={itemVariants}>
                <ProjectCard project={project} onDelete={handleDeleteProject} />
              </motion.div>
            ))}
          </motion.div>
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
