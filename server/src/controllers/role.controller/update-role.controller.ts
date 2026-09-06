import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { updateRoleService } from "../../services/role.service";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";

export const updateRoleController = catchAsync(async (req: AuthRequest, res: Response) => {
  const role = await updateRoleService(req.params.id, req.body, !!req.isSuperAdmin);
  return ResponseUtil.success(res, "Role updated successfully", role);
});
