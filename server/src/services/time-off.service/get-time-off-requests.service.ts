import { TimeOffRequest } from "../../models";

export const getTimeOffRequestsService = async (filters?: {
  employeeId?: string;
  status?: string;
  timeOffTypeId?: string;
}) => {
  const query: any = {};

  if (filters?.employeeId) query.employeeId = filters.employeeId;
  if (filters?.status) query.status = filters.status;
  if (filters?.timeOffTypeId) query.timeOffTypeId = filters.timeOffTypeId;

  return TimeOffRequest.find(query)
    .populate("employeeId", "name workEmail")
    .populate("timeOffTypeId", "name")
    .populate("reviewerId", "name")
    .sort({ createdAt: -1 });
};
