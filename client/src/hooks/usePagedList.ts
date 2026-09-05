import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchPaged, PageInfo } from '../lib/paged';

const emptyPage: PageInfo = { currentPage: 1, totalPages: 1, totalItems: 0, pageSize: 15, hasNextPage: false, hasPrevPage: false };

/**
 * Server-side paginated + searchable list. Only the current page (≤ limit rows)
 * is ever loaded. Search is debounced and sent to the backend.
 */
export function useServerList(path: string, { limit = 15, extra = '' }: { limit?: number; extra?: string } = {}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [pagination, setPagination] = useState<PageInfo>(emptyPage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const reqId = useRef(0);

  // Debounce the search box; reset to page 1 on a new query.
  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    const id = ++reqId.current;
    setLoading(true); setError('');
    try {
      const res = await fetchPaged(path, { page, limit, search: debounced, extra });
      if (id !== reqId.current) return; // a newer request superseded this one
      setItems(res.items);
      setPagination(res.pagination);
    } catch (e: any) {
      if (id === reqId.current) { setError(e.message); setItems([]); }
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, [path, page, limit, debounced, extra]);

  useEffect(() => { load(); }, [load]);

  return { items, pagination, page, setPage, search, setSearch, loading, error, reload: load };
}

const getField = (obj: any, path: string) =>
  path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

/**
 * Client-side pagination + search for small lists already loaded in memory.
 * `searchFields` may use dotted paths (e.g. 'employeeId.name').
 */
export function useClientList<T = any>(all: T[], { searchFields = [], pageSize = 15 }: { searchFields?: string[]; pageSize?: number } = {}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return all;
    return all.filter((it) =>
      searchFields.some((f) => String(getField(it, f) ?? '').toLowerCase().includes(q))
    );
  }, [all, search, searchFields]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);
  useEffect(() => { setPage(1); }, [search]);

  const items = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return {
    items,
    page: safePage,
    setPage,
    search,
    setSearch,
    totalPages,
    totalItems: filtered.length,
    pageSize,
  };
}
