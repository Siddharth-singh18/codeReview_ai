'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import { motion } from 'framer-motion';
import { Code2, LayoutDashboard, Settings, LogOut, Shield, Sparkles } from 'lucide-react';

export function NavigationBar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'AI Settings', href: '/settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/dashboard" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-violet-600 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Code2 className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent flex items-center gap-1.5">
              CodeReview AI
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                PRO
              </span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Automated Intelligence</span>
          </div>
        </Link>

        {/* Navigation Links & User Actions */}
        {user && (
          <nav className="flex items-center space-x-2 sm:space-x-6">
            <div className="flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-white/[0.06]">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center space-x-2"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavTab"
                        className="absolute inset-0 bg-cyan-500/15 border border-cyan-500/30 rounded-lg shadow-sm shadow-cyan-500/10"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Icon className={`w-3.5 h-3.5 z-10 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span className={`z-10 ${isActive ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'}`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />

            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-slate-400 truncate max-w-[120px]">{user.email}</span>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
