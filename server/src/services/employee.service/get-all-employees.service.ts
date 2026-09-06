import { Employee } from "../../models/employee.model";
import { PaginationParams, buildOffsetPagination } from "../../utils/pagination.util";

export const getAllEmployeesService = async (pagination: PaginationParams, filters: any = {}) => {
  const { page, limit, skip } = pagination;

  const query: Record<string, any> = {};
  if (filters.search?.trim()) {
    const rx = new RegExp(filters.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    query.$or = [{ name: rx }, { workEmail: rx }];
  }
  if (filters.departmentId) query.departmentId = filters.departmentId;
  if (filters.jobPositionId) query.jobPositionId = filters.jobPositionId;
  if (filters.status) query.status = filters.status;
  if (filters.employeeType) query.employeeType = filters.employeeType;

  const [data, totalItems] = await Promise.all([
    Employee.find(query)
      .populate("departmentId jobPositionId managerId")
      .skip(skip)
      .limit(limit)
      .lean(),
    Employee.countDocuments(query)
  ]);

  return {
    data,
    offsetPagination: buildOffsetPagination(totalItems, page, limit),
  };
};
