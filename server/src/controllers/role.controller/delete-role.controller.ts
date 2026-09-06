import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { deleteRoleService } from "../../services/role.service";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";

export const deleteRoleController = catchAsync(async (req: AuthRequest, res: Response) => {
  await deleteRoleService(req.params.id, !!req.isSuperAdmin);
  return ResponseUtil.success(res, "Role deleted successfully");
});
