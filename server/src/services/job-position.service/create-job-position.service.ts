import { JobPosition } from "../../models";
import { ValidationError } from "../../errors";

export interface CreateJobPositionDto {
  title: string;
  departmentId?: string;
  expectedSalary?: number;
}

export const createJobPositionService = async (data: CreateJobPositionDto) => {
  const existing = await JobPosition.findOne({ title: data.title });
  if (existing) {
    throw new ValidationError(`Job Position with title ${data.title} already exists`);
  }

  const jobPos = await JobPosition.create(data);
  return jobPos;
};
