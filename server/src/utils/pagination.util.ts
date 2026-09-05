import { Request } from "express";
import { OffsetPagination } from "../types/api-response.type";

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export const getPaginationParams = (req: Request, defaultLimit = 15): PaginationParams => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string) || defaultLimit);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const buildOffsetPagination = (
  totalItems: number,
  currentPage: number,
  pageSize: number
): OffsetPagination => {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  return {
    totalItems,
    totalPages,
    currentPage,
    pageSize,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};
