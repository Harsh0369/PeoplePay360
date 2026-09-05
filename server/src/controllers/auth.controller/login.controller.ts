import { Request, Response } from "express";
import { loginService } from "../../services/auth.service";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";

export const loginController = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return ResponseUtil.error(res, "Email and password are required", 400);
  }

  const result = await loginService(email, password);
  return ResponseUtil.success(res, "Login successful", result);
});
