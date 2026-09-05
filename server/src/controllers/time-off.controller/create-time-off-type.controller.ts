import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { createTimeOffTypeService } from "../../services/time-off.service";

export const createTimeOffTypeController = catchAsync(async (req: AuthRequest, res: Response) => {
  const type = await createTimeOffTypeService(req.body);
  return ResponseUtil.success(res, "Time off type created", type, 201);
});
