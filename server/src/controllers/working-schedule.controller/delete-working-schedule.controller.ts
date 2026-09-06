import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { deleteWorkingScheduleService } from "../../services/working-schedule.service/delete-working-schedule.service";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";

export const deleteWorkingScheduleController = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await deleteWorkingScheduleService(req.params.id);
  return ResponseUtil.success(res, "Working schedule deleted successfully", result);
});
