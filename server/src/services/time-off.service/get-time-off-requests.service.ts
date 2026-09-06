import { TimeOffRequest } from "../../models";
import { PaginationParams, buildOffsetPagination } from "../../utils/pagination.util";
import { smartCount } from "../../utils/db.util";

export const getTimeOffRequestsService = async (
  pagination: PaginationParams,
  filters?: {
    employeeId?: string;
    status?: string;
    timeOffTypeId?: string;
  }
) => {
  const query: any = {};
  const { page, limit, skip } = pagination;

  if (filters?.employeeId) query.employeeId = filters.employeeId;
  if (filters?.status) query.status = filters.status;
  if (filters?.timeOffTypeId) query.timeOffTypeId = filters.timeOffTypeId;

  const [data, totalItems] = await Promise.all([
    TimeOffRequest.find(query)
      .populate("employeeId", "name workEmail")
      .populate("timeOffTypeId", "name")
      .populate("reviewerId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    smartCount(TimeOffRequest, query)
  ]);

  return {
    data,
    offsetPagination: buildOffsetPagination(totalItems, page, limit),
  };
};
