import { Request, Response } from "express";
import { updateRoleService } from "../../services/role.service";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";

export const updateRoleController = catchAsync(async (req: Request, res: Response) => {
  const role = await updateRoleService(req.params.id, req.body);
  return ResponseUtil.success(res, "Role updated successfully", role);
});
