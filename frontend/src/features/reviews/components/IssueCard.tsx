'use client';

import React, { useState } from 'react';
import { ReviewIssue } from '../types';
import { SeverityBadge } from './SeverityBadge';
import { motion } from 'framer-motion';
import { FileCode, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface IssueCardProps {
  issue: ReviewIssue;
}

export function IssueCard({ issue }: IssueCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl border border-white/[0.07] overflow-hidden transition-all"
    >
      <div className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2 min-w-0">
            <SeverityBadge severity={issue.severity} />
            <h4 className="font-bold text-sm text-white truncate">{issue.title}</h4>
          </div>

          <div className="flex items-center space-x-2 text-[11px] font-mono text-cyan-400 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-white/[0.05]">
            <FileCode className="w-3.5 h-3.5" />
            <span className="truncate max-w-[200px]">{issue.filePath}</span>
            {issue.lineRef && <span className="text-slate-500">L{issue.lineRef}</span>}
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">{issue.description}</p>

        {issue.recommendation && (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 transition cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>{expanded ? 'Hide Code Fix Recommendation' : 'View Actionable Fix Recommendation'}</span>
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 p-3 rounded-xl bg-[#0b0e17] border border-white/[0.08] text-xs font-mono text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner"
              >
                {issue.recommendation}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
