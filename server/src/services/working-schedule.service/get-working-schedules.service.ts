import { WorkingSchedule } from "../../models";

export const getWorkingSchedulesService = async () => {
  return WorkingSchedule.find();
};
