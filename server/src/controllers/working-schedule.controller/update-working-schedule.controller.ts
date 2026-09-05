import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { updateWorkingScheduleService } from "../../services/working-schedule.service";

export const updateWorkingScheduleController = catchAsync(async (req: AuthRequest, res: Response) => {
  const schedule = await updateWorkingScheduleService(req.params.id, req.body);
  return ResponseUtil.success(res, "Working schedule updated", schedule);
});
