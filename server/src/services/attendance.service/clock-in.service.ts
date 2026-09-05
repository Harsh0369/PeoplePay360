import { Attendance } from "../../models/attendance.model";
import { Employee } from "../../models/employee.model";
import { Contract } from "../../models/contract.model";
import { WorkingSchedule } from "../../models/working-schedule.model";
import { ConflictError, NotFoundError, ValidationError } from "../../errors/index";

export const clockInService = async (employeeId: string, lat?: number, lng?: number, address?: string) => {
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    throw new NotFoundError("Employee not found");
  }

  // Get current UTC date normalized to midnight
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const date = new Date(dateStr); // Midnight UTC

  // Note: We no longer strictly block a second clock-in per day (e.g. for split shifts/breaks).
  // The database will enforce that an employee can have at most ONE "OPEN" session at a time
  // via a partial unique index on { employeeId: 1, sessionState: "OPEN" }.

  // Find active contract to get working schedule
  const activeContract = await Contract.findOne({
    employeeId,
    status: "Running",
    startDate: { $lte: now },
    $or: [{ endDate: { $gte: now } }, { endDate: null }]
  });

  if (!activeContract) {
    throw new ValidationError("Cannot clock in: No active contract found for today.");
  }

  // Get Working Schedule
  const schedule = await WorkingSchedule.findById(activeContract.workingScheduleId);
  if (!schedule) {
    throw new ValidationError("Cannot clock in: Working schedule not found.");
  }

  // Find today's shift (0 = Sunday, 1 = Monday... in JS)
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayName = daysOfWeek[now.getDay()];
  
  const todayShift = schedule.workingDays.find(d => d.dayOfWeek === currentDayName);

  let status = "Present";

  if (!todayShift) {
    // Clocking in on a non-working day (e.g. weekend overtime)
    status = "Present"; // Or maybe "Overtime" or "Rest Day Work" depending on business rules
  } else {
    // Check if late. Grace period: 15 mins.
    const [startHour, startMin] = todayShift.startTime.split(":").map(Number);
    
    // Create a Date object for the shift start time today
    const shiftStartTime = new Date(now);
    shiftStartTime.setHours(startHour, startMin, 0, 0);

    const diffMinutes = (now.getTime() - shiftStartTime.getTime()) / (1000 * 60);
    
    if (diffMinutes > 15) {
      status = "Late";
    }
  }

  try {
    const attendance = await Attendance.create({
      employeeId,
      date,
      status,
      sessionState: "OPEN", // Default is OPEN, but we are explicit here
      checkIn: {
        time: now,
        location: (lat && lng) ? { lat, lng, address } : undefined
      }
    });

    return attendance;
  } catch (error: any) {
    if (error.code === 11000) {
      throw new ConflictError("You already have an open attendance session. Please clock out first.");
    }
    throw error;
  }
};
