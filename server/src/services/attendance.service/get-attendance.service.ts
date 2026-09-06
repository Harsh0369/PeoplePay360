import { Attendance } from "../../models";
import { PaginationParams, buildOffsetPagination } from "../../utils/pagination.util";
import { smartCount } from "../../utils/db.util";

export const getAttendanceService = async (
  pagination: PaginationParams,
  filters?: {
    employeeId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    sessionState?: string;
  }
) => {
  const query: any = {};
  const { page, limit, skip } = pagination;

  if (filters?.employeeId) query.employeeId = filters.employeeId;
  if (filters?.status) query.status = filters.status;
  if (filters?.sessionState) query.sessionState = filters.sessionState;

  if (filters?.startDate || filters?.endDate) {
    query.date = {};
    if (filters.startDate) query.date.$gte = new Date(filters.startDate);
    if (filters.endDate) query.date.$lte = new Date(filters.endDate);
  }

  const [data, totalItems] = await Promise.all([
    Attendance.find(query)
      .populate("employeeId", "name workEmail")
      .sort({ date: -1, "checkIn.time": -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    smartCount(Attendance, query)
  ]);

  return {
    data,
    offsetPagination: buildOffsetPagination(totalItems, page, limit),
  };
};
