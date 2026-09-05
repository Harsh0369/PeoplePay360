import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { getPayrunDetailService } from "../../services/payrun.service";

export const getPayrunDetailController = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await getPayrunDetailService(req.params.id);
  return ResponseUtil.success(res, "Payrun details retrieved", result);
});
