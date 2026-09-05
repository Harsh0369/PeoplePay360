import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { createJobPositionService } from "../../services/job-position.service";

export const createJobPositionController = catchAsync(async (req: AuthRequest, res: Response) => {
  const jobPos = await createJobPositionService(req.body);
  return ResponseUtil.success(res, "Job Position created", jobPos, 201);
});
