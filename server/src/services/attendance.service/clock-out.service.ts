import { Attendance } from "../../models/attendance.model";
import { Contract } from "../../models/contract.model";
import { WorkingSchedule } from "../../models/working-schedule.model";
import { AttendanceException } from "../../models/attendance-exception.model";
import { NotFoundError, ConflictError, ValidationError } from "../../errors/index";

export const clockOutService = async (employeeId: string, lat?: number, lng?: number, address?: string) => {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const date = new Date(dateStr);

  // Find the single OPEN session for this employee
  const attendance = await Attendance.findOne({ employeeId, sessionState: "OPEN" });
  if (!attendance) {
    throw new NotFoundError("No open attendance session found");
  }

  if (attendance.checkOut?.time) {
    throw new ConflictError("Already clocked out today");
  }

  // Calculate difference between now and checkIn time
  if (!attendance.checkIn) {
    throw new ValidationError("Invalid attendance record: missing checkIn data.");
  }
  const diffMs = now.getTime() - attendance.checkIn.time.getTime();
  
  // Enforce a minimum session duration of 60 seconds to prevent double-clicks
  if (diffMs < 60000) {
    throw new ValidationError("Please wait at least 1 minute before clocking out.");
  }

  attendance.checkOut = {
    time: now,
    location: (lat && lng) ? { lat, lng, address } : undefined
  };

  // Calculate worked hours
  const workedHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
  
  attendance.workedHours = workedHours;

  // Let's resolve the schedule to see if it was an early checkout
  const activeContract = await Contract.findOne({
    employeeId,
    status: "Running",
    startDate: { $lte: now },
    $or: [{ endDate: { $gte: now } }, { endDate: null }]
  });

  if (activeContract) {
    const schedule = await WorkingSchedule.findById(activeContract.workingScheduleId);
    if (schedule) {
      const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const currentDayName = daysOfWeek[now.getDay()];
      const todayShift = schedule.workingDays.find(d => d.dayOfWeek === currentDayName);

      if (todayShift) {
        const [endHour, endMin] = todayShift.endTime.split(":").map(Number);
        
        const shiftEndTime = new Date(now);
        shiftEndTime.setHours(endHour, endMin, 0, 0);

        // If they clocked out more than 30 mins early, mark as Half-Day
        const leftEarlyMinutes = (shiftEndTime.getTime() - now.getTime()) / (1000 * 60);
        if (leftEarlyMinutes > 30) {
          attendance.status = "Half-Day";
          
          // Generate an AttendanceException for early checkout to alert Payroll/HR
          await AttendanceException.create({
            employeeId,
            date: attendance.date,
            attendanceId: attendance._id,
            type: "EARLY_CHECKOUT",
            status: "PENDING_REVIEW",
            resolutionReason: `Checked out ${Math.round(leftEarlyMinutes)} minutes early.`
          });
        }

        // We could also do Overtime tracking here by adding an `overtimeHours` field
        // to the Attendance model later if needed by Payroll. For now, workedHours > expected is enough.
      }
    }
  }

  attendance.sessionState = "CLOSED";
  await attendance.save();
  return attendance;
};
