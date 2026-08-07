'use client';

import React, { useState } from 'react';
import { FileTreeNode } from '../types';

interface FileTreeItemProps {
  node: FileTreeNode;
  selectedFileId?: string;
  onSelectFile: (fileId: string) => void;
}

export function FileTreeItem({ node, selectedFileId, onSelectFile }: FileTreeItemProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (node.type === 'directory') {
    return (
      <div className="select-none">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-slate-800/60 text-slate-300 text-xs font-medium cursor-pointer transition"
        >
          <span className="text-slate-400 text-xs">{isOpen ? '📂' : '📁'}</span>
          <span className="truncate">{node.name}</span>
        </div>
        {isOpen && node.children && (
          <div className="pl-4 border-l border-slate-800/60 ml-2 space-y-0.5 mt-0.5">
            {node.children.map((childNode) => (
              <FileTreeItem
                key={childNode.path}
                node={childNode}
                selectedFileId={selectedFileId}
                onSelectFile={onSelectFile}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isSelected = selectedFileId === node.id;

  return (
    <div
      onClick={() => node.id && onSelectFile(node.id)}
      className={`flex items-center space-x-2 px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition truncate ${
        isSelected
          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
      }`}
    >
      <span className="text-slate-500 text-xs">📄</span>
      <span className="truncate">{node.name}</span>
    </div>
  );
}

interface FileTreeProps {
  tree: FileTreeNode[];
  selectedFileId?: string;
  onSelectFile: (fileId: string) => void;
}

export function FileTree({ tree, selectedFileId, onSelectFile }: FileTreeProps) {
  if (tree.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-slate-500">
        No files uploaded yet.
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      {tree.map((node) => (
        <FileTreeItem
          key={node.path}
          node={node}
          selectedFileId={selectedFileId}
          onSelectFile={onSelectFile}
        />
      ))}
    </div>
  );
}
