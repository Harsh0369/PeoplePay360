import { Request, Response } from "express";
import { getAllRolesService } from "../../services/role.service";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";

export const getAllRolesController = catchAsync(async (req: Request, res: Response) => {
  const roles = await getAllRolesService();
  return ResponseUtil.success(res, "Roles retrieved successfully", roles);
});
