import { authHeaders } from '../services/auth';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export interface PageInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Fetches one page from a backend list endpoint. Sends ?page&limit (and ?search
 * when provided — the backend text-searches server-side) and returns both the
 * rows and the offset-pagination metadata.
 */
export async function fetchPaged(
  path: string,
  { page = 1, limit = 15, search = '', extra = '' }: { page?: number; limit?: number; search?: string; extra?: string } = {}
): Promise<{ items: any[]; pagination: PageInfo }> {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search.trim()) qs.set('search', search.trim());
  const sep = path.includes('?') ? '&' : '?';
  const url = `${API}${path}${sep}${qs.toString()}${extra ? `&${extra}` : ''}`;

  const res = await fetch(url, { headers: authHeaders(), signal: AbortSignal.timeout(20000) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || json?.error || `Request failed (${res.status})`);

  const items = Array.isArray(json?.data) ? json.data : [];
  const p = json?.offsetPagination || {};
  return {
    items,
    pagination: {
      currentPage: p.currentPage ?? page,
      totalPages: p.totalPages ?? 1,
      totalItems: p.totalItems ?? items.length,
      pageSize: p.pageSize ?? limit,
      hasNextPage: !!p.hasNextPage,
      hasPrevPage: !!p.hasPrevPage,
    },
  };
}
