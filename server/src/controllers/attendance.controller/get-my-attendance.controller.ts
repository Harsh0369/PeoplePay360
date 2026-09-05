import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { getAttendanceService } from "../../services/attendance.service";
import { getPaginationParams } from "../../utils/pagination.util";
import { User } from "../../models/user.model";
import { NotFoundError } from "../../errors";

export const getMyAttendanceController = catchAsync(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId).lean();
  if (!user || !user.employeeId) {
    throw new NotFoundError("User is not linked to an employee profile");
  }

  // Force employeeId filter for self-service
  const filters = {
    employeeId: user.employeeId.toString(),
    startDate: req.query.startDate as string | undefined,
    endDate: req.query.endDate as string | undefined,
    status: req.query.status as string | undefined,
    sessionState: req.query.sessionState as string | undefined,
  };

  const pagination = getPaginationParams(req);
  const { data, offsetPagination } = await getAttendanceService(pagination, filters);
  
  return ResponseUtil.paginatedOffset(res, "My attendance records retrieved", data, offsetPagination);
});
