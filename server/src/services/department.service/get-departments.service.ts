import { Department } from "../../models";

export const getDepartmentsService = async () => {
  return Department.find().populate("managerId parentDepartmentId");
};
