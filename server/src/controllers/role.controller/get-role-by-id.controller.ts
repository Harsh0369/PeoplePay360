import { Request, Response } from "express";
import { getRoleByIdService } from "../../services/role.service";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";

export const getRoleByIdController = catchAsync(async (req: Request, res: Response) => {
  const role = await getRoleByIdService(req.params.id);
  return ResponseUtil.success(res, "Role retrieved", role);
});
