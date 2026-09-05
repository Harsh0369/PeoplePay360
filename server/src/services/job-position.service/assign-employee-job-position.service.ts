import { Employee, JobPosition, BusinessLog, Contract } from "../../models";
import { NotFoundError } from "../../errors";

export const assignEmployeeJobPositionService = async (
  employeeId: string,
  jobPositionId: string,
  adminUserId: string
) => {
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    throw new NotFoundError("Employee not found");
  }

  const jobPosition = await JobPosition.findById(jobPositionId);
  if (!jobPosition) {
    throw new NotFoundError("Job Position not found");
  }

  const oldJobId = employee.jobPositionId;
  
  employee.jobPositionId = jobPosition._id;
  await employee.save();

  // Optionally update their active Contract
  await Contract.updateMany(
    { employeeId: employee._id, status: "Running" },
    { $set: { jobPositionId: jobPosition._id } }
  );

  // Non-blocking business log
  setImmediate(async () => {
    try {
      await BusinessLog.create({
        entity: "EMPLOYEE",
        action: "UPDATE",
        content: `Assigned to Job Title: ${jobPosition.title} (was: ${oldJobId || 'None'})`,
        actorId: adminUserId,
      });
    } catch (err) {
      console.error("Failed to write business log for job position assignment:", err);
    }
  });

  return employee;
};
