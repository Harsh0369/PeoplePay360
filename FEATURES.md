# PeoplePay360 — PS Feature Cross-Check

Every feature from the problem statement, mapped to its module. ✅ built · 🟡 partial · ⬜ pending
(Frontend runs on mock data via `VITE_USE_MOCK=true`; backend teammate swaps in the real API.)

## 0. Login & User Access (RBAC)  → `features/auth`
- ✅ Login (email/password) with demo accounts
- ✅ User Management — create users, assign roles, link to employee
- ✅ 5 roles gate the nav & routes: Employee, HR Manager, HR Payroll User, HR Payroll Manager, Admin

## 1. Employee Management  → `features/employees`
- ✅ Kanban + List + Form views
- ✅ department, manager, job position, schedule, status, type
- ✅ Smart buttons → Contracts / Attendance / Time Off
- ✅ Bank account (missing → payroll warning)

## 2. Contract Management  → `features/contracts`
- ✅ Contracts per employee; active (running) highlighted
- ✅ Form: dates, wage, dept, position, schedule, salary structure
- ✅ Period-applicable contract used by payroll (backend `Contract.findForPeriod`)

## 3. Working Schedule  → `features/schedules`
- ✅ List (name, type, days/week, hours/week, status) + Form
- ✅ Weekly pattern: day, start, end, break
- ✅ Weekly hours auto-calculated (not manual)

## 4. Time Off  → `features/timeoff`
- ✅ Types (unit, allocation-required, approval, paid/unpaid)
- ✅ Allocations (allocated / taken / remaining)
- ✅ Requests (approve/refuse workflow)
- ✅ Approved leave consumes allocation balance

## 5. Attendance  → `features/attendance`
- ✅ List (Check In, Check Out, Worked Hours, Status)
- ✅ Manual-correction form
- ✅ Check-in/out kiosk widget
- ✅ Feeds payroll (unpaid days, overtime) + dashboard

## 6. Salary Structures & Rules  → `features/config`
- ✅ Structure (container of rules; ordered)
- ✅ Rule (Name, Code, Category, Sequence)
- ✅ Categories: Basic, Allowance, Gross, Deduction, Net
- ✅ Compute: Fixed / Percentage / Formula (live-validated, attendance-aware)
- ✅ Engine drives payslips (`lib/payrollEngine.js`, matches backend + tests)

## 7. Payroll — Payruns & Payslips  → `features/payroll`
- ✅ 2-step wizard (scope/structure/period → select employees)
- ✅ Processing: Compute · Validate · Mark Paid · Send Payslips
- ✅ Warnings before finalize (missing bank details, no contract)
- ✅ Payslip breakdown (Basic / Allowances / Deductions / Gross / Net + worked days)
- ✅ Payslip PDF (print) + bulk email action
- ✅ State machine draft→computed→validated→paid (paid = locked history)

## 8. Payroll Dashboard  → `pages/Dashboard`
- ✅ KPI cards, Salary-by-Department chart, Payroll Alerts
- 🟡 Monthly net trend + filters (Period/Dept/Type)
- ⬜ Bind to live data (currently sample) — do after backend API is live
