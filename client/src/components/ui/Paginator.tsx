import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginatorProps {
  page: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPage: (p: number) => void;
}

/**
 * Shared pagination bar: Prev / Next, a directly-editable page-number box
 * (type a page and press Enter to jump), and a "Page X of Y · N items" summary.
 */
export const Paginator: React.FC<PaginatorProps> = ({ page, totalPages, totalItems, pageSize, onPage }) => {
  const [input, setInput] = useState(String(page));
  useEffect(() => setInput(String(page)), [page]);

  const clamp = (p: number) => Math.min(Math.max(1, p), Math.max(1, totalPages));
  const jump = () => {
    const p = clamp(parseInt(input, 10) || 1);
    setInput(String(p));
    if (p !== page) onPage(p);
  };

  const from = totalItems && pageSize ? (page - 1) * pageSize + 1 : undefined;
  const to = totalItems && pageSize ? Math.min(page * pageSize, totalItems) : undefined;

  if (totalPages <= 1 && !totalItems) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
      <span>
        {from !== undefined
          ? <>Showing <strong className="text-slate-700">{from}–{to}</strong> of <strong className="text-slate-700">{totalItems}</strong></>
          : <>Page <strong className="text-slate-700">{page}</strong> of {totalPages}</>}
      </span>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPage(clamp(page - 1))}
          disabled={page <= 1}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Page</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value.replace(/[^\d]/g, ''))}
            onBlur={jump}
            onKeyDown={(e) => e.key === 'Enter' && jump()}
            className="w-12 text-center px-1.5 py-1 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            aria-label="Go to page"
          />
          <span className="text-slate-400">of {totalPages}</span>
        </div>

        <button
          onClick={() => onPage(clamp(page + 1))}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
