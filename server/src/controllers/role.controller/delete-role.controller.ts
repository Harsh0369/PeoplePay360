import { Request, Response } from "express";
import { deleteRoleService } from "../../services/role.service";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";

export const deleteRoleController = catchAsync(async (req: Request, res: Response) => {
  await deleteRoleService(req.params.id);
  return ResponseUtil.success(res, "Role deleted successfully");
});
