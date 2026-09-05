# PeoplePay360 — Advay's Build (branch `advay-final`)

A complete HR & Payroll frontend (React + Vite + Tailwind, "Indigo Trust" theme) with a
minimal Express + MongoDB backend that houses the **attendance/leave-aware salary rule engine**.

Full PS feature cross-check: see [`FEATURES.md`](./FEATURES.md).

## What's here
- **`client/`** — React frontend. Modules: Login + RBAC (5 roles), Employees (List/Kanban/Form
  + smart buttons), Contracts, Working Schedules, Attendance (+ check-in kiosk), Time Off
  (Requests/Allocations/Types), Salary Structures & Rules, Payroll (2-step Payrun wizard →
  Compute/Validate/Mark Paid/Send → Payslip with PDF), and a Dashboard.
- **`server/`** — Express + Mongoose models + the payroll engine (`services/payrollEngine.js`,
  `services/formula.js`) with a passing test (`tests/engine.test.js`).

## Run the frontend (no backend needed — mock data on by default)
```bash
cd client
npm install
npm run dev        # http://localhost:5173
```
Login with a demo account (password `demo`): `admin@urban.co`, `hr@urban.co`,
`payroll@urban.co`, `rahul@urban.co`. Each role sees a different nav (RBAC).

To hit a real API instead of mock data, set `VITE_USE_MOCK=false` in `client/.env`
(the Vite dev server proxies `/api` → `http://localhost:5000`).

## Run the engine test
```bash
cd server
npm install
npm test           # verifies unpaid-leave / overtime flow into net pay
```

## Highlight
Compute a payrun → a payslip shows **worked days reduced by unpaid leave** and an
**Unpaid Leave deduction** computed live from leave data via a configured formula rule —
not hardcoded.
