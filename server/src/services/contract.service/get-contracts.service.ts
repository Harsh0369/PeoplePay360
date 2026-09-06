import { Contract } from "../../models/contract.model";
import { Employee } from "../../models";
import { PaginationParams, buildOffsetPagination } from "../../utils/pagination.util";
import { smartCount } from "../../utils/db.util";

export const getContractsService = async (pagination: PaginationParams, filters: any = {}) => {
  const query: Record<string, any> = {};
  if (filters.employeeId) query.employeeId = filters.employeeId;
  const { page, limit, skip } = pagination;

  // Search matches the employee's name (a populated ref) — resolve matching
  // employee ids first, then filter contracts by them.
  if (filters.search?.trim()) {
    const rx = new RegExp(filters.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const empIds = await Employee.find({ $or: [{ name: rx }, { workEmail: rx }] }).distinct("_id");
    query.employeeId = filters.employeeId ? filters.employeeId : { $in: empIds };
  }

  if (filters.status) query.status = filters.status;
  if (filters.departmentId) query.departmentId = filters.departmentId;
  if (filters.jobPositionId) query.jobPositionId = filters.jobPositionId;

  const [data, totalItems] = await Promise.all([
    Contract.find(query)
      .populate("employeeId", "name workEmail")
      .populate("departmentId", "name")
      .populate("jobPositionId", "title")
      .populate("salaryStructureId", "name")
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    smartCount(Contract, query)
  ]);

  return {
    data,
    offsetPagination: buildOffsetPagination(totalItems, page, limit),
  };
};
