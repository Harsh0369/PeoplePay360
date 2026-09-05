export interface OffsetPagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
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
