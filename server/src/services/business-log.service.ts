import { BusinessLog } from "../models/business-log.model";

interface CreateLogParams {
  actorId: string;
  affectedEmployeeId?: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "OVERRIDE" | "APPROVE" | "REJECT";
  entity: "ATTENDANCE" | "EMPLOYEE" | "LEAVE" | "CONTRACT" | "PAYROLL";
  content: string;
  metadata?: any;
}

export const createBusinessLog = (params: CreateLogParams) => {
  setImmediate(async () => {
    try {
      await BusinessLog.create(params);
    } catch (error) {
      // We log to console but typically don't throw, as we don't want an audit log 
      // failure to necessarily crash the main business operation, unless strict compliance is required.
      console.error("[BusinessLogService] Failed to create audit log:", error);
    }
  });
};

export const getBusinessLogsService = async (
  pagination: import("../utils/pagination.util").PaginationParams,
  filters?: {
    entity?: string;
    action?: string;
    affectedEmployeeId?: string;
    actorId?: string;
  }
) => {
  const query: any = {};
  const { page, limit, skip } = pagination;

  if (filters?.entity) query.entity = filters.entity;
  if (filters?.action) query.action = filters.action;
  if (filters?.affectedEmployeeId) query.affectedEmployeeId = filters.affectedEmployeeId;
  if (filters?.actorId) query.actorId = filters.actorId;

  const [data, totalItems] = await Promise.all([
    BusinessLog.find(query)
      .populate("actorId", "name email")
      .populate("affectedEmployeeId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    BusinessLog.countDocuments(query)
  ]);

  return {
    data,
    offsetPagination: import("../utils/pagination.util").then(m => m.buildOffsetPagination(totalItems, page, limit)),
  };
};
