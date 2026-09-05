import { Response, Request } from "express";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { getSalaryRulesService } from "../../services/salary-rule.service";

export const getSalaryRulesController = catchAsync(async (req: Request, res: Response) => {
  const rules = await getSalaryRulesService();
  return ResponseUtil.success(res, "Salary Rules retrieved", rules);
});
