import { Response, Request } from "express";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { createSalaryRuleService } from "../../services/salary-rule.service";

export const createSalaryRuleController = catchAsync(async (req: Request, res: Response) => {
  const rule = await createSalaryRuleService(req.body);
  return ResponseUtil.success(res, "Salary Rule created", rule, 201);
});
