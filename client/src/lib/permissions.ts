import { ActiveTab } from '../types';

/**
 * Single source of truth for frontend RBAC. These mirror exactly what the
 * backend enforces (see server/src/routes/*.routes.ts), so the UI only ever
 * shows what the current role can actually do — nav, pages AND action buttons.
 *
 * `can(...perms)` from useAuth returns true if the user is admin OR holds any
 * of the listed permission strings.
 */

// Read permission(s) required to SEE a tab. null = any authenticated user.
export const TAB_PERMS: Record<ActiveTab, string[] | null> = {
  MY_PROFILE: null,
  EMPLOYEES: ['admin', 'Employee.Read'],
  CONTRACTS: ['admin', 'Contract.Read'],
  JOB_POSITIONS: ['admin', 'Organization.Read'],
  ATTENDANCE: ['admin', 'Attendance.Read'],
  TIMEOFF: ['admin', 'TimeOff.Read'],
  PAYROLL: ['admin', 'Payroll.Read', 'Payroll.Write'],
  CONFIG: ['admin', 'payroll.manage'],
  ORG: ['admin', 'Organization.Read'],
  SETTINGS: ['admin', 'Settings.Read'],
};

// Write / action permission sets (mirror requireAnyPermission on the backend).
export const PERM = {
  employeeWrite: ['admin'], // backend: authMiddleware only, but create needs a user account -> admin-only in practice
  contractWrite: ['admin', 'org.manage', 'Contract.Write'],
  orgWrite: ['admin', 'org.manage', 'Organization.Write'],
  jobPositionWrite: ['admin', 'org.manage', 'Organization.Write'],
  payrollWrite: ['admin', 'Payroll.Write'],
  configWrite: ['admin', 'payroll.manage'],
  attendanceWrite: ['admin', 'Attendance.Write'],
  timeOffWrite: ['admin', 'TimeOff.Write'],
  timeOffApprove: ['admin', 'TimeOff.Approve'],
  settingsWrite: ['admin', 'Settings.Write'],
} as const;
