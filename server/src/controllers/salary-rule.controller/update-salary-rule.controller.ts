import { Response, Request } from "express";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { updateSalaryRuleService } from "../../services/salary-rule.service";

export const updateSalaryRuleController = catchAsync(async (req: Request, res: Response) => {
  const rule = await updateSalaryRuleService(req.params.id, req.body);
  return ResponseUtil.success(res, "Salary Rule updated", rule);
});
