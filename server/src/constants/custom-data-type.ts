export const roleDataScopeEnum = ["self", "subordinates", "all"] as const;

export type PermissionKey =
  | "Employee.Read"
  | "Employee.Write"
  | "Contract.Read"
  | "Contract.Write"
  | "Attendance.Read"
  | "Attendance.Write"
  | "TimeOff.Read"
  | "TimeOff.Write"
  | "TimeOff.Approve"
  | "Payroll.Read"
  | "Payroll.Write"
  | "Settings.Read"
  | "Settings.Write";
