'use client';

import React from 'react';
import { Severity } from '../types';
import { ShieldAlert, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface SeverityBadgeProps {
  severity: Severity;
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const getSeverityStyle = () => {
    switch (severity) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
          icon: ShieldAlert,
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-500/15 border-orange-500/30 text-orange-400',
          icon: AlertTriangle,
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
          icon: AlertCircle,
        };
      case 'LOW':
        return {
          bg: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
          icon: Info,
        };
      default:
        return {
          bg: 'bg-slate-800 border-slate-700 text-slate-300',
          icon: Info,
        };
    }
  };

  const style = getSeverityStyle();
  const Icon = style.icon;

  return (
    <span
      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${style.bg}`}
    >
      <Icon className="w-3 h-3" />
      <span>{severity}</span>
    </span>
  );
}
