/**
 * PeoplePay360 — Comprehensive Database Seeder
 * =============================================
 * Generates ~1500 employees with realistic, vivid HR data spanning 35 days.
 *
 * Usage:
 *   npx ts-node src/scripts/seed.ts
 *
 * WARNING: This script DROPS all existing data before seeding.
 *          The 5 "demo" credential users are always preserved in creds.md.
 *
 * Data generated:
 *   - 6 Roles (Employee, HR Manager, HR Payroll User, HR Payroll Manager, Admin, Super Admin)
 *   - 1 Super Admin account (superadmin@peoplepay.com) — the single elevated user
 *   - 12 Departments with hierarchy (parent→child)
 *   - 30+ Job Positions across departments
 *   - 4 Working Schedules (Standard, Part-Time, Night Shift, Compressed)
 *   - ~1500 Users + Employees (with varied statuses, bank details, managers)
 *   - ~1500 Running Contracts + 200 historical (Expired/Draft)
 *   - 6 Time Off Types + allocations per employee + varied requests
 *   - ~35 days of Attendance (Present/Late/Half-Day/Absent + open sessions, admin edits)
 *   - Attendance Exceptions
 *   - Salary Rules, Structures
 *   - Payruns (Draft, Computed, Validated, Paid, Cancelled) + Payslips
 *   - Comprehensive Business Logs for every mutation
 */

import * as dotenv from "dotenv";
dotenv.config();

import mongoose, { Types } from "mongoose";
import bcrypt from "bcryptjs";

// ---------- Models ----------
import { User } from "../models/user.model";
import { Role } from "../models/role.model";
import { Department } from "../models/department.model";
import { JobPosition } from "../models/job-position.model";
import { WorkingSchedule } from "../models/working-schedule.model";
import { Employee } from "../models/employee.model";
import { Contract } from "../models/contract.model";
import { Attendance } from "../models/attendance.model";
import { AttendanceException } from "../models/attendance-exception.model";
import { TimeOffType } from "../models/time-off-type.model";
import { TimeOffAllocation } from "../models/time-off-allocation.model";
import { TimeOffRequest } from "../models/time-off-request.model";
import { SalaryRule } from "../models/salary-rule.model";
import { SalaryStructure } from "../models/salary-structure.model";
import { Payrun } from "../models/payrun.model";
import { Payslip } from "../models/payslip.model";
import { BusinessLog } from "../models/business-log.model";

// ========================== HELPERS ==========================

const oid = () => new Types.ObjectId();
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const pickN = <T>(arr: T[], n: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(n, arr.length));
};
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const chance = (pct: number) => Math.random() * 100 < pct;
const padTime = (h: number, m: number) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setUTCHours(0, 0, 0, 0);
  return r;
}
function isWeekday(d: Date): boolean {
  const day = d.getUTCDay();
  return day !== 0 && day !== 6;
}

// Indian first names
const FIRST_NAMES = [
  "Aarav","Aditi","Akshay","Amar","Amira","Ananya","Anil","Anjali","Arjun","Aruna",
  "Bhavna","Chandra","Deepak","Deepika","Dev","Divya","Ekta","Gaurav","Geeta","Hari",
  "Isha","Jaya","Karan","Kavita","Lakshmi","Mahesh","Meera","Mohan","Nandini","Neha",
  "Nikhil","Nisha","Om","Pallavi","Priya","Rahul","Raj","Rekha","Rishi","Rohit",
  "Sachin","Sandeep","Sanjay","Sapna","Seema","Shikha","Shiv","Sneha","Sunil","Sunita",
  "Sushma","Tanvi","Usha","Varun","Vidya","Vikram","Vinod","Yashoda","Zara","Aditya",
  "Bharat","Chitra","Daksh","Esha","Farhan","Gauri","Harsh","Indira","Jagdish","Komal",
  "Lalit","Manisha","Naveen","Omkar","Pooja","Qadir","Ramesh","Sita","Tarun","Uma",
  "Vimal","Waqar","Yogi","Zubin","Alok","Bindu","Chirag","Dinesh","Eva","Fatima",
  "Girish","Hema","Ishan","Jatin","Kunal","Leela","Manoj","Nina","Ojas","Pankaj",
];
const LAST_NAMES = [
  "Sharma","Patel","Gupta","Singh","Kumar","Verma","Joshi","Mishra","Agarwal","Reddy",
  "Nair","Rao","Mehta","Chopra","Bhat","Das","Ghosh","Iyer","Kapoor","Malhotra",
  "Banerjee","Sinha","Tiwari","Yadav","Chauhan","Bose","Menon","Pillai","Kulkarni","Thakur",
  "Desai","Pandey","Saxena","Bhatt","Choudhary","Dutta","Hegde","Jain","Khanna","Luthra",
  "Mohanty","Nagpal","Oberoi","Prasad","Rajan","Sethi","Trivedi","Upadhyay","Walia","Dubey",
];

function genName(): { first: string; last: string; full: string } {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  return { first, last, full: `${first} ${last}` };
}

function genBankAccount(): string | null {
  if (chance(8)) return null; // ~8% missing bank details — edge case
  return `${rand(1000, 9999)}${rand(10000000, 99999999)}`;
}

function genPhone(): string {
  return `+91${rand(70000, 99999)}${rand(10000, 99999)}`;
}

// ========================== SEED DATA ==========================

const SEED_PASSWORD = "Test@1234"; // Shared seed password
const YEAR = 2026;
const SEED_START = new Date(`${YEAR}-08-01T00:00:00Z`); // Aug 1
const SEED_END = new Date(`${YEAR}-09-05T00:00:00Z`);   // Sep 5 (~35 days)

// ---------- Roles ----------
const ROLE_DEFS = [
  {
    name: "Employee",
    permissions: {
      "Employee.Read": true,
      "Attendance.Read": true,
      "TimeOff.Read": true,
    },
    dataScope: "self" as const,
    isAdmin: false,
    isSystem: true,
  },
  {
    name: "HR Manager",
    permissions: {
      "Employee.Read": true, "Employee.Write": true,
      "Organization.Read": true, "Organization.Write": true,
      "Contract.Read": true, "Contract.Write": true,
      "Attendance.Read": true, "Attendance.Write": true,
      "TimeOff.Read": true, "TimeOff.Write": true, "TimeOff.Approve": true,
      "Audit.Read": true,
    },
    dataScope: "all" as const,
    isAdmin: false,
    isSystem: true,
  },
  {
    name: "HR Payroll User",
    permissions: {
      "Employee.Read": true,
      "Contract.Read": true,
      "Payroll.Read": true,
      "Attendance.Read": true,
      "TimeOff.Read": true,
    },
    dataScope: "all" as const,
    isAdmin: false,
    isSystem: true,
  },
  {
    name: "HR Payroll Manager",
    permissions: {
      "Employee.Read": true,
      "Contract.Read": true, "Contract.Write": true,
      "Payroll.Read": true, "Payroll.Write": true,
      "Attendance.Read": true,
      "TimeOff.Read": true,
      "Audit.Read": true,
    },
    dataScope: "all" as const,
    isAdmin: false,
    isSystem: true,
  },
  {
    name: "Admin",
    permissions: {},
    dataScope: "all" as const,
    isAdmin: true,
    isSystem: true,
  },
  {
    // Elevated single account. Same full access as Admin, but the owning user
    // carries the isSuperAdmin flag which unlocks admin-role management and
    // promoting/demoting admins — things regular admins cannot do.
    name: "Super Admin",
    permissions: {},
    dataScope: "all" as const,
    isAdmin: true,
    isSystem: true,
  },
];

// ---------- Departments (hierarchical) ----------
const DEPT_DEFS = [
  // Top-level
  { name: "Engineering", parent: null },
  { name: "Human Resources", parent: null },
  { name: "Finance", parent: null },
  { name: "Marketing", parent: null },
  { name: "Sales", parent: null },
  { name: "Operations", parent: null },
  { name: "Legal", parent: null },
  { name: "Customer Support", parent: null },
  // Sub-departments
  { name: "Backend Engineering", parent: "Engineering" },
  { name: "Frontend Engineering", parent: "Engineering" },
  { name: "QA Engineering", parent: "Engineering" },
  { name: "DevOps", parent: "Engineering" },
];

// ---------- Job Positions ----------
const JOB_DEFS = [
  { title: "Software Engineer", dept: "Backend Engineering", salary: 85000 },
  { title: "Senior Software Engineer", dept: "Backend Engineering", salary: 120000 },
  { title: "Staff Engineer", dept: "Backend Engineering", salary: 160000 },
  { title: "Frontend Developer", dept: "Frontend Engineering", salary: 80000 },
  { title: "Senior Frontend Developer", dept: "Frontend Engineering", salary: 115000 },
  { title: "QA Engineer", dept: "QA Engineering", salary: 65000 },
  { title: "Senior QA Engineer", dept: "QA Engineering", salary: 95000 },
  { title: "DevOps Engineer", dept: "DevOps", salary: 100000 },
  { title: "Senior DevOps Engineer", dept: "DevOps", salary: 135000 },
  { title: "Engineering Manager", dept: "Engineering", salary: 180000 },
  { title: "HR Executive", dept: "Human Resources", salary: 55000 },
  { title: "HR Manager", dept: "Human Resources", salary: 100000 },
  { title: "Recruiter", dept: "Human Resources", salary: 50000 },
  { title: "Accountant", dept: "Finance", salary: 60000 },
  { title: "Senior Accountant", dept: "Finance", salary: 90000 },
  { title: "Finance Manager", dept: "Finance", salary: 130000 },
  { title: "Marketing Executive", dept: "Marketing", salary: 55000 },
  { title: "Marketing Manager", dept: "Marketing", salary: 110000 },
  { title: "Content Writer", dept: "Marketing", salary: 45000 },
  { title: "Sales Executive", dept: "Sales", salary: 50000 },
  { title: "Sales Manager", dept: "Sales", salary: 100000 },
  { title: "Regional Sales Lead", dept: "Sales", salary: 120000 },
  { title: "Operations Analyst", dept: "Operations", salary: 60000 },
  { title: "Operations Manager", dept: "Operations", salary: 110000 },
  { title: "Legal Counsel", dept: "Legal", salary: 120000 },
  { title: "Paralegal", dept: "Legal", salary: 55000 },
  { title: "Support Executive", dept: "Customer Support", salary: 40000 },
  { title: "Support Team Lead", dept: "Customer Support", salary: 70000 },
  { title: "CTO", dept: "Engineering", salary: 250000 },
  { title: "CFO", dept: "Finance", salary: 250000 },
  { title: "VP Engineering", dept: "Engineering", salary: 220000 },
  { title: "Intern", dept: "Engineering", salary: 15000 },
];

// ---------- Working Schedules ----------
const SCHEDULE_DEFS = [
  {
    name: "Standard 9-to-6",
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(d => ({
      dayOfWeek: d, startTime: "09:00", endTime: "18:00", breakDurationMinutes: 60,
    })),
  },
  {
    name: "Part-Time 10-to-2",
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(d => ({
      dayOfWeek: d, startTime: "10:00", endTime: "14:00", breakDurationMinutes: 0,
    })),
  },
  {
    name: "Night Shift",
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(d => ({
      dayOfWeek: d, startTime: "22:00", endTime: "06:00", breakDurationMinutes: 30,
    })),
  },
  {
    name: "Compressed 4-Day Week",
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday"].map(d => ({
      dayOfWeek: d, startTime: "08:00", endTime: "18:00", breakDurationMinutes: 60,
    })),
  },
];

// ---------- Time Off Types ----------
const TIMEOFF_TYPE_DEFS = [
  { name: "Casual Leave", requiresAllocation: true, isPaid: true, description: "General personal leave" },
  { name: "Sick Leave", requiresAllocation: true, isPaid: true, description: "Medical / health leave" },
  { name: "Earned Leave", requiresAllocation: true, isPaid: true, description: "Accrued privilege leave" },
  { name: "Maternity Leave", requiresAllocation: false, isPaid: true, description: "26 weeks as per law" },
  { name: "Paternity Leave", requiresAllocation: false, isPaid: true, description: "15 days" },
  { name: "Loss of Pay", requiresAllocation: false, isPaid: false, description: "Unpaid leave" },
];

// ---------- Salary Rules ----------
const SALARY_RULE_DEFS = [
  { name: "Basic Salary", code: "BASIC", category: "EARNING", sequence: 10, amountType: "FORMULA", formula: "wage * 0.5" },
  { name: "House Rent Allowance", code: "HRA", category: "EARNING", sequence: 20, amountType: "FORMULA", formula: "BASIC * 0.4" },
  { name: "Dearness Allowance", code: "DA", category: "EARNING", sequence: 30, amountType: "FORMULA", formula: "BASIC * 0.1" },
  { name: "Special Allowance", code: "SA", category: "EARNING", sequence: 40, amountType: "FORMULA", formula: "wage - BASIC - HRA - DA" },
  { name: "Gross Salary", code: "GROSS", category: "GROSS", sequence: 100, amountType: "FORMULA", formula: "BASIC + HRA + DA + SA" },
  { name: "PF (Employee)", code: "PF_EMP", category: "DEDUCTION", sequence: 200, amountType: "FORMULA", formula: "BASIC * 0.12" },
  { name: "Professional Tax", code: "PT", category: "DEDUCTION", sequence: 210, amountType: "FIXED", fixedAmount: 200 },
  { name: "ESI (Employee)", code: "ESI_EMP", category: "DEDUCTION", sequence: 220, amountType: "FORMULA", formula: "GROSS < 21000 ? GROSS * 0.0075 : 0" },
  { name: "Income Tax (TDS)", code: "TDS", category: "DEDUCTION", sequence: 230, amountType: "FORMULA", formula: "GROSS > 50000 ? GROSS * 0.1 : 0" },
  { name: "Net Salary", code: "NET", category: "NET", sequence: 999, amountType: "FORMULA", formula: "GROSS - PF_EMP - PT - ESI_EMP - TDS" },
];

// ========================== MAIN SEED ==========================

async function seed() {
  console.log("🌱 PeoplePay360 Seeder — Starting...");
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set");

  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");

  // ---------- DROP ----------
  console.log("🗑️  Dropping all collections...");
  const collections = await mongoose.connection.db!.listCollections().toArray();
  for (const col of collections) {
    await mongoose.connection.db!.dropCollection(col.name);
  }
  console.log("   Done.");

  const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 12);
  const businessLogs: any[] = [];

  // ==================== 1. ROLES ====================
  console.log("1️⃣  Seeding Roles...");
  const roleMap: Record<string, any> = {};
  for (const def of ROLE_DEFS) {
    const role = await Role.create(def);
    roleMap[def.name] = role;
  }
  console.log(`   ✅ ${Object.keys(roleMap).length} roles created`);

  // ==================== 2. DEPARTMENTS ====================
  console.log("2️⃣  Seeding Departments...");
  const deptMap: Record<string, any> = {};

  // Top-level first
  for (const def of DEPT_DEFS.filter(d => !d.parent)) {
    const dept = await Department.create({ name: def.name, parentDepartmentId: null, managerId: null });
    deptMap[def.name] = dept;
  }
  // Sub-departments
  for (const def of DEPT_DEFS.filter(d => d.parent)) {
    const dept = await Department.create({
      name: def.name,
      parentDepartmentId: deptMap[def.parent!]._id,
      managerId: null,
    });
    deptMap[def.name] = dept;
  }
  console.log(`   ✅ ${Object.keys(deptMap).length} departments created`);

  // ==================== 3. JOB POSITIONS ====================
  console.log("3️⃣  Seeding Job Positions...");
  const jobMap: Record<string, any> = {};
  for (const def of JOB_DEFS) {
    const dept = deptMap[def.dept];
    const job = await JobPosition.create({
      title: def.title,
      departmentId: dept?._id || null,
      expectedSalary: def.salary,
      isActive: true,
    });
    jobMap[def.title] = job;
  }
  console.log(`   ✅ ${Object.keys(jobMap).length} job positions created`);

  // ==================== 4. WORKING SCHEDULES ====================
  console.log("4️⃣  Seeding Working Schedules...");
  const scheduleMap: Record<string, any> = {};
  for (const def of SCHEDULE_DEFS) {
    const ws = new WorkingSchedule({ name: def.name, workingDays: def.workingDays });
    await ws.save(); // triggers pre-save hook for totalWeeklyHours
    scheduleMap[def.name] = ws;
  }
  console.log(`   ✅ ${Object.keys(scheduleMap).length} schedules created`);

  // ==================== 5. TIME OFF TYPES ====================
  console.log("5️⃣  Seeding Time Off Types...");
  const timeOffTypeMap: Record<string, any> = {};
  for (const def of TIMEOFF_TYPE_DEFS) {
    const t = await TimeOffType.create(def);
    timeOffTypeMap[def.name] = t;
  }
  console.log(`   ✅ ${Object.keys(timeOffTypeMap).length} time off types created`);

  // ==================== 6. SALARY RULES & STRUCTURES ====================
  console.log("6️⃣  Seeding Salary Rules & Structures...");
  const ruleIds: Types.ObjectId[] = [];
  for (const def of SALARY_RULE_DEFS) {
    const rule = await SalaryRule.create(def);
    ruleIds.push(rule._id as Types.ObjectId);
  }
  const salaryStructure = await SalaryStructure.create({
    name: "Standard Indian Payroll",
    ruleIds,
    isActive: true,
  });
  // A second structure for interns (simpler)
  const internRuleIds = ruleIds.filter((_, i) => [0, 4, 6, 9].includes(i)); // BASIC, GROSS, PT, NET
  const internStructure = await SalaryStructure.create({
    name: "Intern Stipend",
    ruleIds: internRuleIds,
    isActive: true,
  });
  console.log(`   ✅ ${SALARY_RULE_DEFS.length} rules, 2 structures created`);

  // ==================== 7. DEMO CREDENTIAL USERS ====================
  console.log("7️⃣  Creating 5 demo credential users (preserved in creds.md)...");

  const DEMO_USERS = [
    { email: "admin@peoplepay.com", name: "Admin User", role: "Admin" },
    { email: "hr.manager@peoplepay.com", name: "Priya HR Manager", role: "HR Manager" },
    { email: "payroll.user@peoplepay.com", name: "Rohit Payroll Viewer", role: "HR Payroll User" },
    { email: "payroll.manager@peoplepay.com", name: "Kavita Payroll Boss", role: "HR Payroll Manager" },
    { email: "employee@peoplepay.com", name: "Aarav Employee", role: "Employee" },
  ];

  const demoUserDocs: any[] = [];
  const demoEmployeeDocs: any[] = [];

  for (const du of DEMO_USERS) {
    const user = await User.create({
      email: du.email,
      password: SEED_PASSWORD, // User.create triggers userSchema pre('save') hook which hashes the plaintext password with bcrypt
      name: du.name,
      roleId: roleMap[du.role]._id,
      active: true,
    });

    // Create employee record for each demo user
    const deptForDemo =
      du.role === "Admin" ? deptMap["Engineering"] :
      du.role.startsWith("HR") ? deptMap["Human Resources"] :
      du.role.includes("Payroll") ? deptMap["Finance"] :
      deptMap["Engineering"];

    const jobForDemo =
      du.role === "Admin" ? jobMap["CTO"] :
      du.role === "HR Manager" ? jobMap["HR Manager"] :
      du.role === "HR Payroll User" ? jobMap["Accountant"] :
      du.role === "HR Payroll Manager" ? jobMap["Finance Manager"] :
      jobMap["Software Engineer"];

    const emp = await Employee.create({
      userId: user._id,
      name: du.name,
      workEmail: du.email,
      workPhone: genPhone(),
      departmentId: deptForDemo._id,
      jobPositionId: jobForDemo._id,
      managerId: null,
      joinDate: new Date(`${YEAR}-01-15`),
      bankAccount: `DEMO${rand(100000, 999999)}`,
      status: "Active",
    });

    await User.findByIdAndUpdate(user._id, { employeeId: emp._id });

    demoUserDocs.push(user);
    demoEmployeeDocs.push(emp);

    businessLogs.push({
      actorId: user._id,
      affectedEmployeeId: emp._id,
      action: "CREATE",
      entity: "EMPLOYEE",
      content: `Demo employee "${du.name}" created with role ${du.role}`,
      createdAt: new Date(`${YEAR}-01-15T10:00:00Z`),
    });
  }

  // Set admin as manager of the demo HR Manager
  await Employee.findByIdAndUpdate(demoEmployeeDocs[1]._id, { managerId: demoEmployeeDocs[0]._id });

  const adminUserId = demoUserDocs[0]._id;
  const hrManagerUserId = demoUserDocs[1]._id;
  console.log(`   ✅ 5 demo users created`);

  // ---- The single SUPER ADMIN (distinct password, isSuperAdmin flag) ----
  const SUPER_ADMIN_PASSWORD = "Super@1234";
  const superAdminUser = await User.create({
    email: "superadmin@peoplepay.com",
    password: SUPER_ADMIN_PASSWORD, // hashed by the user pre-save hook
    name: "Super Admin",
    roleId: roleMap["Super Admin"]._id,
    isSuperAdmin: true,
    active: true,
  });
  const superAdminEmp = await Employee.create({
    userId: superAdminUser._id,
    name: "Super Admin",
    workEmail: "superadmin@peoplepay.com",
    workPhone: genPhone(),
    departmentId: deptMap["Engineering"]._id,
    jobPositionId: jobMap["CTO"]._id,
    managerId: null,
    joinDate: new Date(`${YEAR}-01-01`),
    bankAccount: `DEMO${rand(100000, 999999)}`,
    status: "Active",
  });
  await User.findByIdAndUpdate(superAdminUser._id, { employeeId: superAdminEmp._id });
  businessLogs.push({
    actorId: superAdminUser._id,
    affectedEmployeeId: superAdminEmp._id,
    action: "CREATE",
    entity: "EMPLOYEE",
    content: `Super Admin account "Super Admin" created`,
    createdAt: new Date(`${YEAR}-01-01T09:00:00Z`),
  });
  console.log(`   ✅ Super Admin created (superadmin@peoplepay.com)`);

  // ==================== 8. BULK USERS + EMPLOYEES ====================
  console.log("8️⃣  Seeding ~1500 bulk users + employees...");

  const TOTAL_EMPLOYEES = 1500;
  const allEmployeeIds: Types.ObjectId[] = demoEmployeeDocs.map((e: any) => e._id);
  const allEmployeeDeptMap: Record<string, Types.ObjectId> = {};
  const allEmployeeJobMap: Record<string, Types.ObjectId> = {};
  const employeesWithoutBank: Types.ObjectId[] = [];

  // Pre-generate unique emails
  const usedEmails = new Set(DEMO_USERS.map(d => d.email));

  const deptNames = Object.keys(deptMap);
  const jobTitles = Object.keys(jobMap);

  const bulkUsers: any[] = [];
  const bulkEmployees: any[] = [];

  for (let i = 0; i < TOTAL_EMPLOYEES; i++) {
    const { first, last, full } = genName();
    let email = `${first.toLowerCase()}.${last.toLowerCase()}${rand(1, 9999)}@peoplepay.com`;
    while (usedEmails.has(email)) {
      email = `${first.toLowerCase()}.${last.toLowerCase()}${rand(1, 99999)}@peoplepay.com`;
    }
    usedEmails.add(email);

    // Role distribution: 85% Employee, 5% HR Manager, 4% HR Payroll User, 4% HR Payroll Manager, 2% Admin
    let roleName: string;
    const r = Math.random() * 100;
    if (r < 85) roleName = "Employee";
    else if (r < 90) roleName = "HR Manager";
    else if (r < 94) roleName = "HR Payroll User";
    else if (r < 98) roleName = "HR Payroll Manager";
    else roleName = "Admin";

    const userId = oid();
    const empId = oid();

    const deptName = pick(deptNames);
    const dept = deptMap[deptName];

    // Try to pick a job that belongs to this department, fallback to random
    const deptJobs = JOB_DEFS.filter(j => j.dept === deptName);
    const jobTitle = deptJobs.length > 0 ? pick(deptJobs).title : pick(jobTitles);
    const job = jobMap[jobTitle];

    // Join date: between Jan 2023 and Aug 2026
    const joinYear = rand(2023, YEAR);
    const joinMonth = joinYear === YEAR ? rand(1, 8) : rand(1, 12);
    const joinDay = rand(1, 28);
    const joinDate = new Date(`${joinYear}-${String(joinMonth).padStart(2, "0")}-${String(joinDay).padStart(2, "0")}`);

    // Status distribution: 90% Active, 5% Inactive, 5% Terminated
    let status: string;
    const s = Math.random() * 100;
    if (s < 90) status = "Active";
    else if (s < 95) status = "Inactive";
    else status = "Terminated";

    const bankAccount = genBankAccount();

    // Assign a manager: pick from first 100 employees or demo employees
    const managerPool = allEmployeeIds.length > 5 ? allEmployeeIds.slice(0, Math.min(100, allEmployeeIds.length)) : demoEmployeeDocs.map((e: any) => e._id);
    const managerId = chance(90) && managerPool.length > 0 ? pick(managerPool) : null;

    bulkUsers.push({
      _id: userId,
      email,
      password: hashedPassword,
      name: full,
      roleId: roleMap[roleName]._id,
      employeeId: empId,
      active: status !== "Terminated",
    });

    bulkEmployees.push({
      _id: empId,
      userId,
      name: full,
      workEmail: email,
      workPhone: genPhone(),
      departmentId: dept._id,
      jobPositionId: job._id,
      managerId,
      joinDate,
      bankAccount,
      status,
    });

    allEmployeeIds.push(empId);
    allEmployeeDeptMap[empId.toString()] = dept._id;
    allEmployeeJobMap[empId.toString()] = job._id;

    if (!bankAccount) {
      employeesWithoutBank.push(empId);
    }
  }

  // Bulk insert
  await User.insertMany(bulkUsers, { ordered: false });
  await Employee.insertMany(bulkEmployees, { ordered: false });
  console.log(`   ✅ ${TOTAL_EMPLOYEES} employees created`);

  // Business logs for bulk creation
  const creationLogs = bulkEmployees.map((e: any) => ({
    actorId: adminUserId,
    affectedEmployeeId: e._id,
    action: "CREATE",
    entity: "EMPLOYEE",
    content: `Employee "${e.name}" created`,
    createdAt: e.joinDate,
  }));
  businessLogs.push(...creationLogs);

  // ==================== 9. CONTRACTS ====================
  console.log("9️⃣  Seeding Contracts...");

  const allEmpIds = allEmployeeIds; // includes demo + bulk
  const activeEmpIds = bulkEmployees.filter((e: any) => e.status === "Active").map((e: any) => e._id);
  const contractDocs: any[] = [];

  // Running contracts for active employees + demo employees
  const activeRunningEmpIds = [...activeEmpIds, ...demoEmployeeDocs.map((e: any) => e._id)];

  for (const empId of activeRunningEmpIds) {
    const deptId = allEmployeeDeptMap[empId.toString()] || demoEmployeeDocs.find((e: any) => e._id.equals(empId))?.departmentId;
    const jobId = allEmployeeJobMap[empId.toString()] || demoEmployeeDocs.find((e: any) => e._id.equals(empId))?.jobPositionId;
    const scheduleName = chance(80) ? "Standard 9-to-6" : pick(Object.keys(scheduleMap));
    const wage = rand(20000, 200000);

    contractDocs.push({
      employeeId: empId,
      departmentId: deptId,
      jobPositionId: jobId,
      wage,
      startDate: new Date(`${YEAR}-01-01`),
      endDate: null,
      workingScheduleId: scheduleMap[scheduleName]._id,
      salaryStructureId: wage < 20000 ? internStructure._id : salaryStructure._id,
      status: "Running",
    });
  }

  // Historical expired contracts (200 random employees)
  const historicalEmps = pickN(activeEmpIds, 200);
  for (const empId of historicalEmps) {
    const deptId = allEmployeeDeptMap[empId.toString()];
    const jobId = allEmployeeJobMap[empId.toString()];
    contractDocs.push({
      employeeId: empId,
      departmentId: deptId,
      jobPositionId: jobId,
      wage: rand(15000, 100000),
      startDate: new Date("2024-01-01"),
      endDate: new Date("2025-12-31"),
      workingScheduleId: scheduleMap["Standard 9-to-6"]._id,
      salaryStructureId: salaryStructure._id,
      status: "Expired",
    });
  }

  // Draft contracts (50 random)
  const draftEmps = pickN(activeEmpIds, 50);
  for (const empId of draftEmps) {
    const deptId = allEmployeeDeptMap[empId.toString()];
    const jobId = allEmployeeJobMap[empId.toString()];
    contractDocs.push({
      employeeId: empId,
      departmentId: deptId,
      jobPositionId: jobId,
      wage: rand(30000, 250000),
      startDate: new Date(`${YEAR}-10-01`),
      endDate: null,
      workingScheduleId: scheduleMap["Standard 9-to-6"]._id,
      salaryStructureId: salaryStructure._id,
      status: "Draft",
    });
  }

  await Contract.insertMany(contractDocs, { ordered: false });
  console.log(`   ✅ ${contractDocs.length} contracts created`);

  // Contract business logs
  contractDocs.forEach((c: any) => {
    businessLogs.push({
      actorId: adminUserId,
      affectedEmployeeId: c.employeeId,
      action: "CREATE",
      entity: "CONTRACT",
      content: `Contract created (wage: ${c.wage}, status: ${c.status})`,
      createdAt: c.startDate,
    });
  });

  // ==================== 10. TIME OFF ALLOCATIONS ====================
  console.log("🔟  Seeding Time Off Allocations...");

  const allocationDocs: any[] = [];
  const allocatableTypes = TIMEOFF_TYPE_DEFS.filter(t => t.requiresAllocation);

  for (const empId of activeRunningEmpIds) {
    for (const typeDef of allocatableTypes) {
      const granted =
        typeDef.name === "Casual Leave" ? 12 :
        typeDef.name === "Sick Leave" ? 10 :
        typeDef.name === "Earned Leave" ? 15 : 10;
      const used = rand(0, Math.min(granted, 5));

      allocationDocs.push({
        employeeId: empId,
        timeOffTypeId: timeOffTypeMap[typeDef.name]._id,
        validityYear: YEAR,
        grantedDays: granted,
        usedDays: used,
      });
    }
  }

  await TimeOffAllocation.insertMany(allocationDocs, { ordered: false });
  console.log(`   ✅ ${allocationDocs.length} allocations created`);

  // ==================== 11. TIME OFF REQUESTS ====================
  console.log("1️⃣1️⃣  Seeding Time Off Requests...");

  const timeOffRequestDocs: any[] = [];
  const timeOffReviewLogs: any[] = [];

  // ~500 requests with varied statuses
  const requestEmps = pickN(activeEmpIds, 500);
  for (const empId of requestEmps) {
    const typeDef = pick(TIMEOFF_TYPE_DEFS);
    const typeDoc = timeOffTypeMap[typeDef.name];
    const daysReq = rand(1, 5);
    const startDay = rand(1, 30);
    const startDate = new Date(`${YEAR}-08-${String(Math.min(startDay, 28)).padStart(2, "0")}`);
    const endDate = addDays(startDate, daysReq - 1);

    // Status distribution: 40% APPROVED, 30% PENDING, 20% REJECTED, 10% edge cases
    const r = Math.random() * 100;
    let status: string;
    let reviewerId: Types.ObjectId | null = null;
    let reviewReason: string | undefined;

    if (r < 40) {
      status = "APPROVED";
      reviewerId = hrManagerUserId;
    } else if (r < 70) {
      status = "PENDING";
    } else {
      status = "REJECTED";
      reviewerId = hrManagerUserId;
      reviewReason = pick([
        "Insufficient leave balance",
        "Overlapping with team leave",
        "Critical project deadline",
        "Already on extended leave this quarter",
        "Request submitted too late — policy requires 3 days advance notice",
      ]);
    }

    const reqDoc: any = {
      employeeId: empId,
      timeOffTypeId: typeDoc._id,
      startDate,
      endDate,
      requestedDays: daysReq,
      status,
      reviewerId,
      reviewReason,
      isEditedByAdmin: chance(5),
    };

    timeOffRequestDocs.push(reqDoc);

    if (status !== "PENDING") {
      timeOffReviewLogs.push({
        actorId: reviewerId,
        affectedEmployeeId: empId,
        action: status === "APPROVED" ? "APPROVE" : "REJECT",
        entity: "LEAVE",
        content: `Time off request ${status.toLowerCase()}. Type: ${typeDef.name}, Days: ${daysReq}. ${reviewReason || ""}`.trim(),
        createdAt: addDays(startDate, -1),
      });
    }
  }

  await TimeOffRequest.insertMany(timeOffRequestDocs, { ordered: false });
  businessLogs.push(...timeOffReviewLogs);
  console.log(`   ✅ ${timeOffRequestDocs.length} time off requests created`);

  // ==================== 12. ATTENDANCE (35 days) ====================
  console.log("1️⃣2️⃣  Seeding Attendance (~35 days for ~1350 active employees)...");

  // We'll batch to avoid memory issues
  const BATCH_SIZE = 5000;
  let attendanceBatch: any[] = [];
  let exceptionBatch: any[] = [];
  let attendanceLogs: any[] = [];
  let totalAttendance = 0;
  let totalExceptions = 0;

  // Only active employees with running contracts
  const attendanceEmpIds = activeRunningEmpIds.slice(0, 1350); // cap for performance
  let currentDate = new Date(SEED_START);

  while (currentDate < SEED_END) {
    if (!isWeekday(currentDate)) {
      currentDate = addDays(currentDate, 1);
      continue;
    }

    const dateNorm = startOfDay(currentDate);

    for (const empId of attendanceEmpIds) {
      // 85% present, 5% absent (no record), 5% late, 3% half-day, 2% open session (forgot checkout)
      const roll = Math.random() * 100;

      if (roll < 5) continue; // Absent — no record at all

      const isLate = roll >= 85 && roll < 90;
      const isHalfDay = roll >= 90 && roll < 93;
      const isOpenSession = roll >= 93 && roll < 95;
      const isAdminEdited = roll >= 95 && roll < 97;

      // Check-in time with variation
      const baseCheckInHour = isLate ? rand(10, 11) : 9;
      const checkInMin = rand(0, 59);
      const checkInTime = new Date(dateNorm);
      checkInTime.setUTCHours(baseCheckInHour, checkInMin, rand(0, 59));

      let checkOut: any = undefined;
      let workedHours = 0;
      let sessionState = "CLOSED";
      let status = "Present";

      if (isOpenSession) {
        sessionState = "OPEN";
        status = "Present";
      } else if (isHalfDay) {
        const checkOutTime = new Date(dateNorm);
        checkOutTime.setUTCHours(13, rand(0, 30), 0);
        checkOut = {
          time: checkOutTime,
          location: { lat: 28.6139 + Math.random() * 0.01, lng: 77.2090 + Math.random() * 0.01, address: "Office HQ" },
        };
        workedHours = 4;
        status = "Half-Day";
      } else {
        // Normal or late checkout
        const checkOutHour = isLate ? rand(17, 18) : rand(17, 19);
        const checkOutTime = new Date(dateNorm);
        checkOutTime.setUTCHours(checkOutHour, rand(0, 59), 0);
        checkOut = {
          time: checkOutTime,
          location: { lat: 28.6139 + Math.random() * 0.01, lng: 77.2090 + Math.random() * 0.01, address: "Office HQ" },
        };
        workedHours = parseFloat(((checkOutTime.getTime() - checkInTime.getTime()) / 3600000).toFixed(2));
        status = isLate ? "Late" : "Present";
      }

      const attendanceDoc: any = {
        employeeId: empId,
        date: dateNorm,
        checkIn: {
          time: checkInTime,
          location: { lat: 28.6139 + Math.random() * 0.01, lng: 77.2090 + Math.random() * 0.01, address: "Office HQ" },
        },
        checkOut,
        workedHours,
        status,
        sessionState,
        isEditedByAdmin: isAdminEdited,
      };

      attendanceBatch.push(attendanceDoc);
      totalAttendance++;

      // Exceptions
      if (isOpenSession) {
        exceptionBatch.push({
          employeeId: empId,
          date: dateNorm,
          type: "MISSING_CHECKOUT",
          status: chance(30) ? "RESOLVED" : "PENDING_REVIEW",
          resolvedBy: chance(30) ? hrManagerUserId : undefined,
          resolutionReason: chance(30) ? "Employee confirmed late checkout at 19:30" : undefined,
        });
        totalExceptions++;
      }
      if (isLate) {
        exceptionBatch.push({
          employeeId: empId,
          date: dateNorm,
          type: "LATE",
          status: "PENDING_REVIEW",
        });
        totalExceptions++;
      }
      if (isAdminEdited) {
        attendanceLogs.push({
          actorId: hrManagerUserId,
          affectedEmployeeId: empId,
          action: "UPDATE",
          entity: "ATTENDANCE",
          content: `Attendance admin-edited for ${dateNorm.toISOString().split("T")[0]}`,
          createdAt: addDays(dateNorm, 1),
        });
      }

      // Flush batches
      if (attendanceBatch.length >= BATCH_SIZE) {
        await Attendance.insertMany(attendanceBatch, { ordered: false });
        attendanceBatch = [];
        if (exceptionBatch.length > 0) {
          await AttendanceException.insertMany(exceptionBatch, { ordered: false });
          exceptionBatch = [];
        }
        if (attendanceLogs.length > 0) {
          businessLogs.push(...attendanceLogs);
          attendanceLogs = [];
        }
        process.stdout.write(`   📊 ${totalAttendance} records...      \r`);
      }
    }

    currentDate = addDays(currentDate, 1);
  }

  // Final flush
  if (attendanceBatch.length > 0) {
    await Attendance.insertMany(attendanceBatch, { ordered: false });
  }
  if (exceptionBatch.length > 0) {
    await AttendanceException.insertMany(exceptionBatch, { ordered: false });
  }
  if (attendanceLogs.length > 0) {
    businessLogs.push(...attendanceLogs);
  }

  console.log(`   ✅ ${totalAttendance} attendance records, ${totalExceptions} exceptions created`);

  // ==================== 13. PAYRUNS & PAYSLIPS ====================
  console.log("1️⃣3️⃣  Seeding Payruns & Payslips...");

  // Fetch running contracts to create payslips from
  const runningContracts = await Contract.find({ status: "Running" }).lean();
  const contractByEmp: Record<string, any> = {};
  for (const c of runningContracts) {
    contractByEmp[c.employeeId.toString()] = c;
  }

  // August payrun — Paid
  const augPayrun = await Payrun.create({
    name: "August 2026 Payroll",
    periodStart: new Date(`${YEAR}-08-01`),
    periodEnd: new Date(`${YEAR}-08-31`),
    status: "Paid",
    departmentId: null,
    createdBy: adminUserId,
    paidAt: new Date(`${YEAR}-09-01T10:00:00Z`),
    warnings: employeesWithoutBank.slice(0, 20).map(eid => ({
      employeeId: eid,
      type: "MISSING_BANK_DETAILS" as const,
      message: "Employee is missing bank account details",
    })),
  });

  businessLogs.push({
    actorId: adminUserId,
    action: "CREATE",
    entity: "PAYROLL",
    content: `Payrun "August 2026 Payroll" created`,
    createdAt: new Date(`${YEAR}-08-28T10:00:00Z`),
  });
  businessLogs.push({
    actorId: adminUserId,
    action: "UPDATE",
    entity: "PAYROLL",
    content: `Payrun "August 2026 Payroll" marked as Paid`,
    createdAt: new Date(`${YEAR}-09-01T10:00:00Z`),
  });

  // Generate payslips for the Paid payrun (up to 1000 for performance)
  const payslipDocs: any[] = [];
  const payslipEmpIds = activeRunningEmpIds.slice(0, 1000);
  for (const empId of payslipEmpIds) {
    const contract = contractByEmp[empId.toString()];
    if (!contract || !contract.salaryStructureId) continue;

    const wage = contract.wage;
    const basic = wage * 0.5;
    const hra = basic * 0.4;
    const da = basic * 0.1;
    const sa = wage - basic - hra - da;
    const gross = basic + hra + da + sa;
    const pfEmp = basic * 0.12;
    const pt = 200;
    const esi = gross < 21000 ? gross * 0.0075 : 0;
    const tds = gross > 50000 ? gross * 0.1 : 0;
    const net = gross - pfEmp - pt - esi - tds;

    payslipDocs.push({
      payrunId: augPayrun._id,
      employeeId: empId,
      contractId: contract._id,
      salaryStructureId: contract.salaryStructureId,
      wage,
      periodStart: new Date(`${YEAR}-08-01`),
      periodEnd: new Date(`${YEAR}-08-31`),
      lineItems: [
        { ruleCode: "BASIC", ruleName: "Basic Salary", category: "EARNING", sequence: 10, amount: Math.round(basic) },
        { ruleCode: "HRA", ruleName: "House Rent Allowance", category: "EARNING", sequence: 20, amount: Math.round(hra) },
        { ruleCode: "DA", ruleName: "Dearness Allowance", category: "EARNING", sequence: 30, amount: Math.round(da) },
        { ruleCode: "SA", ruleName: "Special Allowance", category: "EARNING", sequence: 40, amount: Math.round(sa) },
        { ruleCode: "GROSS", ruleName: "Gross Salary", category: "GROSS", sequence: 100, amount: Math.round(gross) },
        { ruleCode: "PF_EMP", ruleName: "PF (Employee)", category: "DEDUCTION", sequence: 200, amount: Math.round(pfEmp) },
        { ruleCode: "PT", ruleName: "Professional Tax", category: "DEDUCTION", sequence: 210, amount: pt },
        { ruleCode: "ESI_EMP", ruleName: "ESI (Employee)", category: "DEDUCTION", sequence: 220, amount: Math.round(esi) },
        { ruleCode: "TDS", ruleName: "Income Tax (TDS)", category: "DEDUCTION", sequence: 230, amount: Math.round(tds) },
        { ruleCode: "NET", ruleName: "Net Salary", category: "NET", sequence: 999, amount: Math.round(net) },
      ],
      grossSalary: Math.round(gross),
      totalDeductions: Math.round(pfEmp + pt + esi + tds),
      netSalary: Math.round(net),
      status: "Paid",
    });
  }

  if (payslipDocs.length > 0) {
    // Insert in batches
    for (let i = 0; i < payslipDocs.length; i += BATCH_SIZE) {
      await Payslip.insertMany(payslipDocs.slice(i, i + BATCH_SIZE), { ordered: false });
    }
  }
  console.log(`   ✅ August payrun + ${payslipDocs.length} payslips (Paid)`);

  // September Draft payrun
  const sepPayrun = await Payrun.create({
    name: "September 2026 Payroll",
    periodStart: new Date(`${YEAR}-09-01`),
    periodEnd: new Date(`${YEAR}-09-30`),
    status: "Draft",
    departmentId: null,
    createdBy: adminUserId,
    warnings: [],
  });

  businessLogs.push({
    actorId: adminUserId,
    action: "CREATE",
    entity: "PAYROLL",
    content: `Payrun "September 2026 Payroll" created as Draft`,
    createdAt: new Date(`${YEAR}-09-03T10:00:00Z`),
  });

  // A Cancelled payrun for July (edge case)
  await Payrun.create({
    name: "July 2026 Payroll (Cancelled)",
    periodStart: new Date(`${YEAR}-07-01`),
    periodEnd: new Date(`${YEAR}-07-31`),
    status: "Cancelled",
    departmentId: null,
    createdBy: adminUserId,
    warnings: [],
  });

  businessLogs.push({
    actorId: adminUserId,
    action: "UPDATE",
    entity: "PAYROLL",
    content: `Payrun "July 2026 Payroll" cancelled — incorrect period scope`,
    createdAt: new Date(`${YEAR}-07-15T10:00:00Z`),
  });

  // Dept-scoped payrun (engineering only, Computed state)
  const engPayrun = await Payrun.create({
    name: "Engineering Q3 Bonus Run",
    periodStart: new Date(`${YEAR}-07-01`),
    periodEnd: new Date(`${YEAR}-09-30`),
    status: "Computed",
    departmentId: deptMap["Engineering"]._id,
    createdBy: adminUserId,
    warnings: [],
  });

  console.log(`   ✅ 4 payruns total (Paid, Draft, Cancelled, Computed)`);

  // ==================== 14. DEPARTMENT MANAGER ASSIGNMENTS ====================
  console.log("1️⃣4️⃣  Assigning Department Managers...");
  // Assign first demo employee (Admin/CTO) to Engineering
  await Department.findByIdAndUpdate(deptMap["Engineering"]._id, { managerId: demoEmployeeDocs[0]._id });
  // Assign HR Manager demo to HR
  await Department.findByIdAndUpdate(deptMap["Human Resources"]._id, { managerId: demoEmployeeDocs[1]._id });
  console.log(`   ✅ Department managers assigned`);

  // ==================== 15. BUSINESS LOGS (BULK INSERT) ====================
  console.log("1️⃣5️⃣  Inserting Business Logs...");

  // Add some extra varied admin logs
  const extraLogs = [
    { actorId: adminUserId, action: "CREATE", entity: "EMPLOYEE", content: "Department 'Engineering' created", createdAt: new Date(`${YEAR}-01-01T08:00:00Z`) },
    { actorId: adminUserId, action: "CREATE", entity: "EMPLOYEE", content: "Department 'Human Resources' created", createdAt: new Date(`${YEAR}-01-01T08:05:00Z`) },
    { actorId: adminUserId, action: "CREATE", entity: "EMPLOYEE", content: "Department 'Finance' created", createdAt: new Date(`${YEAR}-01-01T08:10:00Z`) },
    { actorId: hrManagerUserId, action: "OVERRIDE", entity: "LEAVE", content: "Admin overrode leave balance for employee", createdAt: new Date(`${YEAR}-08-15T14:30:00Z`) },
    { actorId: hrManagerUserId, action: "UPDATE", entity: "ATTENDANCE", content: "Bulk attendance correction for 12 employees on Aug 10", createdAt: new Date(`${YEAR}-08-12T09:00:00Z`) },
    { actorId: adminUserId, action: "DELETE", entity: "CONTRACT", content: "Draft contract deleted — created in error", createdAt: new Date(`${YEAR}-08-20T11:00:00Z`) },
  ];
  businessLogs.push(...extraLogs);

  // Batch insert all logs
  for (let i = 0; i < businessLogs.length; i += BATCH_SIZE) {
    await BusinessLog.insertMany(businessLogs.slice(i, i + BATCH_SIZE), { ordered: false });
  }
  console.log(`   ✅ ${businessLogs.length} business logs created`);

  // ==================== SUMMARY ====================
  console.log("\n" + "=".repeat(60));
  console.log("🎉 SEEDING COMPLETE!");
  console.log("=".repeat(60));
  console.log(`   Roles:              ${ROLE_DEFS.length}`);
  console.log(`   Departments:        ${DEPT_DEFS.length}`);
  console.log(`   Job Positions:      ${JOB_DEFS.length}`);
  console.log(`   Working Schedules:  ${SCHEDULE_DEFS.length}`);
  console.log(`   Users+Employees:    ${TOTAL_EMPLOYEES + 6} (5 demo + 1 super admin + ${TOTAL_EMPLOYEES} bulk)`);
  console.log(`   Contracts:          ${contractDocs.length}`);
  console.log(`   Time Off Types:     ${TIMEOFF_TYPE_DEFS.length}`);
  console.log(`   Allocations:        ${allocationDocs.length}`);
  console.log(`   Time Off Requests:  ${timeOffRequestDocs.length}`);
  console.log(`   Attendance Records: ${totalAttendance}`);
  console.log(`   Exceptions:         ${totalExceptions}`);
  console.log(`   Salary Rules:       ${SALARY_RULE_DEFS.length}`);
  console.log(`   Salary Structures:  2`);
  console.log(`   Payruns:            4`);
  console.log(`   Payslips:           ${payslipDocs.length}`);
  console.log(`   Business Logs:      ${businessLogs.length}`);
  console.log("=".repeat(60));

  await mongoose.disconnect();
  console.log("✅ Disconnected. Done.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
