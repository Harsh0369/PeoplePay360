// Translates the real backend's shapes into the shapes the UI already speaks.
// Backend wraps everything as { success, message, data } and uses *Id fields
// (often populated objects); the UI uses flat ids + display strings.

export const unwrapEnvelope = (payload) =>
  payload && typeof payload === 'object' && 'data' in payload ? payload.data : payload;

const idOf = (v) => (v && typeof v === 'object' ? v._id : v) ?? '';
const lower = (s) => String(s || '').toLowerCase();

// "Active" -> "active", "Running" -> "running"
const normState = (s, fallback = '') => lower(s) || fallback;

export function toUiEmployee(e = {}) {
  return {
    _id: e._id,
    name: e.name || '',
    workEmail: e.workEmail || '',
    mobile: e.mobile || '',
    department: e.departmentId?.name || '',
    jobPosition: e.jobPositionId?.title || '',
    manager: idOf(e.managerId) || '',
    employeeType: e.employeeType || 'full_time',
    status: normState(e.status, 'active'),
    workingSchedule: idOf(e.workingScheduleId),
    bankAccount: e.bankAccount || '',
    joinDate: e.joinDate || '',
  };
}

export function toUiContract(c = {}) {
  return {
    _id: c._id,
    // Backend has no human reference field — derive a readable one.
    name: c.name || `CO/${String(c._id || '').slice(-6).toUpperCase()}`,
    employee: idOf(c.employeeId),
    startDate: c.startDate || '',
    endDate: c.endDate || null,
    wage: Number(c.wage) || 0,
    department: c.departmentId?.name || c.employeeId?.departmentId?.name || '',
    jobPosition: c.jobPositionId?.title || '',
    workingSchedule: idOf(c.workingScheduleId),
    salaryStructure: idOf(c.salaryStructureId),
    state: normState(c.status, 'draft'),
  };
}

export function toUiRule(r = {}) {
  return {
    _id: r._id,
    name: r.name || '',
    code: r.code || '',
    category: lower(r.category) || 'basic',
    sequence: Number(r.sequence ?? 100),
    computeType: lower(r.computeType || r.amountType) || 'fixed',
    amountFixed: Number(r.amountFixed ?? r.amount ?? 0),
    percentage: Number(r.percentage ?? 0),
    percentBase: lower(r.percentBase) || 'basic',
    formula: r.formula || r.expression || '',
    active: r.active !== false,
  };
}

export function toUiStructure(s = {}) {
  return {
    _id: s._id,
    name: s.name || '',
    code: s.code || '',
    rules: (s.rules || s.salaryRuleIds || []).map(idOf).filter(Boolean),
    active: s.active !== false,
  };
}

// Backend role is a populated role document; the UI needs one of its 5 role keys.
export function toUiRole(role) {
  const n = lower(role?.name || role);
  if (n.includes('admin')) return 'admin';
  if (n.includes('payroll') && n.includes('manager')) return 'hr_payroll_manager';
  if (n.includes('payroll')) return 'hr_payroll_user';
  if (n.includes('hr')) return 'hr_manager';
  return 'employee';
}

export function toUiUser(u = {}) {
  return {
    _id: u._id,
    name: u.name || u.email || 'User',
    email: u.email || '',
    role: toUiRole(u.role),
    employee: idOf(u.employeeId),
    active: u.active !== false,
  };
}
