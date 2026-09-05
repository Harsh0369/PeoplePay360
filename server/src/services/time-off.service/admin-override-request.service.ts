import { Types } from "mongoose";
import { TimeOffType, TimeOffAllocation, TimeOffRequest } from "../../models";
import { createBusinessLog } from "../business-log.service";
import { ConflictError, NotFoundError } from "../../errors";

interface AdminOverrideRequestParams {
  requestId: string;
  newStatus: "APPROVED" | "REJECTED";
  actorId: string;
  reason: string;
}

export const adminOverrideRequestService = async (params: AdminOverrideRequestParams) => {
  const { requestId, newStatus, actorId, reason } = params;

  if (!reason) {
    throw new ConflictError("Admin override requires a reason");
  }

  const request = await TimeOffRequest.findById(requestId);
  if (!request) {
    throw new NotFoundError("Time off request not found");
  }

  if (request.status === newStatus) {
    throw new ConflictError(`Request is already ${newStatus}`);
  }

  const oldStatus = request.status;
  const type = await TimeOffType.findById(request.timeOffTypeId);
  
  if (type?.requiresAllocation) {
    const year = request.startDate.getFullYear();
    const allocation = await TimeOffAllocation.findOne({
      employeeId: request.employeeId,
      timeOffTypeId: request.timeOffTypeId,
      validityYear: year,
    });

    if (allocation) {
      if (oldStatus === "APPROVED" && newStatus === "REJECTED") {
        // Refund the days
        allocation.usedDays -= request.requestedDays;
        await allocation.save();
      } else if (newStatus === "APPROVED") {
        // Deduct the days
        const availableDays = allocation.grantedDays - allocation.usedDays;
        if (request.requestedDays > availableDays) {
           throw new ConflictError(`Cannot force approve. Insufficient balance (${availableDays} remaining)`);
        }
        allocation.usedDays += request.requestedDays;
        await allocation.save();
      }
    }
  }

  // Update request
  request.status = newStatus;
  request.isEditedByAdmin = true;
  request.reviewerId = new Types.ObjectId(actorId);
  request.reviewReason = `ADMIN OVERRIDE: ${reason}`;
  
  await request.save();

  // Audit Log
  createBusinessLog({
    actorId,
    affectedEmployeeId: request.employeeId.toString(),
    action: "OVERRIDE",
    entity: "LEAVE",
    content: `Admin forcibly changed status from ${oldStatus} to ${newStatus}`,
    metadata: { requestId, oldStatus, newStatus, reason },
  });

  return request;
};
