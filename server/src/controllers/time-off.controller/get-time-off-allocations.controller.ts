import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { getTimeOffAllocationsService } from "../../services/time-off.service";

export const getTimeOffAllocationsController = catchAsync(async (req: AuthRequest, res: Response) => {
  const filters = {
    employeeId: req.query.employeeId as string | undefined,
    timeOffTypeId: req.query.timeOffTypeId as string | undefined,
    validityYear: req.query.validityYear ? Number(req.query.validityYear) : undefined,
  };
  const allocations = await getTimeOffAllocationsService(filters);
  return ResponseUtil.success(res, "Time off allocations retrieved", allocations);
});
