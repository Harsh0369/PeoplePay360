import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { getWorkingSchedulesService } from "../../services/working-schedule.service";
import { getPaginationParams } from "../../utils/pagination.util";

export const getWorkingSchedulesController = catchAsync(async (req: AuthRequest, res: Response) => {
  const pagination = getPaginationParams(req);
  const { data, offsetPagination } = await getWorkingSchedulesService(pagination);
  
  return ResponseUtil.paginatedOffset(res, "Working schedules retrieved", data, offsetPagination);
});
