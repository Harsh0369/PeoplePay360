import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { getTimeOffTypesService } from "../../services/time-off.service";

export const getTimeOffTypesController = catchAsync(async (_req: AuthRequest, res: Response) => {
  const types = await getTimeOffTypesService();
  return ResponseUtil.success(res, "Time off types retrieved", types);
});
