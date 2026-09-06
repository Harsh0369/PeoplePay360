import { TimeOffAllocation } from "../../models";
import { PaginationParams, buildOffsetPagination } from "../../utils/pagination.util";
import { smartCount } from "../../utils/db.util";

export const getTimeOffAllocationsService = async (
  pagination: PaginationParams,
  filters?: {
    employeeId?: string;
    timeOffTypeId?: string;
    validityYear?: number;
  }
) => {
  const query: any = {};
  const { page, limit, skip } = pagination;

  if (filters?.employeeId) query.employeeId = filters.employeeId;
  if (filters?.timeOffTypeId) query.timeOffTypeId = filters.timeOffTypeId;
  if (filters?.validityYear) query.validityYear = filters.validityYear;

  const [data, totalItems] = await Promise.all([
    TimeOffAllocation.find(query)
      .populate("employeeId", "name workEmail")
      .populate("timeOffTypeId", "name")
      .sort({ validityYear: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    smartCount(TimeOffAllocation, query)
  ]);

  return {
    data,
    offsetPagination: buildOffsetPagination(totalItems, page, limit),
  };
};
