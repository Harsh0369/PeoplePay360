import { Request, Response } from "express";
import { getAllEmployeesService } from "../../services/employee.service";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";

export const getAllEmployeesController = catchAsync(async (req: Request, res: Response) => {
  const employees = await getAllEmployeesService();
  return ResponseUtil.success(res, "Employees retrieved successfully", employees);
});
