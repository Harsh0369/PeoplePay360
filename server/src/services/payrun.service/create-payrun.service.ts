import { Payrun } from "../../models/payrun.model";
import { Department } from "../../models";
import { ValidationError, NotFoundError, ConflictError } from "../../errors";

export interface CreatePayrunDto {
  periodStart: string; // ISO date
  periodEnd: string;   // ISO date
  departmentId?: string | null;
  createdBy: string; // userId
}

export const createPayrunService = async (data: CreatePayrunDto) => {
  const pStart = new Date(data.periodStart);
  const pEnd = new Date(data.periodEnd);

  // 1. Validate dates
  if (isNaN(pStart.getTime()) || isNaN(pEnd.getTime())) {
    throw new ValidationError("Invalid date format. Use ISO date strings.");
  }

  if (pEnd <= pStart) {
    throw new ValidationError("Period end date must be after start date");
  }

  // 2. Period cannot be in the future (payroll is for past/current periods)
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (pStart > today) {
    throw new ValidationError("Cannot create a payrun for a future period");
  }

  // 3. Validate department if provided
  if (data.departmentId) {
    const dept = await Department.findById(data.departmentId);
    if (!dept) {
      throw new NotFoundError("Department not found");
    }
  }

  // 4. Check for duplicate active payrun in the same period/scope
  const existingPayrun = await Payrun.findOne({
    periodStart: pStart,
    periodEnd: pEnd,
    departmentId: data.departmentId || null,
    status: { $nin: ["Cancelled"] },
  });

  if (existingPayrun) {
    throw new ConflictError(
      `An active payrun already exists for this period${data.departmentId ? " and department" : ""}. Status: ${existingPayrun.status}`
    );
  }

  // 5. Auto-generate name
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const name = `Payrun - ${monthNames[pStart.getMonth()]} ${pStart.getFullYear()}`;

  const payrun = await Payrun.create({
    name,
    periodStart: pStart,
    periodEnd: pEnd,
    departmentId: data.departmentId || null,
    createdBy: data.createdBy,
    status: "Draft",
  });

  return payrun;
};
