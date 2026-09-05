import { Payslip } from "../../models/payslip.model";

export const getPayslipsService = async (filters?: {
  employeeId?: string;
  payrunId?: string;
  status?: string;
  periodStart?: string;
  periodEnd?: string;
}) => {
  const query: any = {};

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

  return Payslip.find(query)
    .populate("employeeId", "name workEmail")
    .populate("payrunId", "name status")
    .sort({ createdAt: -1 });
};
