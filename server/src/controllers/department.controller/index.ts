import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { createDepartmentService, getDepartmentsService, assignEmployeeDepartmentService } from "../../services/department.service";

export const createDepartmentController = catchAsync(async (req: AuthRequest, res: Response) => {
  const dept = await createDepartmentService(req.body);
  return ResponseUtil.success(res, "Department created", dept, 201);
});

export const getDepartmentsController = catchAsync(async (req: AuthRequest, res: Response) => {
  const depts = await getDepartmentsService();
  return ResponseUtil.success(res, "Departments retrieved", depts);
});

export const assignEmployeeDepartmentController = catchAsync(async (req: AuthRequest, res: Response) => {
  const employee = await assignEmployeeDepartmentService(req.params.employeeId, req.body.departmentId, req.userId!);
  return ResponseUtil.success(res, "Employee assigned to department", employee);
});
