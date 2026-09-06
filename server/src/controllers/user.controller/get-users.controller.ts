import { Request, Response } from "express";
import { getUsersService } from "../../services/user.service/get-users.service";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";

export const getUsersController = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 15;
  const { data, offsetPagination } = await getUsersService({ page, limit, skip: (page - 1) * limit });
  return ResponseUtil.paginatedOffset(res, "Users retrieved successfully", data, offsetPagination);
});
