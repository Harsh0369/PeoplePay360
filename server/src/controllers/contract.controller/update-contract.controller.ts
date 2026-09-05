import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { updateContractService } from "../../services/contract.service";

export const updateContractController = catchAsync(async (req: AuthRequest, res: Response) => {
  const contract = await updateContractService(req.params.id, req.body);
  return ResponseUtil.success(res, "Contract updated", contract);
});
