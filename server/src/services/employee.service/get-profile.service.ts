import { Employee } from "../../models/employee.model";
import { Contract } from "../../models/contract.model";
import { NotFoundError } from "../../errors/index";

export const getProfileService = async (userId: string) => {
  const employee = await Employee.findOne({ userId })
    .populate("departmentId", "name")
    .populate("jobPositionId", "title expectedSalary")
    .populate("managerId", "name workEmail");

  if (!employee) {
    throw new NotFoundError("Employee profile not found for this user");
  }

  // Find the active contract for this employee
  const now = new Date();
  const activeContract = await Contract.findOne({
    employeeId: employee._id,
    status: "Running",
    startDate: { $lte: now },
    $or: [
      { endDate: { $gte: now } },
      { endDate: null }
    ]
  }).populate("workingScheduleId", "name totalWeeklyHours workingDays");

  return {
    employee,
    activeContract
  };
};
