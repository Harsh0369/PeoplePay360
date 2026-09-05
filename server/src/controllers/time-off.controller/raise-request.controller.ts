import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { raiseTimeOffRequestService } from "../../services/time-off.service";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { ValidationError } from "../../errors";
import { User } from "../../models";

export const raiseTimeOffRequestController = catchAsync(async (req: AuthRequest, res: Response) => {
  const { timeOffTypeId, startDate, endDate, requestedDays } = req.body;
  
  if (!timeOffTypeId || !startDate || !endDate || !requestedDays) {
      throw new ValidationError("Missing required fields: timeOffTypeId, startDate, endDate, requestedDays");
  }

  // The employee raising the request is the current logged in user
  const user = await User.findById(req.userId).select("employeeId").lean();
  if (!user || !user.employeeId) {
      throw new ValidationError("You must be linked to an employee profile to request time off");
  }

  const request = await raiseTimeOffRequestService({
    employeeId: user.employeeId.toString(),
    timeOffTypeId,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    requestedDays: Number(requestedDays),
  });

  return ResponseUtil.success(res, "Time off request raised successfully", request, 201);
});
