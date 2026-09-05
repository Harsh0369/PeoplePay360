import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { cancelPayrunService } from "../../services/payrun.service";

export const cancelPayrunController = catchAsync(async (req: AuthRequest, res: Response) => {
  const payrun = await cancelPayrunService(req.params.id, req.userId!);
  return ResponseUtil.success(res, "Payrun cancelled", payrun);
});
