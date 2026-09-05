import { WorkingSchedule } from "../../models";
import { ValidationError } from "../../errors";

interface ShiftDto {
  dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  breakDurationMinutes?: number;
}

export interface CreateWorkingScheduleDto {
  name: string;
  workingDays: ShiftDto[];
}

export const createWorkingScheduleService = async (data: CreateWorkingScheduleDto) => {
  const existing = await WorkingSchedule.findOne({ name: data.name });
  if (existing) {
    throw new ValidationError(`Working schedule with name ${data.name} already exists`);
  }

  // Regex validation for HH:mm
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  for (const shift of data.workingDays) {
    if (!timeRegex.test(shift.startTime) || !timeRegex.test(shift.endTime)) {
      throw new ValidationError(`Invalid time format for ${shift.dayOfWeek}. Use HH:mm format.`);
    }
  }

  const schedule = await WorkingSchedule.create(data);
  return schedule;
};
