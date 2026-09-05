import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { adminUpdateAttendanceService } from "../../services/attendance.service";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";

export const adminUpdateAttendanceController = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const actorId = req.userId;
  
  const attendance = await adminUpdateAttendanceService(id, req.body, actorId);
  return ResponseUtil.success(res, "Attendance record updated manually", attendance);
});
