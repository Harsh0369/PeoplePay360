import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { updateDepartmentService } from "../../services/department.service/update-department.service";
import { deleteDepartmentService } from "../../services/department.service/delete-department.service";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";

export const updateDepartmentController = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await updateDepartmentService(req.params.id, req.body);
  return ResponseUtil.success(res, "Department updated successfully", result);
});

export const deleteDepartmentController = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await deleteDepartmentService(req.params.id);
  return ResponseUtil.success(res, "Department deleted successfully", result);
});
