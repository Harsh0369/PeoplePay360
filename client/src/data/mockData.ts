import { Employee, Contract } from '../types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-101',
    empCode: 'EMP001',
    name: 'Sarah Jenkins',
    workEmail: 'sarah.jenkins@company.com',
    workPhone: '+1 (555) 019-2834',
    jobPosition: 'Senior Software Engineer',
    department: 'Engineering',
    manager: 'Michael Scott',
    workingSchedule: 'Standard 40h/week',
    status: 'ACTIVE',
    employeeType: 'FULL_TIME',
    bankAccountNo: '987654321045',
    bankName: 'JPMorgan Chase Bank',
    ifscCode: 'CHASUS33XXX',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    joinDate: '2023-01-15',
    contractCount: 2,
    attendanceCount: 142,
    timeOffCount: 4,
    allocationCount: 22
  },
  {
    id: 'emp-102',
    empCode: 'EMP002',
    name: 'David Vance',
    workEmail: 'david.vance@company.com',
    workPhone: '+1 (555) 018-9921',
    jobPosition: 'HR Specialist',
    department: 'Human Resources',
    manager: 'Pam Beesly',
    workingSchedule: 'Standard 40h/week',
    status: 'ACTIVE',
    employeeType: 'FULL_TIME',
    bankAccountNo: '112233445566',
    bankName: 'Bank of America',
    ifscCode: 'BOFAUS3NXXX',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    joinDate: '2022-06-01',
    contractCount: 1,
    attendanceCount: 198,
    timeOffCount: 2,
    allocationCount: 18
  },
  {
    id: 'emp-103',
    empCode: 'EMP003',
    name: 'Elena Rostova',
    workEmail: 'elena.rostova@company.com',
    workPhone: '+1 (555) 014-8832',
    jobPosition: 'Payroll Coordinator',
    department: 'Finance & Payroll',
    manager: 'Angela Martin',
    workingSchedule: 'Flexible Shift 35h',
    status: 'ON_LEAVE',
    employeeType: 'FULL_TIME',
    bankAccountNo: '445566778899',
    bankName: 'Wells Fargo',
    ifscCode: 'WFBIUS6SXXX',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    joinDate: '2023-09-10',
    contractCount: 1,
    attendanceCount: 110,
    timeOffCount: 8,
    allocationCount: 20
  },
  {
    id: 'emp-104',
    empCode: 'EMP004',
    name: 'Marcus Brody',
    workEmail: 'marcus.brody@company.com',
    workPhone: '+1 (555) 017-3341',
    jobPosition: 'Product Designer',
    department: 'Product & Design',
    manager: 'Jim Halpert',
    workingSchedule: 'Standard 40h/week',
    status: 'ACTIVE',
    employeeType: 'CONTRACT',
    bankAccountNo: '556677889900',
    bankName: 'Citibank',
    ifscCode: 'CITIUS33XXX',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    joinDate: '2024-02-01',
    contractCount: 1,
    attendanceCount: 75,
    timeOffCount: 1,
    allocationCount: 10
  }
];

export const INITIAL_CONTRACTS: Contract[] = [
  {
    id: 'cnt-201',
    contractRef: 'CNT/2024/001',
    employeeId: 'emp-101',
    employeeName: 'Sarah Jenkins',
    department: 'Engineering',
    jobPosition: 'Senior Software Engineer',
    startDate: '2024-01-01',
    endDate: null, // Indefinite active contract
    wage: 8500,
    salaryStructure: 'Regular Salary Structure',
    status: 'ACTIVE',
    terms: 'Full-time employment agreement with standard health insurance, PTO, and annual bonus eligible.'
  },
  {
    id: 'cnt-200',
    contractRef: 'CNT/2023/045',
    employeeId: 'emp-101',
    employeeName: 'Sarah Jenkins',
    department: 'Engineering',
    jobPosition: 'Software Engineer',
    startDate: '2023-01-15',
    endDate: '2023-12-31',
    wage: 6800,
    salaryStructure: 'Regular Salary Structure',
    status: 'EXPIRED',
    terms: 'Initial Junior/Mid engineer contract expired on promotion.'
  },
  {
    id: 'cnt-202',
    contractRef: 'CNT/2022/019',
    employeeId: 'emp-102',
    employeeName: 'David Vance',
    department: 'Human Resources',
    jobPosition: 'HR Specialist',
    startDate: '2022-06-01',
    endDate: null,
    wage: 5900,
    salaryStructure: 'Regular Salary Structure',
    status: 'ACTIVE',
    terms: 'Standard HR Specialist permanent contract.'
  },
  {
    id: 'cnt-203',
    contractRef: 'CNT/2023/088',
    employeeId: 'emp-103',
    employeeName: 'Elena Rostova',
    department: 'Finance & Payroll',
    jobPosition: 'Payroll Coordinator',
    startDate: '2023-09-10',
    endDate: null,
    wage: 6200,
    salaryStructure: 'Regular Salary Structure',
    status: 'ACTIVE',
    terms: 'Payroll Operations contract with quarterly audit compliance incentives.'
  },
  {
    id: 'cnt-204',
    contractRef: 'CNT/2024/012',
    employeeId: 'emp-104',
    employeeName: 'Marcus Brody',
    department: 'Product & Design',
    jobPosition: 'Product Designer',
    startDate: '2024-02-01',
    endDate: '2025-01-31',
    wage: 5400,
    salaryStructure: 'Contractor Fixed Structure',
    status: 'ACTIVE',
    terms: 'Fixed-term 12-month contractor agreement.'
  }
];

export const INITIAL_DEPARTMENTS = [
  { id: 'dept-1', name: 'Engineering' },
  { id: 'dept-2', name: 'Human Resources' },
  { id: 'dept-3', name: 'Finance & Payroll' },
  { id: 'dept-4', name: 'Product & Design' },
  { id: 'dept-5', name: 'Marketing & Sales' }
];

export const INITIAL_JOB_POSITIONS = [
  {
    id: 'jp-1',
    title: 'Senior Software Engineer',
    departmentId: 'dept-1',
    departmentName: 'Engineering',
    expectedSalary: 8500,
    isActive: true,
    employeeCount: 1,
    createdAt: '2024-01-10'
  },
  {
    id: 'jp-2',
    title: 'HR Specialist',
    departmentId: 'dept-2',
    departmentName: 'Human Resources',
    expectedSalary: 5900,
    isActive: true,
    employeeCount: 1,
    createdAt: '2024-01-12'
  },
  {
    id: 'jp-3',
    title: 'Payroll Coordinator',
    departmentId: 'dept-3',
    departmentName: 'Finance & Payroll',
    expectedSalary: 6200,
    isActive: true,
    employeeCount: 1,
    createdAt: '2024-01-15'
  },
  {
    id: 'jp-4',
    title: 'Product Designer',
    departmentId: 'dept-4',
    departmentName: 'Product & Design',
    expectedSalary: 5400,
    isActive: true,
    employeeCount: 1,
    createdAt: '2024-02-01'
  },
  {
    id: 'jp-5',
    title: 'DevOps Lead',
    departmentId: 'dept-1',
    departmentName: 'Engineering',
    expectedSalary: 9200,
    isActive: true,
    employeeCount: 0,
    createdAt: '2024-03-01'
  }
];
