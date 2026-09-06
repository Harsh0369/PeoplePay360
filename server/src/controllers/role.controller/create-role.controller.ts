import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { createRoleService } from "../../services/role.service";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";

export const createRoleController = catchAsync(async (req: AuthRequest, res: Response) => {
  const role = await createRoleService(req.body, !!req.isSuperAdmin);
  return ResponseUtil.success(res, "Role created successfully", role, 201);
});
