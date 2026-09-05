import { Response, Request } from "express";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { getSalaryStructuresService } from "../../services/salary-structure.service";

export const getSalaryStructuresController = catchAsync(async (req: Request, res: Response) => {
  const structures = await getSalaryStructuresService();
  return ResponseUtil.success(res, "Salary Structures retrieved", structures);
});
