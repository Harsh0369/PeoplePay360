import { Response, Request } from "express";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { deleteSalaryRuleService } from "../../services/salary-rule.service";

export const deleteSalaryRuleController = catchAsync(async (req: Request, res: Response) => {
  const rule = await deleteSalaryRuleService(req.params.id);
  return ResponseUtil.success(res, "Salary Rule deleted", rule);
});
