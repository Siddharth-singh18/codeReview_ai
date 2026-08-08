'use client';

import React from 'react';
import { Review } from '../types';

interface ExportReportButtonProps {
  review: Review;
  projectName: string;
}

export function ExportReportButton({ review, projectName }: ExportReportButtonProps) {
  const handleExportMarkdown = () => {
    let md = `# AI Code Review Report — ${projectName}\n\n`;
    md += `**Audit Template:** ${review.templateType}\n`;
    md += `**Scope:** ${review.scope}\n`;
    md += `**Date:** ${new Date(review.createdAt).toLocaleString()}\n\n`;
    md += `## Executive Summary\n${review.summary}\n\n`;
    md += `## Findings & Vulnerabilities (${review.issues.length})\n\n`;

    review.issues.forEach((issue, index) => {
      md += `### ${index + 1}. [${issue.severity}] ${issue.title}\n`;
      md += `- **File:** \`${issue.filePath}\`${issue.lineRef ? ` (Line: ${issue.lineRef})` : ''}\n`;
      md += `- **Description:** ${issue.description}\n`;
      if (issue.recommendation) {
        md += `- **Recommendation:**\n\`\`\`\n${issue.recommendation}\n\`\`\`\n`;
      }
      md += `\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `review-report-${projectName.toLowerCase().replace(/\s+/g, '-')}-${review.templateType.toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExportMarkdown}
      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700/80 text-xs font-medium transition cursor-pointer flex items-center space-x-1"
    >
      <span>📥</span>
      <span>Export Report (.md)</span>
    </button>
  );
}
