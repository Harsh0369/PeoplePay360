import { Employee, Contract } from '../types';
import { INITIAL_EMPLOYEES, INITIAL_CONTRACTS } from '../data/mockData';
import { authHeaders } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const apiService = {
  // Check backend server health
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Fetch all employees
  async getEmployees(): Promise<Employee[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/employees`, {
        headers: authHeaders(),
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          return json.data.map((item: any) => ({
            id: item._id || item.id,
            empCode: item.empCode || `EMP${Math.floor(100 + Math.random() * 900)}`,
            name: item.name,
            workEmail: item.workEmail,
            workPhone: item.workPhone || '+1 (555) 019-2834',
            jobPosition: item.jobPositionId?.title || item.jobPosition || 'Software Engineer',
            department: item.departmentId?.name || item.department || 'Engineering',
            manager: item.managerId?.name || item.manager || 'Michael Scott',
            workingSchedule: item.workingSchedule || 'Standard 40h/week',
            status: item.status?.toUpperCase() || 'ACTIVE',
            employeeType: item.employeeType || 'FULL_TIME',
            bankAccountNo: item.bankAccountNo || '987654321045',
            bankName: item.bankName || 'JPMorgan Chase Bank',
            ifscCode: item.ifscCode || 'CHASUS33XXX',
            joinDate: item.joinDate ? new Date(item.joinDate).toISOString().split('T')[0] : '2024-01-01',
            contractCount: item.contractCount || 1,
            attendanceCount: item.attendanceCount || 120,
            timeOffCount: item.timeOffCount || 2,
            allocationCount: item.allocationCount || 20
          }));
        }
      }
    } catch (e) {
      console.warn('Backend server offline or unreachable. Using client data.', e);
    }
    return INITIAL_EMPLOYEES;
  },

  // Create employee on backend
  async createEmployee(data: Partial<Employee>): Promise<Employee> {
    try {
      const res = await fetch(`${API_BASE_URL}/employees`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn('Backend create employee failed, using client state.', e);
    }
    return {
      id: data.id || `emp-${Date.now()}`,
      empCode: data.empCode || `EMP${Math.floor(100 + Math.random() * 900)}`,
      name: data.name || '',
      workEmail: data.workEmail || '',
      workPhone: data.workPhone || '',
      jobPosition: data.jobPosition || '',
      department: data.department || 'Engineering',
      manager: data.manager || 'Michael Scott',
      workingSchedule: data.workingSchedule || 'Standard 40h/week',
      status: data.status || 'ACTIVE',
      employeeType: data.employeeType || 'FULL_TIME',
      bankAccountNo: data.bankAccountNo || '',
      bankName: data.bankName || '',
      ifscCode: data.ifscCode || '',
      joinDate: data.joinDate || new Date().toISOString().split('T')[0],
      contractCount: 1,
      attendanceCount: 0,
      timeOffCount: 0,
      allocationCount: 20
    };
  },

  // Fetch all contracts
  async getContracts(): Promise<Contract[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/contracts`, {
        headers: authHeaders(),
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          return json.data.map((item: any) => ({
            id: item._id || item.id,
            contractRef: item.contractRef || `CNT/2026/${Math.floor(100 + Math.random() * 900)}`,
            employeeId: item.employeeId?._id || item.employeeId || '',
            employeeName: item.employeeId?.name || item.employeeName || 'Sarah Jenkins',
            department: item.departmentId?.name || item.department || 'Engineering',
            jobPosition: item.jobPositionId?.title || item.jobPosition || 'Software Engineer',
            startDate: item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '2024-01-01',
            endDate: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : null,
            wage: item.wage || 6500,
            salaryStructure: item.salaryStructure || 'Regular Salary Structure',
            status: item.status?.toUpperCase() || 'ACTIVE',
            terms: item.terms || 'Standard employment agreement terms.'
          }));
        }
      }
    } catch (e) {
      console.warn('Backend server offline or unreachable. Using client contracts data.', e);
    }
    return INITIAL_CONTRACTS;
  },

  // Create contract on backend
  async createContract(data: Partial<Contract>): Promise<Contract> {
    try {
      const res = await fetch(`${API_BASE_URL}/contracts`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn('Backend create contract failed, using client state.', e);
    }
    return {
      id: data.id || `cnt-${Date.now()}`,
      contractRef: data.contractRef || `CNT/2026/${Math.floor(100 + Math.random() * 900)}`,
      employeeId: data.employeeId || '',
      employeeName: data.employeeName || '',
      department: data.department || 'Engineering',
      jobPosition: data.jobPosition || 'Software Engineer',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || null,
      wage: data.wage || 6500,
      salaryStructure: data.salaryStructure || 'Regular Salary Structure',
      status: data.status || 'ACTIVE',
      terms: data.terms || 'Standard terms.'
    };
  }
};
