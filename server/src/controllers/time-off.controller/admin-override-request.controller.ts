import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { adminOverrideRequestService } from "../../services/time-off.service";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { ValidationError, UnauthorizedError } from "../../errors";

export const adminOverrideRequestController = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { newStatus, reason } = req.body;
  
  if (!newStatus || !["APPROVED", "REJECTED"].includes(newStatus)) {
      throw new ValidationError("Invalid newStatus. Must be APPROVED or REJECTED");
  }

  if (!reason) {
      throw new ValidationError("Reason is required for an admin override");
  }
  
  if (!req.userId) {
      throw new UnauthorizedError("Admin context missing");
  }

  const request = await adminOverrideRequestService({
    requestId: id,
    newStatus,
    actorId: req.userId,
    reason,
  });

  return ResponseUtil.success(res, `Time off request forcibly changed to ${newStatus}`, request);
});
