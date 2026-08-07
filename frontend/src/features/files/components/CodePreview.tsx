'use client';

import React, { useEffect, useState } from 'react';
import { codeToHtml } from 'shiki';

interface CodePreviewProps {
  content: string;
  language: string;
  filePath: string;
}

export function CodePreview({ content, language, filePath }: CodePreviewProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function highlight() {
      setLoading(true);
      try {
        const html = await codeToHtml(content, {
          lang: language || 'text',
          theme: 'github-dark-dimmed',
        });
        if (isMounted) {
          setHtmlContent(html);
        }
      } catch {
        // Fallback plain text if language isn't natively bundled in basic Shiki grammar
        if (isMounted) {
          setHtmlContent(`<pre className="p-4 text-xs font-mono"><code>${escapeHtml(content)}</code></pre>`);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    highlight();

    return () => {
      isMounted = false;
    };
  }, [content, language]);

  return (
    <div className="flex flex-col h-full rounded-2xl glass-card border border-slate-800 overflow-hidden">
      {/* File Path Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs font-mono text-slate-300">
        <div className="flex items-center space-x-2">
          <span>📄</span>
          <span className="font-semibold text-white">{filePath}</span>
        </div>
        <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 text-[10px] uppercase tracking-wider font-sans font-medium">
          {language}
        </span>
      </div>

      {/* Code Viewer Body */}
      <div className="flex-1 overflow-auto p-4 text-xs font-mono bg-[#0d1117]">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-xs space-x-2">
            <span className="animate-spin">⏳</span>
            <span>Highlighting syntax...</span>
          </div>
        ) : (
          <div
            className="shiki-preview [&>pre]:bg-transparent! [&>pre]:p-0! [&>pre]:m-0! overflow-x-auto text-[13px] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        )}
      </div>
    </div>
  );
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
