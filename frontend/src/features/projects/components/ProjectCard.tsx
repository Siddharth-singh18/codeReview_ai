'use client';

import React from 'react';
import Link from 'next/link';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => Promise<void>;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const [deleting, setDeleting] = React.useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${project.name}"?`)) return;
    setDeleting(true);
    try {
      await onDelete(project.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Link
      href={`/projects/${project.id}`}
      className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4 group relative border border-slate-800/80 hover:border-cyan-500/30 transition duration-200"
    >
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              📁
            </div>
            <div>
              <h3 className="font-semibold text-base text-white group-hover:text-cyan-400 transition-colors">
                {project.name}
              </h3>
              <span className="text-[11px] text-slate-500">
                Created {new Date(project.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Delete project"
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition opacity-0 group-hover:opacity-100 cursor-pointer"
          >
            🗑️
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-3 line-clamp-2 min-h-[32px]">
          {project.description || 'No description provided.'}
        </p>
      </div>

      <div className="flex items-center space-x-4 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
        <div className="flex items-center space-x-1.5">
          <span>📄</span>
          <span>{project._count?.files || 0} Files</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span>🔍</span>
          <span>{project._count?.reviews || 0} Reviews</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span>💬</span>
          <span>{project._count?.chatSessions || 0} Chats</span>
        </div>
      </div>
    </Link>
  );
}
