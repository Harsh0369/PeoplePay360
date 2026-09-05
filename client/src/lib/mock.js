// In-memory mock adapter — lets the whole frontend run with realistic data
// before the backend API exists. Mirrors the REST shape the backend will expose:
//   GET    /:resource          -> list
//   GET    /:resource/:id      -> one
//   POST   /:resource          -> create
//   PUT    /:resource/:id      -> replace/merge
//   DELETE /:resource/:id      -> remove
// Special payroll endpoints are handled explicitly at the bottom.

import { computePayslip } from './payrollEngine.js';

const uid = () => Math.random().toString(36).slice(2, 10);
const clone = (v) => JSON.parse(JSON.stringify(v));
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

// Working-days in a period (Mon-Fri), used as payroll's totalDays.
function workingDaysBetween(start, end) {
  let d = new Date(start);
  const last = new Date(end);
  let count = 0;
  while (d <= last) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) count++;
    d = new Date(d.getTime() + 86400000);
  }
  return count || 22;
}

// ---- Seed data (INR) --------------------------------------------------------
const schedules = [
  { _id: 'sch1', name: 'Standard 40h', calendarType: 'full_time', hoursPerWeek: 40, daysPerWeek: 5, company: 'Urban Corp', active: true },
  { _id: 'sch2', name: 'Part-time 20h', calendarType: 'part_time', hoursPerWeek: 20, daysPerWeek: 5, company: 'Urban Corp', active: true },
];

const employees = [
  { _id: 'e1', name: 'Aarav Mehta', workEmail: 'aarav@urban.co', mobile: '+91 98200 11223', department: 'Engineering', jobPosition: 'Senior Engineer', employeeType: 'full_time', status: 'active', workingSchedule: 'sch1', bankAccount: 'HDFC ****4521', joinDate: '2023-04-01' },
  { _id: 'e2', name: 'Priya Nair', workEmail: 'priya@urban.co', mobile: '+91 98111 22334', department: 'Design', jobPosition: 'Product Designer', employeeType: 'full_time', status: 'active', workingSchedule: 'sch1', bankAccount: 'ICICI ****8890', joinDate: '2022-11-15' },
  { _id: 'e3', name: 'Rahul Sharma', workEmail: 'rahul@urban.co', mobile: '+91 99300 44556', department: 'Sales', jobPosition: 'Account Executive', employeeType: 'full_time', status: 'active', workingSchedule: 'sch1', bankAccount: '', joinDate: '2024-01-10' },
  { _id: 'e4', name: 'Nimesh Pathak', workEmail: 'nimesh@urban.co', mobile: '+91 90040 55667', department: 'Finance', jobPosition: 'Accountant', employeeType: 'full_time', status: 'active', workingSchedule: 'sch1', bankAccount: 'SBI ****1204', joinDate: '2021-06-20' },
  { _id: 'e5', name: 'Sara Khan', workEmail: 'sara@urban.co', mobile: '+91 98700 66778', department: 'Engineering', jobPosition: 'Frontend Engineer', employeeType: 'full_time', status: 'active', workingSchedule: 'sch1', bankAccount: 'Axis ****9931', joinDate: '2023-09-05' },
  { _id: 'e6', name: 'Dev Patel', workEmail: 'dev@urban.co', mobile: '+91 97600 77889', department: 'Support', jobPosition: 'Support Lead', employeeType: 'part_time', status: 'active', workingSchedule: 'sch2', bankAccount: 'Kotak ****2210', joinDate: '2024-03-18' },
  { _id: 'e7', name: 'Meera Joshi', workEmail: 'meera@urban.co', mobile: '+91 98800 33221', department: 'HR', jobPosition: 'HR Manager', employeeType: 'full_time', status: 'inactive', workingSchedule: 'sch1', bankAccount: 'HDFC ****7745', joinDate: '2020-02-01' },
];

const contracts = [
  { _id: 'c1', name: 'CO/2026/0042', employee: 'e1', startDate: '2025-04-01', endDate: null, wage: 90000, department: 'Engineering', jobPosition: 'Senior Engineer', workingSchedule: 'sch1', salaryStructure: 'ss1', state: 'running' },
  { _id: 'c2', name: 'CO/2026/0031', employee: 'e2', startDate: '2025-01-01', endDate: null, wage: 75000, department: 'Design', jobPosition: 'Product Designer', workingSchedule: 'sch1', salaryStructure: 'ss1', state: 'running' },
  { _id: 'c3', name: 'CO/2024/0011', employee: 'e1', startDate: '2023-04-01', endDate: '2025-03-31', wage: 70000, department: 'Engineering', jobPosition: 'Engineer', workingSchedule: 'sch1', salaryStructure: 'ss1', state: 'expired' },
];

const salaryRules = [
  { _id: 'r1', name: 'Basic Salary', code: 'BASIC', category: 'basic', sequence: 10, computeType: 'percentage', percentage: 50, percentBase: 'wage', active: true },
  { _id: 'r2', name: 'House Rent Allowance', code: 'HRA', category: 'allowance', sequence: 20, computeType: 'percentage', percentage: 40, percentBase: 'basic', active: true },
  { _id: 'r3', name: 'Conveyance', code: 'CONV', category: 'allowance', sequence: 30, computeType: 'fixed', amountFixed: 2000, active: true },
  { _id: 'r4', name: 'Overtime', code: 'OT', category: 'allowance', sequence: 40, computeType: 'code', formula: 'overtimeHours * (basic / (totalDays * 8)) * 1.5', active: true },
  { _id: 'r5', name: 'Provident Fund', code: 'PF', category: 'deduction', sequence: 50, computeType: 'percentage', percentage: 12, percentBase: 'basic', active: true },
  { _id: 'r6', name: 'Unpaid Leave', code: 'UNPAID', category: 'deduction', sequence: 60, computeType: 'code', formula: '(unpaidLeaveDays / totalDays) * basic', active: true },
  { _id: 'r7', name: 'Professional Tax', code: 'PT', category: 'deduction', sequence: 70, computeType: 'fixed', amountFixed: 200, active: true },
];

const salaryStructures = [
  { _id: 'ss1', name: 'Regular Salary', code: 'REG', rules: ['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7'], active: true },
  { _id: 'ss2', name: 'Intern Stipend', code: 'INT', rules: ['r1', 'r7'], active: true },
];

const timeOffTypes = [
  { _id: 't1', name: 'Paid Time Off', code: 'PTO', unit: 'day', requiresAllocation: true, approvalRequired: true, paid: true, color: '#4f46e5', active: true },
  { _id: 't2', name: 'Sick Leave', code: 'SICK', unit: 'day', requiresAllocation: true, approvalRequired: true, paid: true, color: '#10b981', active: true },
  { _id: 't3', name: 'Unpaid Leave', code: 'UNPAID', unit: 'day', requiresAllocation: false, approvalRequired: true, paid: false, color: '#ef4444', active: true },
];

const allocations = [
  { _id: 'a1', employee: 'e1', timeOffType: 't1', allocated: 18, validFrom: '2026-01-01', validTo: '2026-12-31', state: 'approved' },
  { _id: 'a2', employee: 'e2', timeOffType: 't1', allocated: 18, validFrom: '2026-01-01', validTo: '2026-12-31', state: 'approved' },
];

const timeOffRequests = [
  { _id: 'to1', employee: 'e1', timeOffType: 't1', dateFrom: '2026-02-10', dateTo: '2026-02-11', duration: 2, reason: 'Personal', state: 'approved' },
  { _id: 'to2', employee: 'e3', timeOffType: 't3', dateFrom: '2026-02-18', dateTo: '2026-02-19', duration: 2, reason: 'Family', state: 'to_approve' },
  // Approved UNPAID leave for e1 -> shows up as an unpaid-leave deduction on the payslip.
  { _id: 'to3', employee: 'e1', timeOffType: 't3', dateFrom: '2026-01-20', dateTo: '2026-01-22', duration: 3, reason: 'Emergency', state: 'approved' },
];

const attendance = [
  { _id: 'at1', employee: 'e1', checkIn: '2026-02-02T09:05:00', checkOut: '2026-02-02T18:10:00', workedHours: 9.08, status: 'present' },
  { _id: 'at2', employee: 'e2', checkIn: '2026-02-02T09:45:00', checkOut: '2026-02-02T18:00:00', workedHours: 8.25, status: 'late' },
  { _id: 'at3', employee: 'e3', checkIn: '2026-02-02T09:00:00', checkOut: null, workedHours: 0, status: 'present' },
];

const payruns = [
  { _id: 'p1', name: 'January 2026', salaryStructure: 'ss1', periodStart: '2026-01-01', periodEnd: '2026-01-31', employeeType: 'all', employees: ['e1', 'e2', 'e3'], payslips: [], state: 'draft' },
];

const users = [
  { _id: 'u1', name: 'Aarav Mehta', email: 'admin@urban.co', role: 'admin', employee: 'e1', active: true },
  { _id: 'u2', name: 'Meera Joshi', email: 'hr@urban.co', role: 'hr_manager', employee: 'e7', active: true },
  { _id: 'u3', name: 'Nimesh Pathak', email: 'payroll@urban.co', role: 'hr_payroll_manager', employee: 'e4', active: true },
  { _id: 'u4', name: 'Rahul Sharma', email: 'rahul@urban.co', role: 'employee', employee: 'e3', active: true },
];

const store = {
  schedules, employees, contracts, salaryRules, salaryStructures,
  timeOffTypes, allocations, timeOffRequests, attendance, payruns, payslips: [], users,
};

// ---- Generic router ---------------------------------------------------------
export async function mockRequest(method, path, body) {
  await delay();
  const [, resource, id, action] = path.split('/'); // '/employees/e1' -> ['','employees','e1']

  // ---- Auth ----
  if (resource === 'auth' && id === 'login') {
    const user = store.users.find((u) => u.email === body?.email && u.active);
    if (!user) throw new Error('Invalid credentials');
    return { token: `mock.${user._id}`, user: clone(user) };
  }

  // ---- Payrun lifecycle actions (/payruns/:id/<action>) ----
  if (resource === 'payruns' && action) {
    return payrunAction(id, action);
  }

  const col = store[resource];
  if (!col) throw new Error(`Mock: unknown resource "${resource}"`);

  switch (method) {
    case 'get':
      if (id) {
        const found = col.find((x) => x._id === id);
        if (!found) throw new Error('Not found');
        return clone(found);
      }
      return clone(col);
    case 'post': {
      const doc = { _id: uid(), ...body };
      col.push(doc);
      return clone(doc);
    }
    case 'put':
    case 'patch': {
      const idx = col.findIndex((x) => x._id === id);
      if (idx === -1) throw new Error('Not found');
      col[idx] = { ...col[idx], ...body, _id: id };
      return clone(col[idx]);
    }
    case 'delete': {
      const idx = col.findIndex((x) => x._id === id);
      if (idx !== -1) col.splice(idx, 1);
      return { ok: true };
    }
    default:
      throw new Error(`Mock: unsupported method ${method}`);
  }
}

// Payrun lifecycle: compute -> validate -> markpaid -> send.
function payrunAction(id, action) {
  const run = store.payruns.find((x) => x._id === id);
  if (!run) throw new Error('Payrun not found');

  if (action === 'compute') {
    const structure = store.salaryStructures.find((s) => s._id === run.salaryStructure);
    const rules = (structure?.rules || [])
      .map((rid) => store.salaryRules.find((r) => r._id === rid))
      .filter(Boolean);
    const totalDays = workingDaysBetween(run.periodStart, run.periodEnd);

    // Remove existing payslips for this run (recompute), then regenerate.
    store.payslips = store.payslips.filter((ps) => ps.payrun !== id);
    const slipIds = [];

    for (const empId of run.employees) {
      const emp = store.employees.find((e) => e._id === empId);
      const contract =
        store.contracts.find(
          (c) => c.employee === empId && c.state === 'running'
        ) || null;

      const warnings = [];
      if (!contract) warnings.push('No running contract for this period');
      if (!emp?.bankAccount) warnings.push('Missing bank details');

      // Leave / overtime inputs from live records.
      const unpaidType = store.timeOffTypes.find((t) => !t.paid);
      const unpaidLeaveDays = store.timeOffRequests
        .filter((r) => r.employee === empId && r.state === 'approved' && r.timeOffType === unpaidType?._id)
        .reduce((s, r) => s + (r.duration || 0), 0);
      const overtimeHours = store.attendance
        .filter((a) => a.employee === empId && a.status === 'overtime')
        .reduce((s, a) => s + Math.max(0, (a.workedHours || 0) - 8), 0);
      const workedDays = totalDays - unpaidLeaveDays;

      const wage = contract?.wage || 0;
      const computed = computePayslip({
        wage, rules, inputs: { workedDays, totalDays, unpaidLeaveDays, overtimeHours },
      });

      const slip = {
        _id: uid(),
        payrun: id,
        employee: empId,
        contract: contract?._id || null,
        salaryStructure: run.salaryStructure,
        periodStart: run.periodStart,
        periodEnd: run.periodEnd,
        workedDays, totalDays, unpaidLeaveDays, overtimeHours,
        ...computed,
        warnings,
        state: 'computed',
      };
      store.payslips.push(slip);
      slipIds.push(slip._id);
    }
    run.payslips = slipIds;
    run.state = 'computed';
    return clone(run);
  }

  if (action === 'validate') {
    run.state = 'validated';
    store.payslips.filter((p) => p.payrun === id).forEach((p) => (p.state = 'validated'));
    return clone(run);
  }
  if (action === 'markpaid') {
    run.state = 'paid';
    store.payslips.filter((p) => p.payrun === id).forEach((p) => (p.state = 'paid'));
    return clone(run);
  }
  if (action === 'send') {
    return { ok: true, sent: run.payslips.length };
  }
  throw new Error(`Mock: unknown payrun action "${action}"`);
}

export { store };
