import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { createContractService } from "../../services/contract.service";

export const createContractController = catchAsync(async (req: AuthRequest, res: Response) => {
  const contract = await createContractService(req.body, req.userId);
  return ResponseUtil.success(res, "Contract created as Draft", contract, 201);
});
