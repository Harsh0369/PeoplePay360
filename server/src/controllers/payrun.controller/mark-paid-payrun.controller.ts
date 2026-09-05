import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { markPaidPayrunService } from "../../services/payrun.service";

export const markPaidPayrunController = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await markPaidPayrunService(req.params.id, req.userId!);
  return ResponseUtil.success(res, "Payrun marked as Paid", result);
});
