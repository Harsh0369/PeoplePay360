import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { deleteEmployeeService } from "../../services/employee.service";

export const deleteEmployeeController = catchAsync(async (req: AuthRequest, res: Response) => {
  const employee = await deleteEmployeeService(req.params.id, req.userId!);
  return ResponseUtil.success(res, "Employee deleted", employee, 200);
});
