'use client';

import React from 'react';
import { Review, TemplateType } from '../types';

interface ReviewHistoryListProps {
  reviews: Review[];
  activeReviewId?: string;
  onSelectReview: (review: Review) => void;
  onDeleteReview: (id: string) => Promise<void>;
  filterTemplate: string;
  onFilterChange: (template: string) => void;
}

export function ReviewHistoryList({
  reviews,
  activeReviewId,
  onSelectReview,
  onDeleteReview,
  filterTemplate,
  onFilterChange,
}: ReviewHistoryListProps) {
  const filteredReviews = filterTemplate === 'ALL'
    ? reviews
    : reviews.filter((r) => r.templateType === filterTemplate);

  const getTemplateIcon = (type: TemplateType) => {
    switch (type) {
      case 'SECURITY':
        return '🔒';
      case 'PERFORMANCE':
        return '⚡';
      case 'QUALITY':
        return '✨';
      default:
        return '🔍';
    }
  };

  return (
    <div className="glass-card rounded-2xl border border-slate-800 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Historical Audit Log</h3>
        
        {/* Template Filter Pills */}
        <div className="flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          {['ALL', 'SECURITY', 'PERFORMANCE', 'QUALITY'].map((template) => (
            <button
              key={template}
              onClick={() => onFilterChange(template)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
                filterTemplate === template
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {template}
            </button>
          ))}
        </div>
      </div>

      {filteredReviews.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-500">
          No historical reviews matching criteria.
        </div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {filteredReviews.map((review) => {
            const isSelected = activeReviewId === review.id;
            return (
              <div
                key={review.id}
                onClick={() => onSelectReview(review)}
                className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between group ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-sm">
                    {getTemplateIcon(review.templateType)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-xs text-white truncate">{review.templateType} Audit</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                        {review.scope}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {new Date(review.createdAt).toLocaleString()} • {review.issues.length} findings
                    </span>
                  </div>
                </div>

                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (confirm('Delete this historical review report?')) {
                      await onDeleteReview(review.id);
                    }
                  }}
                  className="p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition cursor-pointer text-xs"
                  title="Delete review record"
                >
                  🗑️
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
