import { JobPosition } from "../../models/job-position.model";
import { NotFoundError, AppError } from "../../errors/index";
import { Employee } from "../../models/employee.model";

export const updateJobPositionService = async (id: string, data: any) => {
  const jobPos = await JobPosition.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!jobPos) throw new NotFoundError("Job Position not found");
  return jobPos;
};

export const deleteJobPositionService = async (id: string) => {
  const employeeExists = await Employee.exists({ jobPositionId: id });
  if (employeeExists) {
    throw new AppError("Cannot delete job position because employees are assigned to it.", 400);
  }
  const jobPos = await JobPosition.findByIdAndDelete(id);
  if (!jobPos) throw new NotFoundError("Job Position not found");
  return { id };
};
