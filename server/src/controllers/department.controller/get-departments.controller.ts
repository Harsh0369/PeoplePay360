import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { getDepartmentsService } from "../../services/department.service";
import { getPaginationParams } from "../../utils/pagination.util";

export const getDepartmentsController = catchAsync(async (req: AuthRequest, res: Response) => {
  const pagination = getPaginationParams(req);
  const { data, offsetPagination } = await getDepartmentsService(pagination);
  
  return ResponseUtil.paginatedOffset(res, "Departments retrieved", data, offsetPagination);
});
