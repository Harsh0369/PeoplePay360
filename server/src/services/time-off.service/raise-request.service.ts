import { Types } from "mongoose";
import { TimeOffType, TimeOffAllocation, TimeOffRequest } from "../../models";
import { ConflictError, NotFoundError } from "../../errors";

interface RaiseRequestParams {
  employeeId: string;
  timeOffTypeId: string;
  startDate: Date;
  endDate: Date;
  requestedDays: number;
}

export const raiseTimeOffRequestService = async (params: RaiseRequestParams) => {
  const { employeeId, timeOffTypeId, startDate, endDate, requestedDays } = params;

  if (startDate > endDate) {
    throw new ConflictError("Start date cannot be after end date");
  }

  // 1. Fetch TimeOffType
  const type = await TimeOffType.findById(timeOffTypeId);
  if (!type) {
    throw new NotFoundError("Time off type not found");
  }
  if (!type.isActive) {
    throw new ConflictError("This time off type is currently inactive");
  }

  // 2. Check for overlapping requests
  const overlappingRequest = await TimeOffRequest.findOne({
    employeeId,
    status: { $in: ["PENDING", "APPROVED"] },
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
    ]
  });

  if (overlappingRequest) {
    throw new ConflictError("You already have a pending or approved time off request during this period");
  }

  // 3. Balance check (if required)
  if (type.requiresAllocation) {
    const year = startDate.getFullYear();
    const allocation = await TimeOffAllocation.findOne({
      employeeId,
      timeOffTypeId,
      validityYear: year,
    });

    if (!allocation) {
      throw new ConflictError(`You do not have any allocation for ${type.name} in ${year}`);
    }

    const availableDays = allocation.grantedDays - allocation.usedDays;
    if (requestedDays > availableDays) {
      throw new ConflictError(
        `Insufficient balance. You requested ${requestedDays} days but only have ${availableDays} days remaining.`
      );
    }
  }

  // 4. Create the request
  const request = await TimeOffRequest.create({
    employeeId,
    timeOffTypeId,
    startDate,
    endDate,
    requestedDays,
    status: "PENDING",
  });

  return request;
};
