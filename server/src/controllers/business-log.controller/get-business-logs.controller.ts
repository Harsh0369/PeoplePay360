import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { getBusinessLogsService } from "../../services/business-log.service";
import { getPaginationParams } from "../../utils/pagination.util";

export const getBusinessLogsController = catchAsync(async (req: AuthRequest, res: Response) => {
  const filters = {
    entity: req.query.entity as string | undefined,
    action: req.query.action as string | undefined,
    affectedEmployeeId: req.query.affectedEmployeeId as string | undefined,
    actorId: req.query.actorId as string | undefined,
  };
  const pagination = getPaginationParams(req);
  
  // Wait for the dynamic import in the service to resolve
  const result = await getBusinessLogsService(pagination, filters);
  const offsetPagination = await result.offsetPagination;
  
  return ResponseUtil.paginatedOffset(res, "Business logs retrieved", result.data, offsetPagination);
});
