import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { getContractsService } from "../../services/contract.service";

export const getContractsController = catchAsync(async (req: AuthRequest, res: Response) => {
  const employeeId = req.query.employeeId as string | undefined;
  const contracts = await getContractsService(employeeId);
  return ResponseUtil.success(res, "Contracts retrieved", contracts);
});
