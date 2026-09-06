import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { updateEmployeeService } from "../../services/employee.service/update-employee.service";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";

export const updateEmployeeController = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await updateEmployeeService(req.params.id, req.body);
  return ResponseUtil.success(res, "Employee updated successfully", result);
});
