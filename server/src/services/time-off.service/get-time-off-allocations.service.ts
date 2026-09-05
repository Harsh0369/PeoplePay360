import { TimeOffAllocation } from "../../models";

export const getTimeOffAllocationsService = async (filters?: {
  employeeId?: string;
  timeOffTypeId?: string;
  validityYear?: number;
}) => {
  const query: any = {};

  if (filters?.employeeId) query.employeeId = filters.employeeId;
  if (filters?.timeOffTypeId) query.timeOffTypeId = filters.timeOffTypeId;
  if (filters?.validityYear) query.validityYear = filters.validityYear;

  return TimeOffAllocation.find(query)
    .populate("employeeId", "name workEmail")
    .populate("timeOffTypeId", "name")
    .sort({ validityYear: -1 });
};
