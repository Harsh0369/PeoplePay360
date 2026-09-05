import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { createTimeOffAllocationService } from "../../services/time-off.service";

export const createTimeOffAllocationController = catchAsync(async (req: AuthRequest, res: Response) => {
  const allocation = await createTimeOffAllocationService(req.body);
  return ResponseUtil.success(res, "Time off allocation created", allocation, 201);
});
