import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { assignEmployeeDepartmentService } from "../../services/department.service";

export const assignEmployeeDepartmentController = catchAsync(async (req: AuthRequest, res: Response) => {
  const employee = await assignEmployeeDepartmentService(req.params.employeeId, req.body.departmentId, req.userId!);
  return ResponseUtil.success(res, "Employee assigned to department", employee);
});
