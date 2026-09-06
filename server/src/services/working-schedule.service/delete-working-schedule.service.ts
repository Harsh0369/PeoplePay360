import { WorkingSchedule } from "../../models/working-schedule.model";
import { NotFoundError } from "../../errors/index";

export const deleteWorkingScheduleService = async (id: string) => {
  const schedule = await WorkingSchedule.findByIdAndDelete(id);
  if (!schedule) throw new NotFoundError("Working schedule not found");
  return { id };
};
