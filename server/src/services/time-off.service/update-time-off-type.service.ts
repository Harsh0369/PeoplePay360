import { TimeOffType } from "../../models/time-off-type.model";
import { NotFoundError } from "../../errors/common.error";

export const updateTimeOffTypeService = async (id: string, updateData: Partial<{ name: string; description: string; isPaid: boolean; requiresAllocation: boolean; isActive: boolean }>) => {
  const timeOffType = await TimeOffType.findById(id);
  if (!timeOffType) {
    throw new NotFoundError("Time off type not found");
  }

  // Update fields
  if (updateData.name !== undefined) timeOffType.name = updateData.name;
  if (updateData.description !== undefined) timeOffType.description = updateData.description;
  if (updateData.isPaid !== undefined) timeOffType.isPaid = updateData.isPaid;
  if (updateData.requiresAllocation !== undefined) timeOffType.requiresAllocation = updateData.requiresAllocation;
  if (updateData.isActive !== undefined) timeOffType.isActive = updateData.isActive;

  await timeOffType.save();
  return timeOffType;
};
