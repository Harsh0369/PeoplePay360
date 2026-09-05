import { Response, Request } from "express";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { createSalaryStructureService } from "../../services/salary-structure.service";

export const createSalaryStructureController = catchAsync(async (req: Request, res: Response) => {
  const structure = await createSalaryStructureService(req.body);
  return ResponseUtil.success(res, "Salary Structure created", structure, 201);
});
