import { Employee, Contract, ContractStatus, JobPosition, Department } from '../types';
import { authHeaders } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Every request is authenticated and real. No mock/offline fallback: on failure
// we surface the error (writes) or return an empty list (reads) — never fake data.
// The backend now paginates list endpoints (default 15/page). We request a high
// limit so lists, KPIs and lookups keep working with the full dataset as before.
async function get(path: string): Promise<any[]> {
  const sep = path.includes('?') ? '&' : '?';
  const res = await fetch(`${API_BASE_URL}${path}${sep}limit=100000`, { headers: authHeaders(), signal: AbortSignal.timeout(20000) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || json?.error || `Request failed (${res.status})`);
  return Array.isArray(json?.data) ? json.data : [];
}
async function send(method: string, path: string, body: any): Promise<any> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method, headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify(body), signal: AbortSignal.timeout(12000),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || json?.error || `Request failed (${res.status})`);
  return json?.data ?? json;
}

const empCode = (item: any) => item.empCode || `EMP-${String(item._id || '').slice(-4).toUpperCase()}`;
const cntRef = (item: any) => item.contractRef || `CNT-${String(item._id || '').slice(-4).toUpperCase()}`;

// Backend contract statuses (Draft/Running/Expired/Cancelled) -> the UI's vocabulary
// (DRAFT/ACTIVE/EXPIRED/CANCELLED) so "active contract" logic and badges work.
const CONTRACT_STATUS: Record<string, string> = { RUNNING: 'ACTIVE', DRAFT: 'DRAFT', EXPIRED: 'EXPIRED', CANCELLED: 'CANCELLED' };
const mapContractStatus = (s: any) => CONTRACT_STATUS[String(s || 'DRAFT').toUpperCase()] || String(s || 'DRAFT').toUpperCase();

export const apiService = {
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(4000) });
      return res.ok;
    } catch {
      return false;
    }
  },

  async getEmployees(): Promise<Employee[]> {
    const data = await get('/employees');
    return data.map((item: any) => ({
      id: item._id || item.id,
      empCode: empCode(item),
      name: item.name,
      workEmail: item.workEmail || '',
      workPhone: item.workPhone || '—',
      jobPosition: item.jobPositionId?.title || '—',
      department: item.departmentId?.name || '—',
      manager: item.managerId?.name || '—',
      workingSchedule: item.workingScheduleId?.name || '—',
      status: (item.status || 'ACTIVE').toString().toUpperCase(),
      employeeType: item.employeeType || 'FULL_TIME',
      bankAccountNo: item.bankAccountNo || '',
      bankName: item.bankName || '',
      ifscCode: item.ifscCode || '',
      joinDate: item.joinDate ? new Date(item.joinDate).toISOString().split('T')[0] : '',
      contractCount: item.contractCount ?? 0,
      attendanceCount: item.attendanceCount ?? 0,
      timeOffCount: item.timeOffCount ?? 0,
      allocationCount: item.allocationCount ?? 0,
    }));
  },

  async createEmployee(data: Partial<Employee>): Promise<Employee> {
    const d = await send('POST', '/employees', data);
    return { ...(data as Employee), ...d, id: d._id || d.id };
  },

  async updateEmployee(id: string, data: Partial<Employee>): Promise<Employee> {
    const d = await send('PUT', `/employees/${id}`, data);
    return { ...(data as Employee), ...d, id: d._id || d.id || id };
  },

  async getContracts(): Promise<Contract[]> {
    const data = await get('/contracts');
    return data.map((item: any) => ({
      id: item._id || item.id,
      contractRef: cntRef(item),
      employeeId: item.employeeId?._id || item.employeeId || '',
      employeeName: item.employeeId?.name || '—',
      department: item.departmentId?.name || item.employeeId?.departmentId?.name || '—',
      jobPosition: item.jobPositionId?.title || '—',
      startDate: item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '',
      endDate: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : null,
      wage: item.wage ?? 0,
      salaryStructure: item.salaryStructureId?.name || '—',
      status: mapContractStatus(item.status) as ContractStatus,
      terms: item.terms || '',
    }));
  },

  async createContract(data: Partial<Contract>): Promise<Contract> {
    const d = await send('POST', '/contracts', data);
    return { ...(data as Contract), ...d, id: d._id || d.id };
  },

  async updateContract(id: string, data: Partial<Contract>): Promise<Contract> {
    const d = await send('PUT', `/contracts/${id}`, data);
    return { ...(data as Contract), ...d, id: d._id || d.id || id };
  },

  async getDepartments(): Promise<Department[]> {
    const data = await get('/departments');
    return data.map((item: any) => ({
      id: item._id || item.id,
      _id: item._id,
      name: item.name,
      parentDepartmentId: item.parentDepartmentId,
      managerId: item.managerId,
    }));
  },

  async createDepartment(data: any): Promise<Department> {
    const d = await send('POST', '/departments', data);
    return { ...data, id: d._id || d.id, _id: d._id || d.id };
  },

  async updateDepartment(id: string, data: any): Promise<Department> {
    const d = await send('PUT', `/departments/${id}`, data);
    return { ...data, id: d._id || d.id || id, _id: d._id || d.id || id };
  },

  async deleteDepartment(id: string): Promise<boolean> {
    await send('DELETE', `/departments/${id}`, {});
    return true;
  },

  async getJobPositions(): Promise<JobPosition[]> {
    const data = await get('/job-positions');
    return data.map((item: any) => ({
      id: item._id || item.id,
      _id: item._id,
      title: item.title,
      departmentId: item.departmentId?._id || item.departmentId || null,
      departmentName: item.departmentId?.name || '—',
      expectedSalary: item.expectedSalary || 0,
      isActive: item.isActive ?? true,
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : '',
    }));
  },

  async createJobPosition(data: { title: string; departmentId?: string; expectedSalary?: number }): Promise<JobPosition> {
    const d = await send('POST', '/job-positions', data);
    return {
      id: d._id || d.id,
      _id: d._id,
      title: d.title,
      departmentId: d.departmentId,
      expectedSalary: d.expectedSalary || 0,
      isActive: d.isActive ?? true,
      createdAt: new Date().toISOString().split('T')[0],
    };
  },

  async updateJobPosition(id: string, data: Partial<JobPosition>): Promise<JobPosition> {
    const d = await send('PUT', `/job-positions/${id}`, data);
    return { ...(data as JobPosition), id: d._id || d.id || id, _id: d._id || d.id || id };
  },

  async deleteJobPosition(id: string): Promise<boolean> {
    await send('DELETE', `/job-positions/${id}`, {});
    return true;
  },

  async assignEmployeeJobPosition(employeeId: string, jobPositionId: string): Promise<boolean> {
    await send('POST', `/job-positions/employee/${employeeId}/assign`, { jobPositionId });
    return true;
  },
};
