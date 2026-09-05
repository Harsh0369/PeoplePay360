import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { getTimeOffRequestsService } from "../../services/time-off.service";
import { getPaginationParams } from "../../utils/pagination.util";

export const getTimeOffRequestsController = catchAsync(async (req: AuthRequest, res: Response) => {
  const filters = {
    employeeId: req.query.employeeId as string | undefined,
    status: req.query.status as string | undefined,
    timeOffTypeId: req.query.timeOffTypeId as string | undefined,
  };
  const pagination = getPaginationParams(req);
  const { data, offsetPagination } = await getTimeOffRequestsService(pagination, filters);
  
  return ResponseUtil.paginatedOffset(res, "Time off requests retrieved", data, offsetPagination);
});
