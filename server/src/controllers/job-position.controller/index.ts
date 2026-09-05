import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { createJobPositionService, getJobPositionsService, assignEmployeeJobPositionService } from "../../services/job-position.service";

export const createJobPositionController = catchAsync(async (req: AuthRequest, res: Response) => {
  const jobPos = await createJobPositionService(req.body);
  return ResponseUtil.success(res, "Job Position created", jobPos, 201);
});

export const getJobPositionsController = catchAsync(async (req: AuthRequest, res: Response) => {
  const positions = await getJobPositionsService();
  return ResponseUtil.success(res, "Job Positions retrieved", positions);
});

export const assignEmployeeJobPositionController = catchAsync(async (req: AuthRequest, res: Response) => {
  const employee = await assignEmployeeJobPositionService(req.params.employeeId, req.body.jobPositionId, req.userId!);
  return ResponseUtil.success(res, "Employee assigned to job position", employee);
});
