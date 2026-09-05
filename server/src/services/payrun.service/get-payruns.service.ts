import { Payrun } from "../../models/payrun.model";

export const getPayrunsService = async (filters?: {
  status?: string;
  periodStart?: string;
  periodEnd?: string;
}) => {
  const query: any = {};

  if (filters?.status) {
    query.status = filters.status;
  }

  if (filters?.periodStart) {
    query.periodStart = { $gte: new Date(filters.periodStart) };
  }

  if (filters?.periodEnd) {
    query.periodEnd = { $lte: new Date(filters.periodEnd) };
  }

  return Payrun.find(query)
    .populate("createdBy", "name email")
    .populate("departmentId", "name")
    .sort({ createdAt: -1 });
};
