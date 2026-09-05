// Central enums so business rules stay consistent across models, engine, and API.

export const ROLES = {
  EMPLOYEE: 'employee',
  HR_MANAGER: 'hr_manager',
  HR_PAYROLL_USER: 'hr_payroll_user',
  HR_PAYROLL_MANAGER: 'hr_payroll_manager',
  ADMIN: 'admin',
};
export const ROLE_LIST = Object.values(ROLES);

// Role capability ranking used for coarse permission checks (higher = more access).
export const ROLE_RANK = {
  [ROLES.EMPLOYEE]: 0,
  [ROLES.HR_MANAGER]: 1,
  [ROLES.HR_PAYROLL_USER]: 2,
  [ROLES.HR_PAYROLL_MANAGER]: 3,
  [ROLES.ADMIN]: 4,
};

export const EMPLOYEE_TYPES = ['full_time', 'part_time', 'contract', 'intern'];
export const EMPLOYEE_STATUS = ['active', 'inactive'];

export const CONTRACT_STATES = ['draft', 'running', 'expired', 'cancelled'];

export const SCHEDULE_TYPES = ['full_time', 'part_time', 'flexible'];
export const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export const TIMEOFF_UNITS = ['day', 'hour'];
export const REQUEST_STATES = ['draft', 'to_approve', 'approved', 'refused'];
export const ALLOCATION_STATES = ['draft', 'approved', 'refused'];

export const ATTENDANCE_STATUS = ['present', 'late', 'absent', 'overtime', 'half_day'];

// Salary rule categories, in natural computation order.
export const RULE_CATEGORIES = ['basic', 'allowance', 'gross', 'deduction', 'net'];
// How a rule computes its amount.
export const COMPUTE_TYPES = ['fixed', 'percentage', 'code'];
// Base a percentage rule applies to.
export const PERCENT_BASES = ['wage', 'basic', 'gross', 'net'];

export const PAYRUN_STATES = ['draft', 'computed', 'validated', 'paid'];
export const PAYSLIP_STATES = ['draft', 'computed', 'validated', 'paid'];
