import { Contract } from "../../models/contract.model";
import { NotFoundError, ValidationError } from "../../errors";
import { Types } from "mongoose";

/**
 * CORE PAYROLL BUSINESS LOGIC:
 * Finds the single 'Running' contract that applies to a specific payroll period.
 * The contract is applicable if its validity dates overlap with the payroll period.
 */
export const getApplicableContractService = async (employeeId: string, periodStart: string, periodEnd: string) => {
  const pStart = new Date(periodStart);
  const pEnd = new Date(periodEnd);

  if (pEnd < pStart) {
    throw new ValidationError("Payroll period end date must be after start date");
  }

  // Find all running contracts for the employee
  const contracts = await Contract.find({
    employeeId: new Types.ObjectId(employeeId),
    status: "Running"
  }).populate(["departmentId", "jobPositionId", "workingScheduleId", "salaryStructureId"]);

  // Filter in memory to handle null endDate easily
  const applicableContracts = contracts.filter(c => {
    const cStart = c.startDate;
    const cEnd = c.endDate || new Date("9999-12-31");
    // Overlap logic: contract starts before/during period END, and ends after/during period START
    return (cStart <= pEnd && cEnd >= pStart);
  });

  if (applicableContracts.length === 0) {
    throw new NotFoundError(`No valid running contract found for employee in period ${periodStart} to ${periodEnd}`);
  }

  if (applicableContracts.length > 1) {
    throw new ValidationError(`CRITICAL: Employee has multiple overlapping running contracts in period ${periodStart} to ${periodEnd}`);
  }

  return applicableContracts[0];
};
