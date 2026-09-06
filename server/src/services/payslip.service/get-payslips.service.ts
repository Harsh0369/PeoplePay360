import { Payslip } from "../../models/payslip.model";
import { PaginationParams, buildOffsetPagination } from "../../utils/pagination.util";
import { smartCount } from "../../utils/db.util";

export const getPayslipsService = async (
  pagination: PaginationParams,
  filters?: {
    employeeId?: string;
    payrunId?: string;
    status?: string;
    periodStart?: string;
    periodEnd?: string;
  }
) => {
  const query: any = {};
  const { page, limit, skip } = pagination;

  if (filters?.employeeId) {
    query.employeeId = filters.employeeId;
  }

  if (filters?.payrunId) {
    query.payrunId = filters.payrunId;
  }

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
    Payslip.find(query)
      .populate("employeeId", "name workEmail")
      .populate("payrunId", "name status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    smartCount(Payslip, query)
  ]);

  return {
    data,
    offsetPagination: buildOffsetPagination(totalItems, page, limit),
  };
};
