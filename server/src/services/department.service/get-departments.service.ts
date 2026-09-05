import { Department } from "../../models";

export const getDepartmentsService = async () => {
  let depts = await Department.find().populate("managerId parentDepartmentId");
  if (!depts || depts.length === 0) {
    try {
      await Department.insertMany([
        { name: "Engineering" },
        { name: "Human Resources" },
        { name: "Finance & Payroll" },
        { name: "Product & Design" },
        { name: "Marketing & Sales" }
      ]);
      depts = await Department.find().populate("managerId parentDepartmentId");
    } catch {
      // Ignore duplicate race conditions
    }
  }
  return depts;
};
