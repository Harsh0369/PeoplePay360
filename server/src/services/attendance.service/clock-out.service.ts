import { Attendance } from "../../models/attendance.model";
import { NotFoundError, ConflictError } from "../../errors/index";

export const clockOutService = async (employeeId: string, lat?: number, lng?: number, address?: string) => {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const date = new Date(dateStr);

  const attendance = await Attendance.findOne({ employeeId, date });
  if (!attendance) {
    throw new NotFoundError("No active check-in found for today");
  }

  if (attendance.checkOut?.time) {
    throw new ConflictError("Already clocked out today");
  }

  attendance.checkOut = {
    time: now,
    location: (lat && lng) ? { lat, lng, address } : undefined
  };

  // Calculate worked hours (difference between checkOut and checkIn in hours)
  const diffMs = now.getTime() - attendance.checkIn.time.getTime();
  const workedHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
  
  attendance.workedHours = workedHours;

  await attendance.save();
  return attendance;
};
