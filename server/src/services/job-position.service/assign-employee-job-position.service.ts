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

  let jobPositionTitle = 'None';
  let newJobPositionId = null;

  if (jobPositionId) {
    const jobPosition = await JobPosition.findById(jobPositionId);
    if (!jobPosition) {
      throw new NotFoundError("Job Position not found");
    }
    jobPositionTitle = jobPosition.title;
    newJobPositionId = jobPosition._id;
  }

  const oldJobId = employee.jobPositionId;
  
  employee.jobPositionId = newJobPositionId;
  await employee.save();

  // Optionally update their active Contract
  if (newJobPositionId) {
    await Contract.updateMany(
      { employeeId: employee._id, status: "Running" },
      { $set: { jobPositionId: newJobPositionId } }
    );
  } else {
    await Contract.updateMany(
      { employeeId: employee._id, status: "Running" },
      { $unset: { jobPositionId: 1 } }
    );
  }

  // Non-blocking business log
  setImmediate(async () => {
    try {
      await BusinessLog.create({
        entity: "EMPLOYEE",
        action: "UPDATE",
        content: `Assigned to Job Title: ${jobPositionTitle} (was: ${oldJobId || 'None'})`,
        actorId: adminUserId,
      });
    } catch (err) {
      console.error("Failed to write business log for job position assignment:", err);
    }
  });

  return employee;
};
