import { Request, Response } from "express";
import { adminUpdateAttendanceService } from "../../services/attendance.service";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";

export const adminUpdateAttendanceController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const attendance = await adminUpdateAttendanceService(id, req.body);
  return ResponseUtil.success(res, "Attendance record updated manually", attendance);
});
