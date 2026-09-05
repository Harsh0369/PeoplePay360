import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { getProfileService } from "../../services/employee.service";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";

export const getProfileController = catchAsync(async (req: AuthRequest, res: Response) => {
  const profile = await getProfileService(req.userId!);
  return ResponseUtil.success(res, "Employee profile retrieved", profile);
});
