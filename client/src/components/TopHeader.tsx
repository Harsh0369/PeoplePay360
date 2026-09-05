import React from 'react';
import { ChevronRight } from 'lucide-react';

interface TopHeaderProps {
  title: string;
}

const today = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });

export const TopHeader: React.FC<TopHeaderProps> = ({ title }) => (
  <header className="h-16 bg-white border-b border-slate-200/80 px-6 lg:px-8 flex items-center justify-between flex-shrink-0 z-20">
    <div className="flex items-center text-xs font-medium text-slate-400 gap-1.5">
      <span className="hidden sm:inline">Enterprise</span>
      <ChevronRight className="w-3.5 h-3.5 hidden sm:inline" />
      <span className="hidden sm:inline">HR Management</span>
      <ChevronRight className="w-3.5 h-3.5 hidden sm:inline" />
      <span className="text-brand-850 font-semibold">{title}</span>
    </div>
    <div className="text-xs font-medium text-slate-400">{today}</div>
  </header>
);
