import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { updateUserRoleService } from "../../services/user.service/update-user-role.service";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";

export const updateUserRoleController = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.params.id;
  const { roleId } = req.body;

  if (!roleId) {
    return ResponseUtil.error(res, "roleId is required", 400);
  }

  const result = await updateUserRoleService(userId, roleId);
  return ResponseUtil.success(res, "User role updated successfully", result);
});
