import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { createPayrunService } from "../../services/payrun.service";

export const createPayrunController = catchAsync(async (req: AuthRequest, res: Response) => {
  const payrun = await createPayrunService({
    ...req.body,
    createdBy: req.userId!,
  });
  return ResponseUtil.success(res, "Payrun created in Draft status", payrun, 201);
});
