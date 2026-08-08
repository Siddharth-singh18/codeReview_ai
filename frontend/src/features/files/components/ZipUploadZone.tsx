'use client';

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { apiRequest } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileArchive, CheckCircle2, AlertCircle, GitBranch, ArrowRight } from 'lucide-react';

interface ZipUploadZoneProps {
  projectId: string;
  onUploadSuccess: () => void;
}

export function ZipUploadZone({ projectId, onUploadSuccess }: ZipUploadZoneProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'github'>('upload');
  const [uploading, setUploading] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Handle Drag & Drop Files or ZIP Archive Upload
  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setError(null);
    setSuccessMsg(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      await apiRequest(`/projects/${projectId}/upload`, {
        method: 'POST',
        body: formData,
        isFormData: true,
      });

      setSuccessMsg(`Successfully uploaded & processed ${file.name}`);
      onUploadSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to process file upload');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  // Handle GitHub Repo URL Import
  const handleGithubImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl.trim() || uploading) return;

    setError(null);
    setSuccessMsg(null);
    setUploading(true);

    try {
      await apiRequest(`/projects/${projectId}/import-github`, {
        method: 'POST',
        body: JSON.stringify({ githubUrl }),
      });

      setSuccessMsg(`Successfully imported repository from GitHub!`);
      setGithubUrl('');
      onUploadSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to import GitHub repository');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Selector Tabs: ZIP/Drag-Drop vs GitHub URL */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
        <div className="flex items-center space-x-2 bg-slate-900/80 p-1 rounded-xl border border-white/[0.06]">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-2 ${
              activeTab === 'upload'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Option A & B: ZIP Upload / Drag & Drop</span>
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-2 ${
              activeTab === 'github'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Option C: GitHub Repository URL</span>
          </button>
        </div>
      </div>

      {/* Tab 1: ZIP Upload + Drag & Drop Files */}
      {activeTab === 'upload' && (
        <div
          {...getRootProps()}
          className={`relative glass-panel rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 border-2 border-dashed overflow-hidden ${
            isDragActive
              ? 'border-cyan-400 bg-cyan-500/10 shadow-xl shadow-cyan-500/20 scale-[1.01]'
              : 'border-white/10 hover:border-cyan-500/40 hover:bg-slate-900/60'
          }`}
        >
          <input {...getInputProps()} />

          <div className="absolute -top-12 -left-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center space-y-3">
            <motion.div
              animate={isDragActive ? { y: [-4, 4, -4] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-violet-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10"
            >
              {uploading ? (
                <span className="animate-spin text-2xl">🌀</span>
              ) : (
                <UploadCloud className="w-7 h-7" />
              )}
            </motion.div>

            {uploading ? (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">Extracting & Indexing Repository Files...</p>
                <p className="text-xs text-slate-400">Parsing directory structure and filtering ignored patterns</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">
                  {isDragActive ? 'Drop files or ZIP archive here' : 'Drag & Drop Files / ZIP Archive or Click to Browse'}
                </p>
                <p className="text-xs text-slate-400">
                  Option A & B: Upload a single .zip file or drag source code files directly (Ignores .git & node_modules)
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: GitHub Repository URL */}
      {activeTab === 'github' && (
        <form onSubmit={handleGithubImport} className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Option C: Import from Public GitHub URL</h4>
              <p className="text-xs text-slate-400">Enter a public repository link to automatically clone and index files</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/owner/repository"
              className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs font-mono focus:outline-none"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={uploading || !githubUrl.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-semibold text-xs transition shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
            >
              {uploading ? (
                <>
                  <span className="animate-spin text-sm">🌀</span>
                  <span>Fetching...</span>
                </>
              ) : (
                <>
                  <span>Import Repo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </motion.button>
          </div>
        </form>
      )}

      {/* Feedback Messages */}
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

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
