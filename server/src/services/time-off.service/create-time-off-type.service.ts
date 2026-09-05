import { TimeOffType } from "../../models";
import { ConflictError, ValidationError } from "../../errors";

interface CreateTimeOffTypeDto {
  name: string;
  requiresAllocation: boolean;
}

export const createTimeOffTypeService = async (data: CreateTimeOffTypeDto) => {
  if (!data.name || data.name.trim().length === 0) {
    throw new ValidationError("Time off type name is required");
  }

  const existing = await TimeOffType.findOne({ name: data.name.trim() });
  if (existing) {
    throw new ConflictError(`Time off type "${data.name}" already exists`);
  }

  return TimeOffType.create({
    name: data.name.trim(),
    requiresAllocation: data.requiresAllocation ?? true,
  });
};
