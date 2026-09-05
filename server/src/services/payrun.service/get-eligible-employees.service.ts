import { Payrun } from "../../models/payrun.model";
import { Employee, Contract } from "../../models";
import { NotFoundError, ValidationError } from "../../errors";
import { Types } from "mongoose";

export const getEligibleEmployeesService = async (payrunId: string) => {
  const payrun = await Payrun.findById(payrunId);
  if (!payrun) {
    throw new NotFoundError("Payrun not found");
  }

  if (payrun.status !== "Draft") {
    throw new ValidationError("Can only fetch eligible employees for Draft payruns");
  }

  // 1. Find employees in scope
  const employeeQuery: any = { status: "Active" };
  if (payrun.departmentId) {
    employeeQuery.departmentId = payrun.departmentId;
  }

  const employees = await Employee.find(employeeQuery).lean();
  const employeeIds = employees.map(e => e._id);

  // 2. Find running contracts for these employees that overlap with the payrun period
  const contracts = await Contract.find({
    employeeId: { $in: employeeIds },
    status: "Running",
  }).lean();

  const eligibleEmployees = [];

  for (const emp of employees) {
    const empContracts = contracts.filter(c => c.employeeId.toString() === emp._id.toString());
    
    // Filter in memory for period overlap
    const applicable = empContracts.filter((c) => {
      const cStart = new Date(c.startDate);
      const cEnd = c.endDate ? new Date(c.endDate) : new Date("9999-12-31");
      return cStart <= payrun.periodEnd && cEnd >= payrun.periodStart;
    });

    if (applicable.length > 0) {
      eligibleEmployees.push({
        ...emp,
        contract: applicable[0],
        hasMultipleContracts: applicable.length > 1
      });
    }
  }

  return eligibleEmployees;
};
