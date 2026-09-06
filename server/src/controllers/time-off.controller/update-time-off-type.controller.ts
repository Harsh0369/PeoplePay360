import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { updateTimeOffTypeService } from "../../services/time-off.service";

export const updateTimeOffTypeController = catchAsync(async (req: AuthRequest, res: Response) => {
  const type = await updateTimeOffTypeService(req.params.id, req.body);
  return ResponseUtil.success(res, "Time off type updated", type, 200);
});
