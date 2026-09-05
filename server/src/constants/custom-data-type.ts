export const roleDataScopeEnum = ["self", "subordinates", "all"] as const;

/**
 * Canonical permission keys for PeoplePay360.
 * Aligned with the 5 PS-defined roles:
 *   - Employee:            self-service only (clock in/out, raise leave, view own payslips)
 *   - HR Manager:          Employee.*, Attendance.*, TimeOff.*, Organization.* — NO payroll
 *   - HR Payroll User:     Payroll.Read only
 *   - HR Payroll Manager:  Payroll.Read + Payroll.Write
 *   - Admin:               isAdmin flag bypasses all checks
 */
export type PermissionKey =
  // Employee Module
  | "Employee.Read"
  | "Employee.Write"
  // Organization (Department, Job Position, Working Schedule)
  | "Organization.Read"
  | "Organization.Write"
  // Contract Module
  | "Contract.Read"
  | "Contract.Write"
  // Attendance Module
  | "Attendance.Read"
  | "Attendance.Write"
  // Time Off / Leave Module
  | "TimeOff.Read"
  | "TimeOff.Write"
  | "TimeOff.Approve"
  // Payroll Module (Salary Config + Payrun + Payslips)
  | "Payroll.Read"
  | "Payroll.Write"
  // Settings (Roles, Permissions)
  | "Settings.Read"
  | "Settings.Write"
  // Audit Logs
  | "Audit.Read";

/**
 * Permission registry grouped by module.
 * Used by the frontend role-creation UI to render toggleable permission switches.
 */
export const PERMISSION_REGISTRY: Record<string, { label: string; keys: PermissionKey[] }> = {
  Employee: {
    label: "Employee Management",
    keys: ["Employee.Read", "Employee.Write"],
  },
  Organization: {
    label: "Organization (Departments, Positions, Schedules)",
    keys: ["Organization.Read", "Organization.Write"],
  },
  Contract: {
    label: "Contracts",
    keys: ["Contract.Read", "Contract.Write"],
  },
  Attendance: {
    label: "Attendance",
    keys: ["Attendance.Read", "Attendance.Write"],
  },
  TimeOff: {
    label: "Time Off / Leave",
    keys: ["TimeOff.Read", "TimeOff.Write", "TimeOff.Approve"],
  },
  Payroll: {
    label: "Payroll (Salary Config, Payruns, Payslips)",
    keys: ["Payroll.Read", "Payroll.Write"],
  },
  Settings: {
    label: "Settings & Roles",
    keys: ["Settings.Read", "Settings.Write"],
  },
  Audit: {
    label: "Audit Logs",
    keys: ["Audit.Read"],
  },
};
