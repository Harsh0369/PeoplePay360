import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { createWorkingScheduleService } from "../../services/working-schedule.service";

export const createWorkingScheduleController = catchAsync(async (req: AuthRequest, res: Response) => {
  const schedule = await createWorkingScheduleService(req.body);
  return ResponseUtil.success(res, "Working schedule created", schedule, 201);
});
