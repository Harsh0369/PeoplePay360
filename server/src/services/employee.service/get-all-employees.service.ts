import { Employee } from "../../models/employee.model";
import { PaginationParams, buildOffsetPagination } from "../../utils/pagination.util";

export const getAllEmployeesService = async (pagination: PaginationParams) => {
  const { page, limit, skip } = pagination;

  const [data, totalItems] = await Promise.all([
    Employee.find()
      .populate("departmentId jobPositionId managerId")
      .skip(skip)
      .limit(limit)
      .lean(),
    Employee.countDocuments()
  ]);

  return {
    data,
    offsetPagination: buildOffsetPagination(totalItems, page, limit),
  };
};
