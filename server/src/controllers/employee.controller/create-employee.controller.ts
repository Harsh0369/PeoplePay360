import { Request, Response } from "express";
import { createEmployeeService } from "../../services/employee.service";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";

export const createEmployeeController = catchAsync(async (req: Request, res: Response) => {
  const employee = await createEmployeeService(req.body);
  return ResponseUtil.success(res, "Employee created successfully", employee, 201);
});
