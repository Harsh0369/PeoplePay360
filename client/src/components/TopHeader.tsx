import React from 'react';
import { ChevronRight, Menu } from 'lucide-react';

interface TopHeaderProps {
  title: string;
  onMenuToggle?: () => void;
}

const today = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });

export const TopHeader: React.FC<TopHeaderProps> = ({ title, onMenuToggle }) => (
  <header className="h-14 sm:h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between flex-shrink-0 z-20">
    <div className="flex items-center text-xs font-medium text-slate-400 gap-1.5">
      {/* Hamburger for mobile */}
      <button onClick={onMenuToggle} className="lg:hidden p-1.5 -ml-1 mr-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
        <Menu className="w-5 h-5" />
      </button>
      <span className="hidden sm:inline">Enterprise</span>
      <ChevronRight className="w-3.5 h-3.5 hidden sm:inline" />
      <span className="hidden sm:inline">HR Management</span>
      <ChevronRight className="w-3.5 h-3.5 hidden sm:inline" />
      <span className="text-brand-850 font-semibold">{title}</span>
    </div>
    <div className="text-xs font-medium text-slate-400 hidden sm:block">{today}</div>
  </header>
);
