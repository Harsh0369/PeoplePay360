import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { getApplicableContractService } from "../../services/contract.service";

export const getApplicableContractController = catchAsync(async (req: AuthRequest, res: Response) => {
  const { employeeId } = req.params;
  const periodStart = req.query.periodStart as string;
  const periodEnd = req.query.periodEnd as string;

  if (!periodStart || !periodEnd) {
    return ResponseUtil.error(res, "periodStart and periodEnd query parameters are required", 400);
  }

  const contract = await getApplicableContractService(employeeId, periodStart, periodEnd);
  return ResponseUtil.success(res, "Applicable contract retrieved", contract);
});
