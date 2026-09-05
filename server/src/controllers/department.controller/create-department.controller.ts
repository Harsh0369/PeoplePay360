import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { createDepartmentService } from "../../services/department.service";

export const createDepartmentController = catchAsync(async (req: AuthRequest, res: Response) => {
  const dept = await createDepartmentService(req.body);
  return ResponseUtil.success(res, "Department created", dept, 201);
});
