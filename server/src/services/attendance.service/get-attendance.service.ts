import { Attendance } from "../../models";

export const getAttendanceService = async (filters?: {
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  sessionState?: string;
}) => {
  const query: any = {};

  if (filters?.employeeId) query.employeeId = filters.employeeId;
  if (filters?.status) query.status = filters.status;
  if (filters?.sessionState) query.sessionState = filters.sessionState;

  if (filters?.startDate || filters?.endDate) {
    query.date = {};
    if (filters.startDate) query.date.$gte = new Date(filters.startDate);
    if (filters.endDate) query.date.$lte = new Date(filters.endDate);
  }

  return Attendance.find(query)
    .populate("employeeId", "name workEmail")
    .sort({ date: -1, "checkIn.time": -1 })
    .limit(500); // Safety cap
};
