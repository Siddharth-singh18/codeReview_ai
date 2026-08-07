'use client';

import React, { useState } from 'react';

interface ZipUploadZoneProps {
  projectId: string;
  onUploadSuccess: () => void;
}

export function ZipUploadZone({ projectId, onUploadSuccess }: ZipUploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    if (!file.name.endsWith('.zip')) {
      setError('Please upload a valid .zip archive containing repository files.');
      return;
    }

    setError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    try {
      const response = await fetch(`${apiBaseUrl}/projects/${projectId}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Upload failed');
      }

      onUploadSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to upload repository');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {error}
        </div>
      )}

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative glass-panel rounded-2xl p-8 text-center border-2 border-dashed transition flex flex-col items-center justify-center space-y-3 cursor-pointer ${
          dragActive
            ? 'border-cyan-400 bg-cyan-500/10'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
        }`}
      >
        <input
          type="file"
          accept=".zip"
          onChange={handleChange}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xl">
          📦
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">
            {uploading ? 'Uploading and Unpacking Repository...' : 'Upload Repository ZIP'}
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Drag and drop your repository `.zip` archive here, or click to browse.
          </p>
        </div>

        {uploading && (
          <div className="flex items-center space-x-2 text-xs text-cyan-400 font-medium">
            <span className="animate-spin">🌀</span>
            <span>Parsing file tree & index content...</span>
          </div>
        )}
      </div>
    </div>
  );
}
