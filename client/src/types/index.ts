export type EmployeeStatus = 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
export type EmployeeType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface Employee {
  id: string;
  empCode: string;
  name: string;
  workEmail: string;
  workPhone: string;
  jobPosition: string;
  department: string;
  manager: string;
  workingSchedule: string;
  status: EmployeeStatus;
  employeeType: EmployeeType;
  bankAccountNo: string;
  bankName: string;
  ifscCode: string;
  avatarUrl?: string;
  joinDate: string;
  contractCount: number;
  attendanceCount: number;
  timeOffCount: number;
  allocationCount: number;
}

export interface Contract {
  id: string;
  contractRef: string;
  employeeId: string;
  employeeName: string;
  department: string;
  jobPosition: string;
  startDate: string;
  endDate?: string | null;
  wage: number; // Base monthly wage
  salaryStructure: string;
  status: ContractStatus;
  terms?: string;
}

export interface Department {
  _id?: string;
  id?: string;
  name: string;
  parentDepartmentId?: string | null;
  managerId?: string | null;
  createdAt?: string;
}

export interface JobPosition {
  _id?: string;
  id?: string;
  title: string;
  departmentId?: string | Department | null;
  departmentName?: string;
  expectedSalary?: number;
  isActive?: boolean;
  employeeCount?: number;
  createdAt?: string;
}

export type ActiveTab =
  | 'EMPLOYEES' | 'CONTRACTS' | 'JOB_POSITIONS'
  | 'ATTENDANCE' | 'TIMEOFF' | 'PAYROLL' | 'CONFIG'
  | 'ORG' | 'SETTINGS' | 'MY_PROFILE';
