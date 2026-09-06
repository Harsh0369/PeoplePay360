import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { updateJobPositionService, deleteJobPositionService } from "../../services/job-position.service/update-delete-job-position.service";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";

export const updateJobPositionController = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await updateJobPositionService(req.params.id, req.body);
  return ResponseUtil.success(res, "Job Position updated successfully", result);
});

export const deleteJobPositionController = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await deleteJobPositionService(req.params.id);
  return ResponseUtil.success(res, "Job Position deleted successfully", result);
});
