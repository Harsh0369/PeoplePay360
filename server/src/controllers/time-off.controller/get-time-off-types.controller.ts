import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { getTimeOffTypesService } from "../../services/time-off.service";
import { getPaginationParams } from "../../utils/pagination.util";

export const getTimeOffTypesController = catchAsync(async (req: AuthRequest, res: Response) => {
  const pagination = getPaginationParams(req);
  const { data, offsetPagination } = await getTimeOffTypesService(pagination);
  
  return ResponseUtil.paginatedOffset(res, "Time off types retrieved", data, offsetPagination);
});
