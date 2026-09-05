import { Employee } from "../../models/employee.model";
import { PaginationParams, buildOffsetPagination } from "../../utils/pagination.util";

export const getAllEmployeesService = async (pagination: PaginationParams, search = "") => {
  const { page, limit, skip } = pagination;

  // Optional case-insensitive text search across name and work email.
  const query: Record<string, any> = {};
  if (search.trim()) {
    const rx = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    query.$or = [{ name: rx }, { workEmail: rx }];
  }

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
