import { Request, Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { getEligibleEmployeesService } from "../../services/payrun.service/get-eligible-employees.service";

export const getEligibleEmployeesController = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const employees = await getEligibleEmployeesService(id);
  
  return ResponseUtil.success(res, "Eligible employees fetched successfully", employees);
});
