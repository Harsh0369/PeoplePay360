export interface OffsetPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CursorPagination {
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  offsetPagination?: OffsetPagination;
  cursorPagination?: CursorPagination;
  error?: string;
}
