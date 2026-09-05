import { Types } from "mongoose";
import { TimeOffType, TimeOffAllocation, TimeOffRequest } from "../../models";
import { ConflictError, NotFoundError } from "../../errors";

interface ReviewRequestParams {
  requestId: string;
  status: "APPROVED" | "REJECTED";
  reviewerId: string;
  reviewReason?: string;
}

export const reviewTimeOffRequestService = async (params: ReviewRequestParams) => {
  const { requestId, status, reviewerId, reviewReason } = params;

  if (status === "REJECTED" && !reviewReason) {
    throw new ConflictError("A reason is required when rejecting a request");
  }

  const request = await TimeOffRequest.findById(requestId);
  if (!request) {
    throw new NotFoundError("Time off request not found");
  }

  if (request.status !== "PENDING") {
    throw new ConflictError(`Cannot review a request that is already ${request.status}`);
  }

  // If approving, handle balance logic
  if (status === "APPROVED") {
    const type = await TimeOffType.findById(request.timeOffTypeId);
    
    if (type?.requiresAllocation) {
      const year = request.startDate.getFullYear();
      const allocation = await TimeOffAllocation.findOne({
        employeeId: request.employeeId,
        timeOffTypeId: request.timeOffTypeId,
        validityYear: year,
      });

      if (!allocation) {
        throw new ConflictError("Allocation not found for this employee and type");
      }

      const availableDays = allocation.grantedDays - allocation.usedDays;
      if (request.requestedDays > availableDays) {
        throw new ConflictError(
          `Cannot approve. Employee only has ${availableDays} days remaining.`
        );
      }

      // Deduct from allocation
      allocation.usedDays += request.requestedDays;
      await allocation.save();
    }
  }

  // Update request
  request.status = status;
  request.reviewerId = new Types.ObjectId(reviewerId);
  request.reviewReason = reviewReason;
  
  await request.save();

  return request;
};
