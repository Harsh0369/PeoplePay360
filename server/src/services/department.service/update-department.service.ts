import { Department } from "../../models/department.model";
import { NotFoundError } from "../../errors/index";

export const updateDepartmentService = async (id: string, data: any) => {
  const dept = await Department.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!dept) throw new NotFoundError("Department not found");
  return dept;
};
