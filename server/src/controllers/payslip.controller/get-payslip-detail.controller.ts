import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { getPayslipDetailService } from "../../services/payslip.service";

export const getPayslipDetailController = catchAsync(async (req: AuthRequest, res: Response) => {
  const payslip = await getPayslipDetailService(req.params.id);
  return ResponseUtil.success(res, "Payslip details retrieved", payslip);
});
