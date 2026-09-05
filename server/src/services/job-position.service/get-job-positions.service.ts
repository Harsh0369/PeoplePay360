import { JobPosition } from "../../models";

export const getJobPositionsService = async () => {
  return JobPosition.find().populate("departmentId");
};
