import { Attendance } from "../../models/attendance.model";
import { Employee } from "../../models/employee.model";
import { ConflictError, NotFoundError } from "../../errors/index";

export const clockInService = async (employeeId: string, lat?: number, lng?: number, address?: string) => {
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    throw new NotFoundError("Employee not found");
  }

  // Get current UTC date normalized to midnight
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const date = new Date(dateStr); // Midnight UTC

  const existingAttendance = await Attendance.findOne({ employeeId, date });
  if (existingAttendance) {
    throw new ConflictError("Already clocked in today");
  }

  const attendance = await Attendance.create({
    employeeId,
    date,
    checkIn: {
      time: now,
      location: (lat && lng) ? { lat, lng, address } : undefined
    }
  });

  return attendance;
};
