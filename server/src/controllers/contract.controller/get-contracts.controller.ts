import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { getContractsService } from "../../services/contract.service";
import { getPaginationParams } from "../../utils/pagination.util";

export const getContractsController = catchAsync(async (req: AuthRequest, res: Response) => {
  const pagination = getPaginationParams(req);
  const filters = {
    employeeId: req.query.employeeId as string | undefined,
    search: (req.query.search as string) || "",
    status: req.query.status as string | undefined,
    departmentId: req.query.departmentId as string | undefined,
    jobPositionId: req.query.jobPositionId as string | undefined,
  };
  const { data, offsetPagination } = await getContractsService(pagination, filters);

  return ResponseUtil.paginatedOffset(res, "Contracts retrieved", data, offsetPagination);
});
