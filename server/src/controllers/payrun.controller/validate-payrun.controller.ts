import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { validatePayrunService } from "../../services/payrun.service";

export const validatePayrunController = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await validatePayrunService(req.params.id);
  return ResponseUtil.success(res, "Payrun validated", result);
});
