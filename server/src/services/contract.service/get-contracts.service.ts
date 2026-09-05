import { Contract } from "../../models/contract.model";
import { Employee } from "../../models";
import { PaginationParams, buildOffsetPagination } from "../../utils/pagination.util";

export const getContractsService = async (pagination: PaginationParams, employeeId?: string, search = "") => {
  const query: Record<string, any> = employeeId ? { employeeId } : {};
  const { page, limit, skip } = pagination;

  // Search matches the employee's name (a populated ref) — resolve matching
  // employee ids first, then filter contracts by them.
  if (search.trim()) {
    const rx = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const empIds = await Employee.find({ $or: [{ name: rx }, { workEmail: rx }] }).distinct("_id");
    query.employeeId = employeeId ? employeeId : { $in: empIds };
  }

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
    Contract.countDocuments(query)
  ]);

  return {
    data,
    offsetPagination: buildOffsetPagination(totalItems, page, limit),
  };
};
