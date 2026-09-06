import { Response } from "express";
import { registerUserService } from "../../services/auth.service/register-user.service";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { z } from "zod";
import { ValidationError } from "../../errors/index";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

export const registerUserController = catchAsync(async (req, res: Response) => {
  const parseResult = registerSchema.safeParse(req.body);
  
  if (!parseResult.success) {
    throw new ValidationError("Invalid registration details");
  }

  const result = await registerUserService(
    parseResult.data.email,
    parseResult.data.password,
    parseResult.data.name
  );

  return ResponseUtil.success(res, "Registration successful. Please wait for an admin to approve your request.", result, 201);
});
