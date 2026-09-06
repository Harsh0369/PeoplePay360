import { Request, Response } from "express";
import { getJoinRequestsService } from "../../services/user.service";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";

export const getJoinRequestsController = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 15;

  const { items, pagination } = await getJoinRequestsService({ page, limit, skip: (page - 1) * limit });

  return ResponseUtil.success(res, "Join requests retrieved successfully", { items, pagination });
});
