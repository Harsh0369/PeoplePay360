import { Response, Request } from "express";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { updateSalaryStructureService } from "../../services/salary-structure.service";

export const updateSalaryStructureController = catchAsync(async (req: Request, res: Response) => {
  const structure = await updateSalaryStructureService(req.params.id, req.body);
  return ResponseUtil.success(res, "Salary Structure updated", structure);
});
