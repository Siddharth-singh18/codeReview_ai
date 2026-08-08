'use client';

import React from 'react';
import Link from 'next/link';
import { Project } from '../types';
import { motion } from 'framer-motion';
import { FolderGit2, FileCode, ShieldCheck, MessageSquare, ArrowRight, Trash2 } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => Promise<void>;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const fileCount = project._count?.files || 0;
  const reviewCount = project._count?.reviews || 0;
  const chatCount = project._count?.chatSessions || 0;

  return (
    <Link href={`/projects/${project.id}`} className="block">
      <motion.div
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="group relative glass-card rounded-2xl border border-white/[0.07] overflow-hidden flex flex-col justify-between cursor-pointer"
      >
        {/* Decorative gradient top accent strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 opacity-70 group-hover:opacity-100 transition-opacity" />

        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-base text-white group-hover:text-cyan-400 transition flex items-center gap-1.5">
                  {project.name}
                </span>
                <span className="text-[10px] font-mono text-slate-500">ID: {project.id.slice(0, 8)}</span>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (confirm(`Delete project "${project.name}"?`)) {
                  onDelete(project.id);
                }
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition cursor-pointer z-10"
              title="Delete Project"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed h-9">
            {project.description || 'No project description provided.'}
          </p>

          {/* Project Stats Badges */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.05]">
            <div className="flex items-center space-x-1.5 p-2 rounded-lg bg-slate-900/40 border border-white/[0.04]">
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 leading-none">Files</span>
                <span className="text-xs font-semibold text-white leading-tight">{fileCount}</span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 p-2 rounded-lg bg-slate-900/40 border border-white/[0.04]">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 leading-none">Audits</span>
                <span className="text-xs font-semibold text-white leading-tight">{reviewCount}</span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 p-2 rounded-lg bg-slate-900/40 border border-white/[0.04]">
              <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 leading-none">Chats</span>
                <span className="text-xs font-semibold text-white leading-tight">{chatCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Action Footer */}
        <div className="px-5 py-3 bg-slate-900/60 border-t border-white/[0.05] flex items-center justify-between">
          <span className="text-[10px] text-slate-500">
            Created {new Date(project.createdAt).toLocaleDateString()}
          </span>
          <span className="text-xs font-medium text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1 transition-all">
            <span>Open Workspace</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </motion.div>
    </Link>
  );
}
