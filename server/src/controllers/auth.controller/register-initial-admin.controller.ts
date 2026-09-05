import { Request, Response } from "express";
import { registerInitialAdminService } from "../../services/auth.service";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";

export const registerInitialAdminController = catchAsync(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return ResponseUtil.error(res, "Email, password, and name are required", 400);
  }

  const result = await registerInitialAdminService(email, password, name);
  return ResponseUtil.success(res, "Initial admin created successfully", result, 201);
});
