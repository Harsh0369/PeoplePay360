import { Employee, Contract, Attendance, TimeOffRequest, TimeOffAllocation } from "../../models";
import { NotFoundError } from "../../errors";

/**
 * "Smart-button hub" — returns an employee alongside aggregate counts
 * of their related records (contracts, attendance, time-off, allocations).
 * This is the central employee detail endpoint the frontend needs.
 */
export const getEmployeeDetailService = async (employeeId: string) => {
  const employee = await Employee.findById(employeeId)
    .populate("departmentId", "name")
    .populate("jobPositionId", "title")
    .populate("managerId", "name");

  if (!employee) {
    throw new NotFoundError("Employee not found");
  }

  // Parallel aggregate counts for smart buttons
  const [contractCount, attendanceCount, timeOffCount, allocationCount] = await Promise.all([
    Contract.countDocuments({ employeeId: employee._id }),
    Attendance.countDocuments({ employeeId: employee._id }),
    TimeOffRequest.countDocuments({ employeeId: employee._id }),
    TimeOffAllocation.countDocuments({ employeeId: employee._id }),
  ]);

  return {
    employee,
    smartButtons: {
      contractCount,
      attendanceCount,
      timeOffCount,
      allocationCount,
    },
  };
};
