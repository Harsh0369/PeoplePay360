import { Request, Response } from "express";
import { createRoleService } from "../../services/role.service";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";

export const createRoleController = catchAsync(async (req: Request, res: Response) => {
  const role = await createRoleService(req.body);
  return ResponseUtil.success(res, "Role created successfully", role, 201);
});
