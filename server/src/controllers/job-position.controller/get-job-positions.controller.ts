import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { getJobPositionsService } from "../../services/job-position.service";

export const getJobPositionsController = catchAsync(async (req: AuthRequest, res: Response) => {
  const positions = await getJobPositionsService();
  return ResponseUtil.success(res, "Job Positions retrieved", positions);
});
