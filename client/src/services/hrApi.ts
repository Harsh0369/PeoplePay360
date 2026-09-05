import { authHeaders } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Unwraps { success, message, data } and throws a clean error on failure.
// GET requests carry a high limit so paginated list endpoints return the full set.
async function req<T = any>(method: string, path: string, body?: any): Promise<T> {
  let url = `${API_BASE_URL}${path}`;
  if (method === 'GET') url += (path.includes('?') ? '&' : '?') + 'limit=100000';
  const res = await fetch(url, {
    method,
    headers: authHeaders(body ? { 'Content-Type': 'application/json' } : {}),
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(20000),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || json?.error || `Request failed (${res.status})`);
  return (json?.data ?? json) as T;
}

// ---- Payroll: Payruns & Payslips ----
export const payrollApi = {
  getPayruns: () => req('GET', '/payruns'),
  getPayrunDetail: (id: string) => req('GET', `/payruns/${id}`), // { payrun, payslips, totals }
  createPayrun: (data: { periodStart: string; periodEnd: string; departmentId?: string | null }) =>
    req('POST', '/payruns', data),
  compute: (id: string) => req('POST', `/payruns/${id}/compute`),
  validate: (id: string) => req('POST', `/payruns/${id}/validate`),
  markPaid: (id: string) => req('POST', `/payruns/${id}/mark-paid`),
  cancel: (id: string) => req('POST', `/payruns/${id}/cancel`),
  getPayslips: () => req('GET', '/payslips'),
  getPayslipDetail: (id: string) => req('GET', `/payslips/${id}`),
};

// ---- Payroll configuration: Salary Rules & Structures ----
export const configApi = {
  getRules: () => req('GET', '/payroll-config/rules'),
  createRule: (data: any) => req('POST', '/payroll-config/rules', data),
  updateRule: (id: string, data: any) => req('PATCH', `/payroll-config/rules/${id}`, data),
  deleteRule: (id: string) => req('DELETE', `/payroll-config/rules/${id}`),
  getStructures: () => req('GET', '/payroll-config/structures'),
  createStructure: (data: any) => req('POST', '/payroll-config/structures', data),
  updateStructure: (id: string, data: any) => req('PATCH', `/payroll-config/structures/${id}`, data),
  deleteStructure: (id: string) => req('DELETE', `/payroll-config/structures/${id}`),
};

// ---- Master data ----
export const masterApi = {
  getDepartments: () => req('GET', '/departments'),
  createDepartment: (data: { name: string; parentDepartmentId?: string; managerId?: string }) =>
    req('POST', '/departments', data),
  getJobPositions: () => req('GET', '/job-positions'),
  getWorkingSchedules: () => req('GET', '/working-schedules'),
  createWorkingSchedule: (data: any) => req('POST', '/working-schedules', data),
  getRoles: () => req('GET', '/roles'),
  createRole: (data: any) => req('POST', '/roles', data),
  getEmployees: () => req('GET', '/employees'),
  getMyProfile: () => req('GET', '/employees/me'), // { employee, activeContract }
};

// ---- Attendance ----
export const attendanceApi = {
  getAll: (params = '') => req('GET', `/attendance${params}`),
  // The signed-in user's most recent attendance record (open or closed) — drives
  // the clock in/out toggle AND the "clocked in / last clocked out at" status line.
  myLatest: async (employeeId: string) => {
    if (!employeeId) return null;
    const rows = await req<any[]>('GET', `/attendance?employeeId=${employeeId}&limit=1`);
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  },
  clockIn: (data: any = {}) => req('POST', '/attendance/clock-in', data),
  clockOut: (data: any = {}) => req('POST', '/attendance/clock-out', data),
  adminUpdate: (id: string, data: any) => req('PUT', `/attendance/${id}`, data),
};

// ---- Time Off ----
export const timeOffApi = {
  getTypes: () => req('GET', '/time-off/types'),
  createType: (data: any) => req('POST', '/time-off/types', data),
  getAllocations: () => req('GET', '/time-off/allocations'),
  createAllocation: (data: any) => req('POST', '/time-off/allocations', data),
  getRequests: () => req('GET', '/time-off/requests'),
  raiseRequest: (data: any) => req('POST', '/time-off/request', data),
  review: (id: string, data: { status: 'APPROVED' | 'REJECTED'; reviewNote?: string }) =>
    req('POST', `/time-off/${id}/review`, data),
};
