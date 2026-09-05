import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { getWorkingSchedulesService } from "../../services/working-schedule.service";

export const getWorkingSchedulesController = catchAsync(async (req: AuthRequest, res: Response) => {
  const schedules = await getWorkingSchedulesService();
  return ResponseUtil.success(res, "Working schedules retrieved", schedules);
});
