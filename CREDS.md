# 🔐 PeoplePay360 — Demo Credentials

> ⚠️ **DO NOT DELETE** these users from the database. They are pinned seed accounts used for development, testing, and demo purposes.

## 👑 Super Admin (the single elevated account)

There is exactly **one** super admin for the business. It has everything an Admin has, **plus** exclusive powers regular admins do **not** have:

- Create, edit, and delete **admin roles** and their permissions
- **Promote** any user to an admin role
- **Demote** an admin to a non-admin role

Regular admins cannot do any of the above to each other — only the super admin can.

| Role | Email | Password | Name |
|------|-------|----------|------|
| **Super Admin** | `superadmin@peoplepay.com` | `Super@1234` | Super Admin |

> The super admin is distinguished by the `isSuperAdmin` flag on the user (set only by the seeder — no API can grant it), so there is structurally only one.

---

## Shared Password

All demo accounts use the same password:

```
Test@1234
```

---

## Demo Accounts

| # | Role | Email | Name | Access Scope |
|---|------|-------|------|-------------|
| 1 | **Admin** | `admin@peoplepay.com` | Admin User | Full access — bypasses all permission checks via `isAdmin` flag |
| 2 | **HR Manager** | `hr.manager@peoplepay.com` | Priya HR Manager | Employee, Organization, Contract, Attendance, Time Off (CRUD + Approve), Audit Logs |
| 3 | **HR Payroll User** | `payroll.user@peoplepay.com` | Rohit Payroll Viewer | Read-only access to Payroll, Employees, Contracts, Attendance, Time Off |
| 4 | **HR Payroll Manager** | `payroll.manager@peoplepay.com` | Kavita Payroll Boss | Payroll CRUD, Contracts CRUD, read access to Employees, Attendance, Time Off, Audit Logs |
| 5 | **Employee** | `employee@peoplepay.com` | Aarav Employee | Self-service only — own profile, clock in/out, raise leave, view own attendance |

---

## Permission Matrix

| Permission Key | Employee | HR Manager | HR Payroll User | HR Payroll Manager | Admin |
|----------------|:--------:|:----------:|:---------------:|:------------------:|:-----:|
| `Employee.Read` | ✅ | ✅ | ✅ | ✅ | ✅* |
| `Employee.Write` | ❌ | ✅ | ❌ | ❌ | ✅* |
| `Organization.Read` | ❌ | ✅ | ❌ | ❌ | ✅* |
| `Organization.Write` | ❌ | ✅ | ❌ | ❌ | ✅* |
| `Contract.Read` | ❌ | ✅ | ✅ | ✅ | ✅* |
| `Contract.Write` | ❌ | ✅ | ❌ | ✅ | ✅* |
| `Attendance.Read` | ✅ | ✅ | ✅ | ✅ | ✅* |
| `Attendance.Write` | ❌ | ✅ | ❌ | ❌ | ✅* |
| `TimeOff.Read` | ✅ | ✅ | ✅ | ✅ | ✅* |
| `TimeOff.Write` | ❌ | ✅ | ❌ | ❌ | ✅* |
| `TimeOff.Approve` | ❌ | ✅ | ❌ | ❌ | ✅* |
| `Payroll.Read` | ❌ | ❌ | ✅ | ✅ | ✅* |
| `Payroll.Write` | ❌ | ❌ | ❌ | ✅ | ✅* |
| `Settings.Read` | ❌ | ❌ | ❌ | ❌ | ✅* |
| `Settings.Write` | ❌ | ❌ | ❌ | ❌ | ✅* |
| `Audit.Read` | ❌ | ✅ | ❌ | ✅ | ✅* |

> \* Admin has `isAdmin: true` which bypasses all explicit permission checks.

---

## Seeding

To re-seed the database with fresh data:

```bash
cd server
npx ts-node src/scripts/seed.ts
```

> ⚠️ This drops ALL existing data and re-creates everything from scratch (~1505 employees, 35 days of attendance, payruns, payslips, etc.)

---

## Data Volume Summary

| Collection | Approximate Count |
|---|---|
| Users + Employees | ~1,505 |
| Departments | 12 |
| Job Positions | 32 |
| Working Schedules | 4 |
| Contracts | ~1,750 |
| Time Off Types | 6 |
| Time Off Allocations | ~4,000 |
| Time Off Requests | ~500 |
| Attendance Records | ~32,000+ |
| Attendance Exceptions | ~3,000+ |
| Salary Rules | 10 |
| Salary Structures | 2 |
| Payruns | 4 |
| Payslips | ~1,000 |
| Business Logs | ~5,000+ |
