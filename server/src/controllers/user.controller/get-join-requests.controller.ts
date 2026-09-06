import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { getJoinRequestsService } from "../../services/user.service";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";

export const getJoinRequestsController = catchAsync(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 15;

  const result = await getJoinRequestsService({ page, limit });
  return ResponseUtil.success(res, "Join requests fetched successfully", result);
});
