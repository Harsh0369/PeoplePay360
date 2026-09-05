import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchBar: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string; className?: string }> = ({
  value, onChange, placeholder = 'Search…', className = '',
}) => (
  <div className={`relative ${className}`}>
    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full text-xs pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500"
    />
    {value && (
      <button onClick={() => onChange('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label="Clear search">
        <X className="w-4 h-4" />
      </button>
    )}
  </div>
);
