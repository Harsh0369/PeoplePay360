import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { getPayslipsService } from "../../services/payslip.service";
import { getPaginationParams } from "../../utils/pagination.util";

export const getPayslipsController = catchAsync(async (req: AuthRequest, res: Response) => {
  const filters = {
    employeeId: req.query.employeeId as string | undefined,
    payrunId: req.query.payrunId as string | undefined,
    status: req.query.status as string | undefined,
    periodStart: req.query.periodStart as string | undefined,
    periodEnd: req.query.periodEnd as string | undefined,
  };
  const pagination = getPaginationParams(req);
  const { data, offsetPagination } = await getPayslipsService(pagination, filters);
  
  return ResponseUtil.paginatedOffset(res, "Payslips retrieved", data, offsetPagination);
});
