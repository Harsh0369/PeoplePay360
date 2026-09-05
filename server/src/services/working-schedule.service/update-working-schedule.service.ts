import { WorkingSchedule } from "../../models";
import { NotFoundError, ValidationError } from "../../errors";

export interface UpdateWorkingScheduleDto {
  name?: string;
  workingDays?: {
    dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    breakDurationMinutes?: number;
  }[];
}

export const updateWorkingScheduleService = async (id: string, data: UpdateWorkingScheduleDto) => {
  const schedule = await WorkingSchedule.findById(id);
  if (!schedule) {
    throw new NotFoundError("Working schedule not found");
  }

  if (data.name && data.name !== schedule.name) {
    const existing = await WorkingSchedule.findOne({ name: data.name });
    if (existing) {
      throw new ValidationError(`Working schedule with name ${data.name} already exists`);
    }
    schedule.name = data.name;
  }

  if (data.workingDays) {
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    for (const shift of data.workingDays) {
      if (!timeRegex.test(shift.startTime) || !timeRegex.test(shift.endTime)) {
        throw new ValidationError(`Invalid time format for ${shift.dayOfWeek}. Use HH:mm format.`);
      }
    }
    schedule.workingDays = data.workingDays as any;
  }

  await schedule.save();
  return schedule;
};
