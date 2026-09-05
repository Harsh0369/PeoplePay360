import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { sendPayrunService } from "../../services/payrun.service/send-payrun.service";

export const sendPayrunController = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await sendPayrunService(req.params.id);
  
  return ResponseUtil.success(res, "Payslips delivery process completed", result);
});
