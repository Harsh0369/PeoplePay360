import { Department } from "../../models";
import { ValidationError } from "../../errors";

export interface CreateDepartmentDto {
  name: string;
  parentDepartmentId?: string;
  managerId?: string;
}

export const createDepartmentService = async (data: CreateDepartmentDto) => {
  const existing = await Department.findOne({ name: data.name });
  if (existing) {
    throw new ValidationError(`Department with name ${data.name} already exists`);
  }

  const dept = await Department.create(data);
  return dept;
};
