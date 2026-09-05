import { Contract } from "../../models/contract.model";
import { PaginationParams, buildOffsetPagination } from "../../utils/pagination.util";

export const getContractsService = async (pagination: PaginationParams, employeeId?: string) => {
  const query = employeeId ? { employeeId } : {};
  const { page, limit, skip } = pagination;

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
