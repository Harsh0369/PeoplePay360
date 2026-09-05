import { TimeOffAllocation, Employee, TimeOffType } from "../../models";
import { NotFoundError, ValidationError, ConflictError } from "../../errors";

interface CreateAllocationDto {
  employeeId: string;
  timeOffTypeId: string;
  grantedDays: number;
  validityYear: number;
}

export const createTimeOffAllocationService = async (data: CreateAllocationDto) => {
  if (!data.employeeId || !data.timeOffTypeId) {
    throw new ValidationError("Employee ID and Time Off Type ID are required");
  }

  if (!data.grantedDays || data.grantedDays <= 0) {
    throw new ValidationError("Granted days must be a positive number");
  }

  const employee = await Employee.findById(data.employeeId);
  if (!employee) throw new NotFoundError("Employee not found");

  const type = await TimeOffType.findById(data.timeOffTypeId);
  if (!type) throw new NotFoundError("Time off type not found");

  const year = data.validityYear || new Date().getFullYear();

  // Check for duplicate allocation
  const existing = await TimeOffAllocation.findOne({
    employeeId: data.employeeId,
    timeOffTypeId: data.timeOffTypeId,
    validityYear: year,
  });
  if (existing) {
    throw new ConflictError(
      `Allocation already exists for this employee, type, and year. Current balance: ${existing.grantedDays - existing.usedDays} days remaining.`
    );
  }

  return TimeOffAllocation.create({
    employeeId: data.employeeId,
    timeOffTypeId: data.timeOffTypeId,
    grantedDays: data.grantedDays,
    usedDays: 0,
    validityYear: year,
  });
};
