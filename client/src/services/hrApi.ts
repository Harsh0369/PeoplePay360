import { authHeaders } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Unwraps { success, message, data } and throws a clean error on failure.
async function req<T = any>(method: string, path: string, body?: any): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: authHeaders(body ? { 'Content-Type': 'application/json' } : {}),
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(12000),
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
  getRoles: () => req('GET', '/roles'),
};
