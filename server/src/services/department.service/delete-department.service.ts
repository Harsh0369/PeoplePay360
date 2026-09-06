import { Department } from "../../models/department.model";
import { NotFoundError, AppError } from "../../errors/index";
import { Employee } from "../../models/employee.model";

export const deleteDepartmentService = async (id: string) => {
  const employeeExists = await Employee.exists({ departmentId: id });
  if (employeeExists) {
    throw new AppError("Cannot delete department because employees are assigned to it.", 400);
  }
  const dept = await Department.findByIdAndDelete(id);
  if (!dept) throw new NotFoundError("Department not found");
  return { id };
};
