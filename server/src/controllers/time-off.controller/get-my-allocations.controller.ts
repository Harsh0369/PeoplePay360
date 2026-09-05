import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { getTimeOffAllocationsService } from "../../services/time-off.service";
import { getPaginationParams } from "../../utils/pagination.util";
import { User } from "../../models/user.model";
import { NotFoundError } from "../../errors";

export const getMyAllocationsController = catchAsync(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId).lean();
  if (!user || !user.employeeId) {
    throw new NotFoundError("User is not linked to an employee profile");
  }

  const filters = {
    employeeId: user.employeeId.toString(),
    timeOffTypeId: req.query.timeOffTypeId as string | undefined,
    validityYear: req.query.validityYear ? Number(req.query.validityYear) : undefined,
  };
  
  const pagination = getPaginationParams(req);
  const { data, offsetPagination } = await getTimeOffAllocationsService(pagination, filters);
  
  return ResponseUtil.paginatedOffset(res, "My time off allocations retrieved", data, offsetPagination);
});
