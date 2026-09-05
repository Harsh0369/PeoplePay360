import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { createEmployeeService } from "../../services/employee.service";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";

export const createEmployeeController = catchAsync(async (req: AuthRequest, res: Response) => {
  const employee = await createEmployeeService(req.body, req.userId);
  return ResponseUtil.success(res, "Employee created successfully", employee, 201);
});
