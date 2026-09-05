import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { PERMISSION_REGISTRY } from "../../constants/custom-data-type";

/**
 * Returns the permission registry so the frontend role-creation UI
 * knows exactly which permission keys exist, grouped by module.
 */
export const getPermissionRegistryController = catchAsync(async (_req: AuthRequest, res: Response) => {
  return ResponseUtil.success(res, "Permission registry retrieved", PERMISSION_REGISTRY);
});
