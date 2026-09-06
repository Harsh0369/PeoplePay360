import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { updateUserRoleService } from "../../services/user.service/update-user-role.service";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";

export const updateUserRoleController = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.params.id;
  const { roleId, customPermissions } = req.body;

  if (!roleId && customPermissions === undefined) {
    return ResponseUtil.error(res, "Either roleId or customPermissions is required", 400);
  }

  const result = await updateUserRoleService(userId, roleId, customPermissions, !!req.isSuperAdmin);
  return ResponseUtil.success(res, "User updated successfully", result);
});
