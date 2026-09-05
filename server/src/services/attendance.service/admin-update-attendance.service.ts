import { Attendance } from "../../models/attendance.model";
import { NotFoundError } from "../../errors/index";

export const adminUpdateAttendanceService = async (attendanceId: string, data: any) => {
  const attendance = await Attendance.findById(attendanceId);
  if (!attendance) {
    throw new NotFoundError("Attendance record not found");
  }

  const { checkInTime, checkOutTime, status } = data;

  if (checkInTime) {
    if (!attendance.checkIn) {
      attendance.checkIn = { time: new Date(checkInTime) };
    } else {
      attendance.checkIn.time = new Date(checkInTime);
    }
  }

  if (checkOutTime) {
    if (!attendance.checkOut) {
      attendance.checkOut = { time: new Date(checkOutTime) };
    } else {
      attendance.checkOut.time = new Date(checkOutTime);
    }
  }

  if (status) {
    attendance.status = status;
  }

  // Recalculate worked hours if both are present
  if (attendance.checkIn?.time && attendance.checkOut?.time) {
    const diffMs = attendance.checkOut.time.getTime() - attendance.checkIn.time.getTime();
    attendance.workedHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
  }

  attendance.isEditedByAdmin = true;

  await attendance.save();
  return attendance;
};
