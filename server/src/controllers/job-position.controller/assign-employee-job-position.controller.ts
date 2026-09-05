import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { assignEmployeeJobPositionService } from "../../services/job-position.service";

export const assignEmployeeJobPositionController = catchAsync(async (req: AuthRequest, res: Response) => {
  const employee = await assignEmployeeJobPositionService(req.params.employeeId, req.body.jobPositionId, req.userId!);
  return ResponseUtil.success(res, "Employee assigned to job position", employee);
});
