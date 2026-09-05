PeoplePay360

From attendance to payday — connected, controlled, and explainable.

An integrated HR & Payroll Operations Platform built for the Odoo Hackathon 2026



Payroll should never be a black box.

PeoplePay360 connects employee records, contracts, schedules, attendance, leave and configurable salary rules into one operational flow — then validates the result before money leaves the company.

Most HR systems can store employee information.

PeoplePay360 is built to make that information work together.

A contract defines the employment terms. A schedule defines expected work. Attendance and approved leave capture what actually happened. Salary structures and ordered salary rules transform those records into a payslip. Before payroll is finalized, the system checks for problems such as missing bank details, duplicate payslips, invalid contracts and incomplete payroll data.

EMPLOYEE DATA → WORK REALITY → PAYROLL RULES → VALIDATION → PAYSLIP → REPORTING

We do not just generate payslips. We prove how they were produced.


The Problem:

Payroll becomes risky when employee information is split across disconnected records or systems.

A real payroll team must answer questions such as:

Which contract applies to this payroll period?

What schedule was this employee expected to follow?

Were attendance records complete?

Was leave approved and was the allocation balance updated?

Which salary structure and rules apply?

Were rules executed in the correct order?

Is this payslip a duplicate?

Can this payroll safely be finalized?

A beautiful dashboard cannot answer these questions if the underlying business logic is fake.

PeoplePay360 is designed around the opposite principle:

Real data + real relationships + real permissions + real calculations + real workflow.

💡 The Solution:

PeoplePay360 turns HR and payroll into a single connected operating flow.

flowchart TD
    E[Employee] --> C[Contract]
    C --> S[Working Schedule]
    S --> A[Attendance]
    E --> L[Time Off]
    C --> SS[Salary Structure]
    SS --> SR[Ordered Salary Rules]
    A --> P[Payroll Inputs]
    L --> P
    SR --> P
    C --> P
    P --> PR[Payrun]
    PR --> V{Pre-finalization Validation}
    V -->|Issues found| R[Review & Resolve]
    R --> V
    V -->|Ready| PS[Payslip]
    PS --> PD[PDF / Delivery]
    PS --> D[Live Payroll Dashboard]

The employee is the operational hub — not one isolated CRUD record among many.

##  Why PeoplePay360 Stands Out

1. Period-Aware Payroll

Payroll does not blindly use a single current_salary value.

It resolves the employment contract that applies to the selected payroll period.

Contract A: Jan → Jun     ₹40,000
Contract B: Jul → Dec     ₹50,000

June Payroll      → Contract A
September Payroll → Contract B

This protects historical correctness and prevents a common class of payroll errors.

2. Configurable Salary Rule Engine

Salary structures are not decorative configuration screens.

They actively determine how payslips are calculated.

Sequence 10 → BASIC
Sequence 20 → ALLOWANCES
Sequence 30 → GROSS
Sequence 40 → DEDUCTIONS
Sequence 50 → NET

Rules can use:

Fixed amounts

Percentages

Formulas

Ordered dependencies

Later calculations can depend on values produced by earlier rules.

Configuration changes behavior. That is the point.

3. Payroll Pre-Finalization Validation ⭐:

The strongest demo moment in PeoplePay360 is not an animation.

It is the system refusing to let bad payroll quietly pass through.

PAYRUN — SEPTEMBER 2026
────────────────────────────────────
Employees                    24
Payslips                     24

Validation
✅ Valid contracts            24/24
✅ Salary structures          24/24
⚠ Missing bank details        2
⚠ Missing check-outs          3
🔴 Duplicate payslip          1
────────────────────────────────────
              [ REVIEW ISSUES ]


Each warning is generated from actual system records and should lead users directly to the affected data.

Catch the mistake before payday — not after it.

4. Attendance and Leave Are Not Side Modules

Attendance remains available for payroll and reporting.

Approved leave consumes the employee's allocation automatically when required.

Leave Request
      ↓
Manager Approval
      ↓
Allocation Balance Changes
      ↓
Employee Record Updates
      ↓
Payroll / Dashboard Uses Current State

The important part is the connection, not the number of screens.

Historical Payroll Is Protected

Paid/finalized payroll is operational history.

PeoplePay360 is designed so historical results are preserved instead of silently recalculated every time a current record changes.

Because payroll is not just data.

It is an auditable business decision.

🧩 Core Modules

Module

What it does

Why it matters

👤 Employees

Kanban, list and form views with department, manager, schedule, position and status

Creates one operational employee hub

📄 Contracts

Historical employment terms, wages, dates and salary structure

Ensures payroll uses the correct period-specific terms

🕒 Working Schedules

Weekly day/start/end/break patterns with calculated hours

Establishes expected work time

✅ Attendance

Check-in, check-out, worked hours, status and authorized corrections

Captures work reality and exceptions

🌴 Time Off

Types, allocations, requests, approvals and balance consumption

Keeps leave policy and balances synchronized

🧮 Salary Structures

Ordered collections of salary rules

Makes payroll configurable instead of hardcoded

⚙️ Salary Rules

Basic, allowances, gross, deductions and net calculations

Powers real payslip computation

💰 Payruns

Scope/period → employee selection → compute → validate → pay

Controls the payroll lifecycle

🧾 Payslips

Rule-level breakdown, worked days, status and history

Makes payroll understandable and reviewable

📤 Delivery

Individual PDF payslips and bulk send workflow

Completes the employee-facing payroll process

📊 Dashboard

Payroll, attendance, leave and departmental analytics from live records

Turns operations into decision-ready information.


👥 Role-Based Access

PeoplePay360 separates responsibilities instead of giving every user every permission.

Role

HR Data

Time Off

Payruns/Payslips

Salary Rules

Administration

Employee

Own records only

Request / view own

❌

❌

❌

HR Manager

Full HR CRUD

Approve / refuse

❌

❌

❌

HR Payroll User

✅

✅

Create / Read / Update

Read-only

❌

HR Payroll Manager

✅

✅

Full control

Full control

Payroll config

Admin

✅

✅

✅

✅

✅

Security principle

Hidden buttons are not security.

Permissions must also be enforced through backend access rules, groups and record-level restrictions.

🧠 The Payroll Dependency Chain

A PeoplePay360 payslip is the result of a traceable dependency chain:

flowchart LR
    PP[Payroll Period] --> AC[Applicable Contract]
    AC --> ST[Salary Structure]
    ST --> RR[Ordered Salary Rules]
    AT[Attendance / Work Inputs] --> RR
    TO[Approved Time Off] --> RR
    RR --> CO[Computation]
    CO --> WL[Warnings / Validation]
    WL --> SL[Payslip]

In plain English:

Period
→ Correct Contract
→ Salary Structure
→ Ordered Rules
→ Attendance / Leave Inputs
→ Computation
→ Validation
→ Payslip

Every rupee should have a reason.

🚦 Payrun Lifecycle

stateDiagram-v2
    [*] --> Draft
    Draft --> Created: Select scope + employees
    Created --> Computed: Compute
    Computed --> Review: Warnings found
    Review --> Computed: Issues resolved
    Computed --> Validated: Validation passes
    Validated --> Paid: Mark Paid
    Paid --> [*]

Typical actions:

Select salary structure and payroll period.

Continue to eligible employee selection.

Explicitly choose employees.

Create the Payrun.

Compute Payslips.

Review warnings.

Validate.

Mark Paid.

Generate/send Payslips.

Preserve history.

🧯 Errors We Intentionally Catch

PeoplePay360 treats payroll validation as a business feature, not an afterthought.

Examples include:

Duplicate payslip for the same employee and period

Missing bank details

Missing or invalid applicable contract

Overlapping/concurrent contracts

Incomplete required employee information

Attendance exceptions such as missing check-out

Invalid leave allocation state

Incorrect employee scope in a Payrun

Invalid workflow transitions

Unauthorized payroll operations

A warning should be actionable, not decorative.

📊 Live Payroll Dashboard

The dashboard must reflect the actual state of HR and payroll records.

Key metrics

Total Net Salary Paid

Payslips Generated

Average Salary

Approved Time Off

Attendance Health

Analytics

Salary Cost by Department

Monthly Net Salary Trend

Attendance Status Overview

Time-Off Patterns

Payroll Warnings

Headcount vs Salary Expenditure

Filters

Period

Department

Employee Type

Database / Odoo Records
        ↓
Real Query / Aggregation
        ↓
Calculated Result
        ↓
Dashboard

Not:

Hardcoded Number
      ↓
Pretty Chart

🛡️ Odoo-First Engineering

PeoplePay360 follows an Odoo-first review philosophy:

Prefer Odoo ORM for application data operations

Model business relationships using relational fields

Keep domain models logically separated

Use Odoo views, actions and security mechanisms appropriately

Respect access rights and record rules

Keep critical business rules in backend logic

Validate impossible states before they reach payroll

Protect historical/finalized data

Prevent accidental duplicate operations

Keep the code understandable enough to explain live to judges

Correctness before cosmetics.

A clean interface matters — but a beautiful wrong payslip is still wrong.

🧱 Conceptual Architecture

flowchart TB
    UI[Odoo Views / Actions / Wizards]
    SEC[Groups • ACLs • Record Rules]
    MODEL[Odoo Business Models]
    LOGIC[Business Rules & Constraints]
    ORM[Odoo ORM]
    DB[(PostgreSQL)]
    REP[Reports / Payslip PDF]
    MAIL[Mail / Payslip Delivery]
    DASH[Live Reporting Dashboard]

    UI --> MODEL
    SEC --> MODEL
    MODEL --> LOGIC
    LOGIC --> ORM
    ORM --> DB
    MODEL --> REP
    MODEL --> MAIL
    DB --> DASH

The architecture is intentionally business-first:

USER ACTION
    ↓
VIEW / WIZARD
    ↓
AUTHORIZATION
    ↓
BUSINESS RULE
    ↓
ODOO ORM
    ↓
DATABASE
    ↓
RELATED STATE / REPORTING UPDATE

🧪 Quality Gate

Our review rule is simple:

A feature is not complete because the screen exists.

For meaningful changes we review:

Correctness

Does the business operation actually work?

Is the right contract selected?

Are salary rules executed in the right order?

Are historical records safe?

Security

Is the user authenticated?

Is the operation authorized?

Does record-level access match the role?

Can a direct backend call bypass the UI?

Data Integrity

Can the user create duplicates by double-clicking?

What happens if a multi-record operation fails halfway?

Are impossible states blocked?

Testing

Happy path

Invalid input

Boundary case

Unauthorized role

Regression check

Demo Safety

No fake business logic

No fabricated dashboard values

No feature claimed as complete when only its UI exists

No unnecessary technology added only for hype



