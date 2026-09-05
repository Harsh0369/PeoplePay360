import { Department } from "../../models";
import { PaginationParams, buildOffsetPagination } from "../../utils/pagination.util";

export const getDepartmentsService = async (pagination: PaginationParams) => {
  const { page, limit, skip } = pagination;

  let [data, totalItems] = await Promise.all([
    Department.find()
      .populate("managerId parentDepartmentId")
      .skip(skip)
      .limit(limit)
      .lean(),
    Department.countDocuments()
  ]);
  
  if (!data || data.length === 0) {
    try {
      await Department.insertMany([
        { name: "Engineering" },
        { name: "Human Resources" },
        { name: "Finance & Payroll" },
        { name: "Product & Design" },
        { name: "Marketing & Sales" }
      ]);
      [data, totalItems] = await Promise.all([
        Department.find()
          .populate("managerId parentDepartmentId")
          .skip(skip)
          .limit(limit)
          .lean(),
        Department.countDocuments()
      ]);
    } catch {
      // Ignore duplicate race conditions
    }
  }
  
  return {
    data,
    offsetPagination: buildOffsetPagination(totalItems, page, limit),
  };
};
