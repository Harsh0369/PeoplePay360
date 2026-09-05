import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { getDepartmentsService } from "../../services/department.service";

export const getDepartmentsController = catchAsync(async (req: AuthRequest, res: Response) => {
  const depts = await getDepartmentsService();
  return ResponseUtil.success(res, "Departments retrieved", depts);
});
