import { JobPosition } from "../../models/job-position.model";
import { NotFoundError } from "../../errors/index";

export const updateJobPositionService = async (id: string, data: any) => {
  const jobPos = await JobPosition.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!jobPos) throw new NotFoundError("Job Position not found");
  return jobPos;
};

export const deleteJobPositionService = async (id: string) => {
  const jobPos = await JobPosition.findByIdAndDelete(id);
  if (!jobPos) throw new NotFoundError("Job Position not found");
  return { id };
};
