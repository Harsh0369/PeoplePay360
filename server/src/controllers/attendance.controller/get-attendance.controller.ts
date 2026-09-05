import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { getAttendanceService } from "../../services/attendance.service";
import { getPaginationParams } from "../../utils/pagination.util";

export const getAttendanceController = catchAsync(async (req: AuthRequest, res: Response) => {
  const filters = {
    employeeId: req.query.employeeId as string | undefined,
    startDate: req.query.startDate as string | undefined,
    endDate: req.query.endDate as string | undefined,
    status: req.query.status as string | undefined,
    sessionState: req.query.sessionState as string | undefined,
  };
  const pagination = getPaginationParams(req);
  const { data, offsetPagination } = await getAttendanceService(pagination, filters);
  
  return ResponseUtil.paginatedOffset(res, "Attendance records retrieved", data, offsetPagination);
});
