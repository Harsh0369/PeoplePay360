import { Response, Request } from "express";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { deleteSalaryStructureService } from "../../services/salary-structure.service";

export const deleteSalaryStructureController = catchAsync(async (req: Request, res: Response) => {
  const structure = await deleteSalaryStructureService(req.params.id);
  return ResponseUtil.success(res, "Salary Structure deleted", structure);
});
