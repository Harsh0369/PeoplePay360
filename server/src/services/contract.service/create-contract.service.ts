import { Contract } from "../../models/contract.model";
import { Employee, Department, JobPosition, WorkingSchedule, SalaryStructure } from "../../models";
import { NotFoundError, ValidationError } from "../../errors";
import { Types } from "mongoose";
import { createBusinessLog } from "../business-log.service";

export interface CreateContractDto {
  employeeId: string;
  departmentId: string;
  jobPositionId: string;
  wage: number;
  startDate: string; // ISO String
  endDate?: string;  // ISO String
  workingScheduleId: string;
  salaryStructureId?: string;
}

export const createContractService = async (data: CreateContractDto, actorId?: string) => {
  // 1. Verify all related entities exist
  const [employee, dept, job, schedule, salaryStruct] = await Promise.all([
    Employee.findById(data.employeeId),
    Department.findById(data.departmentId),
    JobPosition.findById(data.jobPositionId),
    WorkingSchedule.findById(data.workingScheduleId),
    data.salaryStructureId ? SalaryStructure.findById(data.salaryStructureId) : Promise.resolve(null),
  ]);

  if (!employee) throw new NotFoundError("Employee not found");
  if (!dept) throw new NotFoundError("Department not found");
  if (!job) throw new NotFoundError("Job Position not found");
  if (!schedule) throw new NotFoundError("Working Schedule not found");
  if (data.salaryStructureId && !salaryStruct) {
    throw new NotFoundError("Salary Structure not found");
  }

  // 2. Validate dates
  const startDate = new Date(data.startDate);
  let endDate: Date | null = null;
  
  if (data.endDate) {
    endDate = new Date(data.endDate);
    if (endDate <= startDate) {
      throw new ValidationError("End date must be after start date");
    }
  }

  // 3. Overlap check for 'Running' contracts
  // A running contract overlaps if its startDate is before this new endDate (or no new endDate)
  // AND its endDate is after this new startDate (or no existing endDate)
  const overlapQuery: any = {
    employeeId: new Types.ObjectId(data.employeeId),
    status: "Running",
    startDate: { $lte: endDate || new Date("9999-12-31") },
  };

  const existingRunningContracts = await Contract.find(overlapQuery);
  
  // Refine overlap logic since mongoose $lte/$gte on optional null fields is tricky
  for (const c of existingRunningContracts) {
    const cStart = c.startDate;
    const cEnd = c.endDate || new Date("9999-12-31");
    const newStart = startDate;
    const newEnd = endDate || new Date("9999-12-31");

    if (newStart <= cEnd && newEnd >= cStart) {
      throw new ValidationError("Employee already has an overlapping Running contract for this period");
    }
  }

  // 4. Create Draft contract (it should be transitioned to Running explicitly)
  const contract = await Contract.create({
    ...data,
    startDate,
    endDate,
    status: "Draft"
  });

  if (actorId) {
    createBusinessLog({
      actorId,
      affectedEmployeeId: data.employeeId,
      action: "CREATE",
      entity: "CONTRACT",
      content: `Contract created for employee (wage: ${data.wage}, start: ${data.startDate})`,
    });
  }

  return contract;
};
