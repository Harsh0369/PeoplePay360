import { Response, Request } from "express";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { getSalaryStructuresService } from "../../services/salary-structure.service";
import { getPaginationParams } from "../../utils/pagination.util";

export const getSalaryStructuresController = catchAsync(async (req: Request, res: Response) => {
  const pagination = getPaginationParams(req);
  const { data, offsetPagination } = await getSalaryStructuresService(pagination);
  
  return ResponseUtil.paginatedOffset(res, "Salary Structures retrieved", data, offsetPagination);
});
