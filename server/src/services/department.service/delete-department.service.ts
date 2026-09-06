import { Department } from "../../models/department.model";
import { NotFoundError } from "../../errors/index";

export const deleteDepartmentService = async (id: string) => {
  const dept = await Department.findByIdAndDelete(id);
  if (!dept) throw new NotFoundError("Department not found");
  return { id };
};
