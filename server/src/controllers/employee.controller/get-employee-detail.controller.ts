import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { getEmployeeDetailService } from "../../services/employee.service";

export const getEmployeeDetailController = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await getEmployeeDetailService(req.params.id);
  return ResponseUtil.success(res, "Employee detail retrieved", result);
});
