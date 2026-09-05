import { Response, Request } from "express";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { getSalaryRulesService } from "../../services/salary-rule.service";
import { getPaginationParams } from "../../utils/pagination.util";

export const getSalaryRulesController = catchAsync(async (req: Request, res: Response) => {
  const pagination = getPaginationParams(req);
  const { data, offsetPagination } = await getSalaryRulesService(pagination);
  
  return ResponseUtil.paginatedOffset(res, "Salary Rules retrieved", data, offsetPagination);
});
