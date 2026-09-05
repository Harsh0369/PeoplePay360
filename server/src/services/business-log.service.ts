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
