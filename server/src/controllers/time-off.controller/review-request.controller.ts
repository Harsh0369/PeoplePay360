import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { reviewTimeOffRequestService } from "../../services/time-off.service";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { ValidationError, UnauthorizedError } from "../../errors";

export const reviewTimeOffRequestController = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, reviewReason } = req.body;
  
  if (!status || !["APPROVED", "REJECTED"].includes(status)) {
      throw new ValidationError("Invalid status. Must be APPROVED or REJECTED");
  }
  
  if (!req.userId) {
      throw new UnauthorizedError("Reviewer context missing");
  }

  const request = await reviewTimeOffRequestService({
    requestId: id,
    status,
    reviewerId: req.userId,
    reviewReason,
  });

  return ResponseUtil.success(res, `Time off request ${status.toLowerCase()}`, request);
});
