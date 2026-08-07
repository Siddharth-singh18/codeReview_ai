'use client';

import React, { useState } from 'react';
import { ReviewIssue } from '../types';
import { SeverityBadge } from './SeverityBadge';

interface IssueCardProps {
  issue: ReviewIssue;
}

export function IssueCard({ issue }: IssueCardProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden transition">
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between p-4 bg-slate-900/60 border-b border-slate-800/80 cursor-pointer hover:bg-slate-900/80 transition"
      >
        <div className="flex items-center space-x-3 min-w-0">
          <SeverityBadge severity={issue.severity} />
          <h4 className="font-semibold text-sm text-white truncate">{issue.title}</h4>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
          <span className="truncate max-w-[200px]">{issue.filePath}</span>
          {issue.lineRef && <span className="text-cyan-400">({issue.lineRef})</span>}
          <span>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-3 text-xs text-slate-300">
          <p className="leading-relaxed">{issue.description}</p>

          {issue.recommendation && (
            <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
              <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
                Recommended Fix / Actionable Code:
              </span>
              <pre className="p-3 rounded-xl bg-[#0d1117] border border-slate-800 font-mono text-xs overflow-x-auto text-slate-200">
                <code>{issue.recommendation}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
