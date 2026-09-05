import { JobPosition, Department } from "../../models";
import { PaginationParams, buildOffsetPagination } from "../../utils/pagination.util";

export const getJobPositionsService = async (pagination: PaginationParams) => {
  const { page, limit, skip } = pagination;

  let [data, totalItems] = await Promise.all([
    JobPosition.find()
      .populate("departmentId")
      .skip(skip)
      .limit(limit)
      .lean(),
    JobPosition.countDocuments()
  ]);

  if (!data || data.length === 0) {
    try {
      const eng = await Department.findOne({ name: "Engineering" });
      const hr = await Department.findOne({ name: "Human Resources" });
      const fin = await Department.findOne({ name: "Finance & Payroll" });

      await JobPosition.insertMany([
        { title: "Senior Software Engineer", departmentId: eng?._id, expectedSalary: 8500 },
        { title: "HR Specialist", departmentId: hr?._id, expectedSalary: 5900 },
        { title: "Payroll Coordinator", departmentId: fin?._id, expectedSalary: 6200 },
        { title: "Product Designer", departmentId: eng?._id, expectedSalary: 5400 },
        { title: "DevOps Lead", departmentId: eng?._id, expectedSalary: 9200 }
      ]);
      [data, totalItems] = await Promise.all([
        JobPosition.find()
          .populate("departmentId")
          .skip(skip)
          .limit(limit)
          .lean(),
        JobPosition.countDocuments()
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
