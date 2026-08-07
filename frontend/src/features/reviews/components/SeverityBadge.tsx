'use client';

import React from 'react';
import { Severity } from '../types';

interface SeverityBadgeProps {
  severity: Severity;
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const styles: Record<Severity, string> = {
    CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
    HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    MEDIUM: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    LOW: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border ${
        styles[severity] || styles.MEDIUM
      }`}
    >
      {severity}
    </span>
  );
}
