import { Payrun } from "../../models/payrun.model";
import { PaginationParams, buildOffsetPagination } from "../../utils/pagination.util";

export const getPayrunsService = async (
  pagination: PaginationParams,
  filters?: {
    status?: string;
    periodStart?: string;
    periodEnd?: string;
  }
) => {
  const query: any = {};
  const { page, limit, skip } = pagination;

  if (filters?.status) {
    query.status = filters.status;
  }

  if (filters?.periodStart) {
    query.periodStart = { $gte: new Date(filters.periodStart) };
  }

  if (filters?.periodEnd) {
    query.periodEnd = { $lte: new Date(filters.periodEnd) };
  }

  const [data, totalItems] = await Promise.all([
    Payrun.find(query)
      .populate("createdBy", "name email")
      .populate("departmentId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Payrun.countDocuments(query)
  ]);

  return {
    data,
    offsetPagination: buildOffsetPagination(totalItems, page, limit),
  };
};
