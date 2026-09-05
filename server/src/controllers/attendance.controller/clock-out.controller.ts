import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { clockOutService } from "../../services/attendance.service";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { getEmployeeId } from "./clock-in.controller"; // Reusing helper

export const clockOutController = catchAsync(async (req: AuthRequest, res: Response) => {
  const employeeId = await getEmployeeId(req);
  const { lat, lng, address } = req.body;
  const attendance = await clockOutService(employeeId, lat, lng, address);
  return ResponseUtil.success(res, "Clocked out successfully", attendance);
});
