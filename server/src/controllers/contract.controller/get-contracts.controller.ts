import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { getContractsService } from "../../services/contract.service";
import { getPaginationParams } from "../../utils/pagination.util";

export const getContractsController = catchAsync(async (req: AuthRequest, res: Response) => {
  const employeeId = req.query.employeeId as string | undefined;
  const search = (req.query.search as string) || "";
  const pagination = getPaginationParams(req);
  const { data, offsetPagination } = await getContractsService(pagination, employeeId, search);

  return ResponseUtil.paginatedOffset(res, "Contracts retrieved", data, offsetPagination);
});
