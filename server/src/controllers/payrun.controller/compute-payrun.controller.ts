import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { computePayrunService } from "../../services/payrun.service";

export const computePayrunController = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await computePayrunService(req.params.id, req.body.employeeIds);
  return ResponseUtil.success(res, "Payrun computed successfully", result);
});
