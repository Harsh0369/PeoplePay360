import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { getPayrunsService } from "../../services/payrun.service";

export const getPayrunsController = catchAsync(async (req: AuthRequest, res: Response) => {
  const filters = {
    status: req.query.status as string | undefined,
    periodStart: req.query.periodStart as string | undefined,
    periodEnd: req.query.periodEnd as string | undefined,
  };
  const payruns = await getPayrunsService(filters);
  return ResponseUtil.success(res, "Payruns retrieved", payruns);
});
