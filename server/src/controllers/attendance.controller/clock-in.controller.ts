import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { clockInService } from "../../services/attendance.service";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { User } from "../../models/user.model";
import { ForbiddenError } from "../../errors/index";

export const getEmployeeId = async (req: AuthRequest) => {
  const user = await User.findById(req.userId);
  if (!user || !user.employeeId) {
    throw new ForbiddenError("User is not linked to an employee profile");
  }
  return user.employeeId.toString();
};

export const clockInController = catchAsync(async (req: AuthRequest, res: Response) => {
  const employeeId = await getEmployeeId(req);
  const { lat, lng, address } = req.body;
  const attendance = await clockInService(employeeId, lat, lng, address);
  return ResponseUtil.success(res, "Clocked in successfully", attendance);
});
