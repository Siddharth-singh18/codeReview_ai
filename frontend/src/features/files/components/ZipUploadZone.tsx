'use client';

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { apiRequest } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileArchive, CheckCircle2, AlertCircle } from 'lucide-react';

interface ZipUploadZoneProps {
  projectId: string;
  onUploadSuccess: () => void;
}

export function ZipUploadZone({ projectId, onUploadSuccess }: ZipUploadZoneProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (!file.name.endsWith('.zip')) {
      setError('Please upload a valid .zip repository archive');
      return;
    }

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
      setError(err.message || 'Failed to upload zip archive');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/zip': ['.zip'] },
    multiple: false,
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`relative glass-panel rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 border-2 border-dashed overflow-hidden ${
          isDragActive
            ? 'border-cyan-400 bg-cyan-500/10 shadow-xl shadow-cyan-500/20 scale-[1.01]'
            : 'border-white/10 hover:border-cyan-500/40 hover:bg-slate-900/60'
        }`}
      >
        <input {...getInputProps()} />

        {/* Ambient Glowing Blob inside Dropzone */}
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
              <p className="text-sm font-semibold text-white">Extracting & Indexing Source Files...</p>
              <p className="text-xs text-slate-400">Parsing directory structure and filtering ignored patterns</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">
                {isDragActive ? 'Drop repository .zip file here' : 'Click or Drag & Drop Repository ZIP'}
              </p>
              <p className="text-xs text-slate-400">
                Supports Node.js, Python, Java, Go, C++, Rust, PHP, etc. (Ignores .git & node_modules)
              </p>
            </div>
          )}
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
