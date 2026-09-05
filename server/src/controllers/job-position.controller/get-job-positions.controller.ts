import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { getJobPositionsService } from "../../services/job-position.service";
import { getPaginationParams } from "../../utils/pagination.util";

export const getJobPositionsController = catchAsync(async (req: AuthRequest, res: Response) => {
  const pagination = getPaginationParams(req);
  const { data, offsetPagination } = await getJobPositionsService(pagination);
  
  return ResponseUtil.paginatedOffset(res, "Job Positions retrieved", data, offsetPagination);
});
