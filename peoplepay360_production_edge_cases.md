# PeoplePay360 — Production-Grade HRMS Edge Cases, Error Handling & UX Rulebook

> This document is the detailed engineering specification for PeoplePay360.
> It expands the official Problem Statement into production-grade behavior for
> edge cases, robustness, security, auditability, error handling and UX.
>
> **Primary source:** the official PeoplePay360 PS supplied for the hackathon.
> **Scope:** required PS features plus production-grade considerations and
> optional enhancements clearly labelled as such.

---

# 1. SOURCE OF TRUTH

The PeoplePay360 PS requires an integrated employee-to-payslip workflow and explicitly prioritizes business logic, data relationships, accurate payroll computation, role-based permissions, historical records and live reporting over surface-level UI.

Required areas:

- Employee Master Management
- Contract Management
- Working Schedule Setup
- Time Off Types, Allocations and Requests
- Salary Structures
- Salary Rules
- Payrun Creation and Processing
- Payslips and Salary Computation
- Payslip PDF and Employee Delivery
- Payroll Dashboard and Reporting
- Role-based access

The PS explicitly permits any backend language, frontend framework and database technology.

### Requirement labels used in this document

**P0 — Required / critical**

Must work before submission.

**P1 — Strongly recommended**

Important production-grade behavior or a high-value enhancement.

**P2 — Optional**

Useful if P0/P1 are stable.

**FUTURE**

Documented extension; do not destabilize the hackathon MVP.

---

# 2. CORE ENGINEERING PRINCIPLES

## 2.1 Do not model HR as CRUD

The system should behave as an operational workflow:

```text
Master Data
    ↓
Operational Events
    ↓
Validation
    ↓
Business Interpretation
    ↓
Approval
    ↓
Payroll Impact
    ↓
Finalization
    ↓
Historical Record
    ↓
Reporting
```

A database record existing does not mean the business operation is valid.

---

## 2.2 Preserve facts; derive interpretation

Especially for attendance.

Example:

```text
Raw punch:
09:17

Derived:
Scheduled start = 09:00
Raw lateness = 17 min
Grace = 10 min
Policy lateness = 7 min
```

Never rewrite the raw punch to make it look like 09:00.

Store who/what/when/how and derive policy outcomes.

---

## 2.3 Configuration drives behavior

Avoid magic constants.

Bad:

```text
lateGrace = 10
```

when policy is configurable.

Better:

```text
Attendance Policy
    ├── lateGrace
    ├── earlyCheckoutGrace
    ├── overtimeThreshold
    └── autoCheckoutAfter
```

Likewise salary calculations must come from Salary Structures and Salary Rules rather than employee-specific hardcoded values.

---

## 2.4 Server is authoritative

The client may request an action.

The server decides whether it is valid.

Never trust the client for:

- user identity
- employee identity
- role
- payroll amount
- leave balance
- attendance state
- contract selection
- final payment state
- authorization

---

## 2.5 State-changing actions must tolerate retries

Important operations can be repeated because of:

- double click
- network retry
- browser refresh
- mobile retry
- user opening two tabs
- concurrent users

Examples:

```text
Punch In
Punch Out
Approve Leave
Create Payrun
Compute Payrun
Validate Payrun
Mark Paid
Send Payslips
Approve Correction
```

Use business-state checks plus idempotency where appropriate.

---

## 2.6 Fail securely, fail gracefully

Security uncertainty:

```text
DENY
```

Operational failure:

```text
Preserve valid state
+
show useful error
+
give recovery path
```

Never destroy data merely because an external dependency failed.

---

# 3. GLOBAL API ERROR HANDLING

## 3.1 Three levels of errors

### Employee-facing

Simple and actionable:

> You are already checked in at 9:04 AM.

### HR/operator-facing

More context:

> Rahul has an unresolved missing-checkout exception for 5 Sep.

### Server logs

Technical context:

- request/correlation ID
- actor ID
- operation
- target record
- error class
- stack trace

Never send stack traces to users.

---

## 3.2 Stable domain error codes

Recommended examples:

```text
AUTH_INVALID_CREDENTIALS
AUTH_OTP_EXPIRED
AUTH_OTP_ATTEMPTS_EXCEEDED

EMPLOYEE_NOT_FOUND
EMPLOYEE_ARCHIVED
EMPLOYEE_INVALID_MANAGER

CONTRACT_OVERLAP
CONTRACT_NOT_APPLICABLE
CONTRACT_MISSING

SCHEDULE_INVALID_INTERVAL
SCHEDULE_OVERLAP

ATTENDANCE_ALREADY_OPEN
ATTENDANCE_NO_OPEN_SESSION
ATTENDANCE_MISSING_CHECKOUT
ATTENDANCE_INVALID_RANGE
ATTENDANCE_CONFLICT
ATTENDANCE_LOCATION_EXCEPTION

TIME_OFF_INSUFFICIENT_BALANCE
TIME_OFF_OVERLAP
TIME_OFF_INVALID_RANGE
TIME_OFF_ALREADY_APPROVED

SALARY_RULE_INVALID_SEQUENCE
SALARY_RULE_MISSING_DEPENDENCY
SALARY_RULE_CIRCULAR_DEPENDENCY
SALARY_RULE_COMPUTATION_ERROR

PAYRUN_INVALID_PERIOD
PAYRUN_NO_EMPLOYEES
PAYRUN_DUPLICATE
PAYRUN_UNRESOLVED_WARNING
PAYRUN_COMPUTATION_FAILED
PAYRUN_ALREADY_PAID

PAYSLIP_MISSING_CONTRACT
PAYSLIP_INVALID_STRUCTURE
PAYSLIP_DUPLICATE

PDF_GENERATION_FAILED
EMAIL_PARTIAL_FAILURE
```

---

## 3.3 HTTP semantics

Recommended:

```text
400  malformed/invalid request
401  unauthenticated
403  authenticated but unauthorized
404  resource not found / not visible
409  state conflict
422  business validation failure
429  rate limit
500  unexpected server error
503  temporary dependency/service failure
```

Do not return HTTP 200 for every failure.

---

## 3.4 Problem Details

A consistent machine-readable error structure is recommended:

```json
{
  "type": "attendance/already-checked-in",
  "title": "Already checked in",
  "status": 409,
  "detail": "You are already checked in at 09:04 AM.",
  "code": "ATTENDANCE_ALREADY_OPEN",
  "instance": "request/01HX..."
}
```

IETF RFC 9457 defines Problem Details for machine-readable HTTP API errors and recommends that human-readable `detail` focus on helping the client correct the problem rather than exposing implementation details.

---

# 4. GLOBAL SECURITY

## 4.1 Authentication vs authorization

Authentication:

> Who are you?

Authorization:

> What are you allowed to do to this record?

Both are required.

---

## 4.2 Object-level authorization

For every endpoint that receives an employee/record ID:

```text
Authenticated user
        ↓
Role + organizational scope
        ↓
Target record
        ↓
Allow / deny
```

Never assume:

```http
GET /employees/:id
```

is safe just because the caller has a valid JWT.

OWASP identifies Broken Object Level Authorization as a major API risk and recommends checking authorization for every operation that accesses a user-controlled object identifier.

---

## 4.3 Property-level authorization

Do not return every field merely because the user can see the employee record.

Employee may see:

```text
own name
department
status
own attendance
own leave
own payslips
```

but not necessarily:

```text
another employee's salary
bank data
HR notes
internal payroll configuration
```

---

## 4.4 Role boundaries

The PS defines:

```text
Employee
    Own employee/attendance/time-off data
    No HR/payroll administration

HR Manager
    Employee/Attendance/Contracts/Schedules/Time Off
    No payroll administration

HR Payroll User
    HR + Payruns/Payslips create/read/update
    Salary structures/rules read-only

HR Payroll Manager
    Full HR/payroll configuration

Admin
    Full system access
```

The UI should reflect this, but the backend must enforce it.

---

## 4.5 Mass assignment

Never blindly bind request JSON to an entire model.

If an operation is:

```textUpdate employee contact details
```

the user should not be able to include:

```json
{
  "role": "ADMIN",
  "salary": 999999,
  "isPayrollManager": true
}
```

Use allowlisted writable fields.

---

## 4.6 Sensitive logging

Never log:

- passwords
- OTP values
- authentication tokens
- API keys
- session cookies
- unnecessary bank information
- unnecessary personal data

OWASP security logging guidance emphasizes structured security events while excluding credentials, tokens and sensitive personal data.

---

# 5. GLOBAL DATA MODEL

Recommended conceptual relationships:

```text
Employee
│
├── Contracts
│      └── Salary Structure
│              └── Salary Rules
│
├── Working Schedule
│
├── Attendance Sessions
│      └── Exceptions / Corrections
│
├── Time Off Requests
│      └── Allocations
│
└── Payslips
       └── Payrun
```

Optional:

```text
Company
Department
Job Position
Employee Type
Work Location
Attendance Policy
User
Role
Audit Event
```

---

# 6. A1 — EMPLOYEE MASTER MANAGEMENT

The PS requires Kanban, List and Form views, department, manager, schedule, job position, status, and quick navigation to related Contracts, Attendance and Time Off.

## 6.1 Create Employee — P0

Validate:

- name
- employee identifier if used
- email if required
- joining date
- department
- manager
- schedule if mandatory
- employee type
- status

### Edge cases

**Duplicate names**

Do not use name as the unique identity.

Prefer a real employee number or another business identifier.

**Incomplete payroll setup**

An employee may be created before payroll data is complete, but clearly mark:

```text
Payroll readiness = INCOMPLETE
```

Do not silently make the employee payroll-eligible.

---

## 6.2 Employee status — P0

Recommended conceptual states:

```text
DRAFT
ACTIVE
ON_LEAVE
SUSPENDED
TERMINATION_PENDING
TERMINATED
ARCHIVED
```

Only use states that the product actually needs.

Rules:

- inactive/terminated employee cannot normally punch new attendance
- archived employee should not appear in normal active selection
- historical attendance/payslips remain visible to authorized users
- status changes affecting payroll should be auditable

---

## 6.3 Joining date — P0

Example:

```text
Payroll: Sept 1–30
Joining date: Sept 10
```

Do not create false absence/attendance requirements for Sept 1–9.

---

## 6.4 Manager relationships

Prevent:

```text
employee.managerId = employee.id
```

If organizational cycles are not allowed, also detect:

```text
A → B
B → A
```

and longer cycles.

---

## 6.5 Deletion — P0

Prefer archive/deactivation when historical payroll or attendance exists.

Do not hard-delete a person whose records are required for history.

---

## 6.6 Employee UI — P0

Employee form should act as the operational hub.

Show:

```text
Contracts (2)
Attendance (23)
Time Off (4)
Allocations (2)
Payslips (6)
```

Clicks should open filtered related lists.

Empty state:

> No contracts yet. Add a contract to make this employee payroll-ready.

---

# 7. A2 — CONTRACT MANAGEMENT

This is one of the highest-risk modules.

## 7.1 Contract data — P0

At minimum:

```text
employee
startDate
endDate
wage
department
position
salaryStructure
status
```

---

## 7.2 Date validation — P0

Reject:

```text
end < start
```

Explicitly define whether boundaries are inclusive.

---

## 7.3 Overlapping contracts — P0

Example:

```text
A: Jan 1 → Aug 31
B: Aug 15 → Dec 31
```

Do not silently choose one.

Recommended:

```text
BLOCK
```

or:

```text
BLOCK PAYROLL + REQUEST RESOLUTION
```

---

## 7.4 Period-specific contract — P0

For a Payrun period:

```text
periodStart
periodEnd
```

find contracts that overlap the period.

Then ensure the business rule resolves exactly one valid contract or explicitly handles a legitimate mid-period transition.

Cases:

```text
0 applicable contracts
→ blocking payroll issue

1 applicable contract
→ valid

multiple conflicting contracts
→ blocking contract conflict
```

The PS explicitly requires payroll to use the contract applicable to the selected period.

---

## 7.5 Mid-period contract change — P1

Example:

```text
A: Jan 1 → Aug 15
B: Aug 16 → Dec 31

Payrun: Aug 1 → Aug 31
```

Do not silently treat the month as if only B exists.

Production-grade systems should preserve contract segments and define how payroll treats each segment. Do not invent jurisdiction-specific proration rules unless configured.

---

## 7.6 Wage history — P0

Do not edit historical contract values if those values affect already finalized payroll.

Prefer:

```text
Contract A: ₹50k, valid through Aug
Contract B: ₹60k, starts Sep
```

rather than rewriting Contract A after August payroll is finalized.

---

## 7.7 Contract UI — P0

Clearly label:

```text
ACTIVE
EXPIRED
FUTURE
```

Show:

```text
Start
End
Wage
Salary Structure
```

Avoid making users infer status from dates.

---

# 8. A3 — WORKING SCHEDULE SETUP

## 8.1 Interval validation — P0

Prevent:

```text
negative duration
invalid times
break longer than interval
overlapping intervals
```

unless an interval explicitly represents an overnight shift.

---

## 8.2 Overnight — P1

Support:

```text
22:00 → 06:00
```

by interpreting against actual dates, not comparing clock strings only.

---

## 8.3 Multiple intervals — P1

Potential:

```text
09–13
17–21
```

Do not make the model inherently incapable of split shifts if they may be required later.

---

## 8.4 Breaks

Distinguish:

```text
scheduled break
```

from:

```text
actual break punch
```

Do not assume every break requires a punch.

---

## 8.5 Weekly hours — P0

Calculate automatically from the schedule.

Prefer canonical duration internally:

```text
465 minutes
```

rather than relying on binary floating-point hours:

```text
7.75
```

Format for display.

---

## 8.6 Effective schedule assignment — P1

If schedule changes:

```text
Old schedule: through Aug 31
New schedule: Sep 1 onward
```

historical attendance must not silently change interpretation.

---

# 9. ATTENDANCE — PRODUCTION-GRADE SPECIFICATION

Attendance should be a pipeline:

```text
Punch Event
    ↓
Authentication
    ↓
Idempotency
    ↓
State Validation
    ↓
Attendance Session
    ↓
Schedule Interpretation
    ↓
Exception Detection
    ↓
Correction / Approval
    ↓
Approved Time
    ↓
Payroll
```

---

## 9.1 Raw punch vs session — P1

Recommended separation:

### AttendancePunch

```text
employeeId
type: IN | OUT
occurredAt
serverReceivedAt
source
requestId
device metadata
location metadata
```

### AttendanceSession

```text
employeeId
workDate
checkIn
checkOut
workedMinutes
state
flags[]
```

This makes retries, auditing and correction easier.

---

## 9.2 Double-click Punch In — P0

Three defenses:

### UI

Disable button while request is pending.

### API

Use an idempotency key where appropriate.

### Domain

Reject if an open session already exists.

Final invariant:

```text
ONE EMPLOYEE
→ MAX ONE OPEN ATTENDANCE SESSION
```

---

## 9.3 Network retry — P0

Scenario:

```text
server creates punch
↓
response lost
↓
client retries
```

The same idempotency key should return the original result rather than creating another event.

---

## 9.4 Two devices — P0

Phone and laptop can send:

```text
IN
IN
```

almost simultaneously.

Do not rely on a non-atomic:

```text
if no open session:
    create
```

Use an appropriate database/transaction/unique-state mechanism so concurrent requests cannot both create an open session.

---

## 9.5 Punch In while already IN — P0

Return a state conflict:

> You're already checked in at 9:04 AM.

Do not create another session.

---

## 9.6 Punch Out without IN — P0

Do not fabricate an IN.

Either:

```text
reject
```

or:

```text
record exception
```

and provide a correction workflow.

---

## 9.7 Multiple sessions per day — P0/P1

Legitimate:

```text
09:00 IN
12:00 OUT
13:00 IN
17:00 OUT
```

Do not impose "one row per day."

Invariant should be:

```text
at most one OPEN session at a time
```

---

## 9.8 Late arrival — P0

Store actual time:

```text
09:17
```

derive:

```text
scheduledStart = 09:00
rawLate = 17m
```

then apply grace/policy.

Never rewrite the punch.

---

## 9.9 Grace — P1

Configure:

```text
lateGraceMinutes
earlyCheckoutGraceMinutes
overtimeTolerance
```

Example:

```text
Scheduled 09:00
Grace 10m

09:10 → tolerated
09:11 → late
```

Exactly-at-boundary behavior must be defined.

---

## 9.10 Early arrival — P1

Example:

```text
Schedule 09:00
Punch 07:30
```

Possible policies:

```text
ACCEPT_NOT_OT
COUNT_AS_OT
FLAG
REQUIRE_APPROVAL
```

Do not automatically convert all early arrival into paid overtime.

---

## 9.11 Early checkout — P0

Example:

```text
Expected 17:00
Actual 16:22
```

derive:

```text earlyMinutes = 38
```

then apply policy.

---

## 9.12 Missing checkout — P0

Represent:

```text
state = OPEN
flag = MISSING_CHECKOUT
```

Recovery:

```text
employee correction request
manager/HR correction
automatic checkout if policy permits
```

Odoo currently supports automatic checkout after configurable tolerance and manual handling for forgotten check-ins/check-outs.

---

## 9.13 Automatic checkout — P1

If configured:

```text
scheduled end
+
buffer
→ auto checkout
```

Store:

```text
source = SYSTEM_AUTO
```

Never pretend the employee actually clicked Out.

---

## 9.14 Long-open attendance — P1

Flag sessions that remain open unusually long.

Odoo currently treats very long/incomplete attendance entries as errors, with documented thresholds. PeoplePay360 should use a configurable policy rather than blindly copying an arbitrary number.

---

## 9.15 Impossible duration — P0

Reject/flag:

```text
checkOut < checkIn
```

or implausibly long sessions.

Do not let impossible duration flow into payroll.

---

## 9.16 Overnight shift — P1

Correct:

```text
22:03 Sept 5
→ 06:02 Sept 6
```

Duration is approximately eight hours.

Do not require check-in and check-out to share a calendar date.

---

## 9.17 Breaks — P1

If explicit break punches exist:

```text
IN
BREAK_OUT
BREAK_IN
OUT
```

Otherwise scheduled breaks should be interpreted through the schedule.

Keep the method consistent.

---

## 9.18 Unscheduled work — P1

Weekend/holiday/non-working-day punch:

```text
UNSCHEDULED_WORK
HOLIDAY_WORK
```

Then policy determines:

- accept
- flag
- require approval
- overtime
- reject

---

## 9.19 Missing schedule — P0

Do not silently calculate expected hours if there is no schedule.

Use:

```text
NO_SCHEDULE
```

as a blocking or review exception depending on company policy.

---

## 9.20 Schedule changed after attendance — P0/P1

Historical attendance interpretation should remain stable.

Use effective-dated assignments if needed.

---

## 9.21 Time zone — P0

Store timestamps canonically.

Interpret/display using the relevant employee/company timezone.

Do not store only:

```text
"09:00"
```

without date/timezone meaning.

---

## 9.22 Client clock manipulation — P1

Server timestamp is authoritative.

Optionally retain:

```text
clientTimestamp
serverReceivedAt
```

Large differences can be flagged.

---

## 9.23 Location / geofencing — P1

Not required by the PS.

If implemented:

```text
Work Location
    ↓
Policy
    ↓
Punch
    ↓
Latitude / Longitude / Accuracy
    ↓
Distance
    ↓
RECORD_ONLY / FLAG / ENFORCE
```

Use configurable radius and avoid continuous tracking unless explicitly required.

Recommended hackathon modes:

```text Office employee → ENFORCE, ~150–200m
Hybrid           → FLAG
Field employee   → RECORD_ONLY
```

Browser geolocation requires user permission and a secure context (HTTPS), and the reported accuracy is probabilistic. Do not treat GPS as proof of identity.

---

## 9.24 Manual correction — P0

Never silently overwrite a punch.

Correction record:

```text original
requested value
reason
requestedBy
requestedAt
approvedBy
approvedAt
status
```

---

## 9.25 Correction after finalized payroll — P0

Do not silently recalculate paid payroll.

Use:

```text correction
→ payroll-impacting exception
→ review
→ adjustment/correction process
```

---

## 9.26 Overtime — P1

Separate:

```text worked extra
```

from:

```text approved overtime
```

Example:

```text Worked extra: 1h20
Approved: 45m
```

Odoo currently supports configurable overtime rules and approval, including conversion of overtime to time off.

---

## 9.27 Attendance state design

Do not use one massive status enum.

Use:

```text sessionState:
OPEN
COMPLETED
AUTO_CLOSED
CANCELLED

flags:
LATE
EARLY_CHECKOUT
MISSING_CHECKIN
MISSING_CHECKOUT
OVERTIME
UNSCHEDULED
LEAVE_CONFLICT
LOCATION_EXCEPTION
MANUAL_CORRECTION
```

A record can be:

```text COMPLETED + LATE + MANUAL_CORRECTION
```

---

# 10. A4 — TIME OFF TYPES & ALLOCATIONS

The PS requires Requests, Allocations, configurable Types, approval workflows and balance consumption.

---

## 10.1 Time Off Type — P0

Configure:

- days/hours
- allocation required
- approval mode
- payroll effect
- validity behavior
- supporting-document requirement if used

---

## 10.2 Allocation — P0

Track:

```text allocated
taken
remaining
validFrom
validTo
status
```

Do not make remaining balance an editable source-of-truth field.

---

## 10.3 Allocation lifecycle — P0

Suggested:

```text DRAFT
PENDING_APPROVAL
APPROVED
REJECTED
EXPIRED
CANCELLED
```

---

## 10.4 Concurrent balance consumption — P0

Example:

```text Balance = 2

Request A = 2
Request B = 2
```

Both must not independently consume the same two days.

Approval/consumption must be atomic or otherwise concurrency-safe.

---

## 10.5 Insufficient balance — P0

User-friendly:

> You have 2 days remaining. This request requires 3 days.

Do not wait until final save to explain the problem if it can be detected earlier.

---

## 10.6 Overlapping leave — P0

Example:

```text Request A: 10–12
Request B: 11–13
```

Block or require explicit conflict handling.

Adjacent requests:

```text A: 10
B: 11
```

are not overlaps.

---

## 10.7 Partial day — P1

Support:

```text 09:00–13:00
```

or a configured half-day/partial-day unit.

Do not blindly assume every half day equals four clock hours.

---

## 10.8 Weekends/holidays — P0

Requests covering weekends/public holidays should calculate according to configured calendars.

Odoo explicitly supports configured public holidays and leave behavior around them.

Do not hardcode holidays permanently.

---

## 10.9 Accruals — P2/FUTURE

Production-grade option:

```text work performed
→ accrual
→ balance
```

Odoo supports accrual plans. Add only if the PS/business requires it.

---

## 10.10 Approval races — P0

If two approvers act simultaneously:

```text PENDING → APPROVED
```

one succeeds.

The second receives the current state rather than performing a second contradictory transition.

---

## 10.11 Self-approval — P0

Unless business policy explicitly allows it:

```text requester != approver
```

Do not rely only on UI.

---

## 10.12 Employee termination

Review:

- future requests
- approved future leave
- remaining balances
- final payroll

Do not delete historical leave.

---

# 11. A5 — SALARY STRUCTURES

A Salary Structure is configuration that actually drives payroll.

---

## 11.1 Structure lifecycle

Suggested:

```text DRAFT
ACTIVE
INACTIVE
ARCHIVED
```

An inactive structure should not be selected for a new Payrun.

---

## 11.2 Historical safety

If changing a structure used by finalized payroll:

- preserve historical context
- version/effective-date where needed
- do not silently rewrite history

---

## 11.3 Functional configuration — P0

The PS explicitly says configuration screens must be functional, not static mockups.

Changing a Salary Structure must affect the actual Payslip generation path.

---

# 12. A6 — SALARY RULES

Salary rules are one of the highest-risk components because errors directly affect pay.

---

## 12.1 Rule fields — P0

```text
name
code
category
sequence
structure
computation type
```

Categories include:

```text
Basic
Allowances
Gross
Deductions
Net
```

---

## 12.2 Sequence — P0

Example:

```text
10 Basic
20 HRA
30 Transport
40 Gross
50 Deduction
60 Net
```

Lower sequence evaluates first.

---

## 12.3 Duplicate sequences

Either:

- allow them with deterministic ordering, or
- require unique sequence values.

For an MVP, unique sequence within a structure is easier to reason about.

---

## 12.4 Missing dependency — P0

If a rule references:

```text BASIC
```

but BASIC does not exist in the structure:

```text BLOCK
```

before payroll calculation.

---

## 12.5 Circular dependencies — P0

Reject:

```text A → B
B → A
```

before runtime computation.

---

## 12.6 Formula safety — P0

Never execute arbitrary user-provided source code directly.

Use a controlled expression engine or allowlisted variables/operators.

---

## 12.7 Divide by zero — P0

Formula:

```text bonus / workedDays
```

with:

```text workedDays = 0
```

must have an explicit policy.

Never allow NaN/Infinity into payroll.

---

## 12.8 Negative/invalid results — P0

Validate:

- negative net salary
- invalid deductions
- invalid allowances
- nonsensical totals

unless an explicit business rule supports them.

---

## 12.9 Monetary precision — P0

Use decimal/fixed-point semantics for money.

Define:

- currency
- decimal precision
- rounding rule
- rounding point

Do not depend on binary floating point for final monetary values.

---

## 12.10 Explainability — P1

Best UX:

```text
HRA
Formula: 40% of Basic
Input: Basic ₹50,000
Output: ₹20,000
```

This is valuable for both users and judges.

---

# 13. PAYROLL ENGINE

Recommended pipeline:

```text
Validate period
    ↓
Find eligible employees
    ↓
Resolve applicable contract
    ↓
Resolve salary structure
    ↓
Resolve schedule
    ↓
Gather attendance/worked time
    ↓
Gather approved Time Off
    ↓
Gather other inputs
    ↓
Execute rules by sequence
    ↓
Calculate totals
    ↓
Validate result
    ↓
Generate Payslip
    ↓
Surface warnings
    ↓
Allow finalization
```

---

# 14. B5 — PAYRUN CREATION WIZARD

The PS requires a two-step workflow.

## Step 1

Select:

```text Salary Structure
Period / Scope
```

Click Continue.

Do not prematurely create the final Payrun.

## Step 2

Show eligible employees.

User explicitly selects employees.

Then:

```text Create Payrun
```

creates the batch.

---

## 14.1 Wizard refresh — P1

Refreshing should not duplicate a Payrun.

Either restore a safe draft or restart with clear UX.

---

## 14.2 Empty selection — P0

Do not create an empty Payrun.

---

## 14.3 Ineligible employees — P0

Show reason:

```text Rahul
⚠ No valid contract

Priya
⚠ Missing salary structure

Amit
✅ Eligible
```

Do not silently hide important failures.

---

## 14.4 Duplicate Payrun — P0

Prevent accidental duplicate processing of the same scope/period where policy forbids it.

If separate employee groups legitimately run independently, uniqueness must include the scope.

---

# 15. B6 — PAYRUN PROCESSING

Recommended state machine:

```text DRAFT
   ↓
COMPUTED
   ↓
VALIDATION_REQUIRED
   ↓
VALIDATED
   ↓
PAID
```

Exact labels may differ.

State transitions must be explicit.

---

## 15.1 Compute — P0

Repeated Compute should not create duplicate Payslips.

Safe model:

```text first compute
→ create/update draft payslips

repeat compute
→ recompute drafts

paid/finalized
→ cannot silently recompute
```

---

## 15.2 Partial computation failure — P0

Example:

```text 24 employees
22 succeeded
2 failed
```

Payrun must not be presented as fully successful.

Show each failure.

---

## 15.3 Blocking vs non-blocking warnings — P0

### Blocking

Examples:

- no contract
- duplicate payslip
- missing required data
- invalid salary structure
- invalid calculation
- unresolved attendance issue if policy requires it

### Non-blocking

Examples:

- optional profile data missing
- non-critical anomaly

---

## 15.4 Mark Paid — P0

Before marking paid:

- authorized user
- valid Payrun state
- no unresolved blocking issues
- payment action is idempotent
- history recorded

Do not allow:

```text DRAFT → PAID
```

without processing.

---

## 15.5 Repeated Mark Paid — P0

Second click:

> This Payrun was already marked Paid on 5 Sep at 18:42.

No duplicate payment.

---

## 15.6 Finalized/paid history — P0

Store:

```text final state
calculatedAt
validatedAt
paidAt
actor IDs
relevant calculation/configuration context
```

Do not silently mutate historical payroll.

---

# 16. B7 — PAYSLIP & SALARY COMPUTATION

## 16.1 Identification — P0

Show:

```text Employee
Payrun
Period
Structure
Status
Worked Days
```

---

## 16.2 Breakdown — P0

Example:

```text
Earnings
  Basic        ₹50,000
  HRA          ₹20,000
  Allowance     ₹5,000
  --------------------
  Gross        ₹75,000

Deductions
  PF            ₹6,000
  Other         ₹1,000
  --------------------
  Net          ₹68,000
```

Every result should trace to rules/inputs.

---

## 16.3 Contract context — P0

Payslip must use the contract valid for the selected period.

Do not fall back to "latest contract."

---

## 16.4 Worked Days & inputs — P0

Attendance and approved time-off information should be visible as inputs/context.

Invalid/unresolved attendance should surface before finalization rather than being hidden.

---

## 16.5 Duplicate payslip — P0

Use an appropriate uniqueness rule around:

```text employee
period
payrun
```

If replacement payslips are legitimate, model replacement/version explicitly.

---

# 17. B8 — PDF & EMPLOYEE DELIVERY

## 17.1 PDF — P0

Must be:

- correct employee
- correct period
- readable
- correctly computed
- consistent with finalized Payslip

---

## 17.2 PDF authorization — P0

Before download:

```text authenticated
+
authorized for target employee
```

Never expose predictable/public payroll URLs.

---

## 17.3 PDF failure — P0/P1

PDF generation failure should not corrupt payroll.

Represent:

```text Payroll valid
PDF status = FAILED
```

and allow retry.

---

## 17.4 Bulk email — P0

Treat recipients independently.

Example:

```text 24 payslips
22 sent
1 invalid email
1 provider timeout
```

Do not report simply:

```text "All sent"
```

---

## 17.5 Email retry — P1

Classify failures:

```text TRANSIENT
PERMANENT
UNKNOWN
```

Retry transient failures with backoff.

Do not retry invalid addresses forever.

---

## 17.6 Duplicate send — P0

Repeated Send Payslips clicks should not silently produce multiple emails.

Use:

```text SENT
RESEND
```

and explicit resend action.

---

# 18. B9 — PAYROLL DASHBOARD

The PS requires the dashboard to reflect live data from actual HR/payroll operations.

---

## 18.1 Dashboard source of truth — P0

Bad:

```text totalSalary = 1245000
```

Good:

```text actual payslips
+
active filters
→ aggregation
```

---

## 18.2 Filters — P0

Support:

- Period
- Department
- Employee Type

All cards/charts should respect the same active filters unless explicitly labelled otherwise.

---

## 18.3 KPI definitions — P0

Define what each metric means.

Example:

```text Total Net Salary Paid
= net amount of PAID payslips only
```

or whatever policy the product chooses.

Do not leave denominators ambiguous.

---

## 18.4 Average salary — P1

Define denominator:

```text paid employees?
employees with payslips?
all active employees?
```

Make the definition explicit in code/documentation.

---

## 18.5 Attendance health — P1

Define formula using actual signals such as:

- attendance coverage
- late arrivals
- missing checkouts
- unexplained absence

Never create a "94% health" metric without a documented calculation.

---

## 18.6 Historical charts — P0

Historical payroll must reflect historical records.

Do not re-run old payroll using today's configuration just to populate a chart.

---

## 18.7 Dashboard freshness — P1

If cached:

```text Last updated: 10:42:31
```

For a hackathon, request-time aggregation may be preferable for correctness if the dataset is small enough.

---

## 18.8 Actionable alerts — P0/P1

Good:

```text 7 payroll issues require attention
[Review Issues]
```

Each alert should navigate to actual records.

---

# 19. REPORTING

## 19.1 Combined filters

Example:

```text Period = Aug
Department = Engineering
Employee Type = Full-time
```

should have predictable AND semantics unless the UI explicitly offers OR.

---

## 19.2 Export authorization

Exports must enforce the same access permissions as the UI.

Never allow an employee to export all payroll by manipulating a filter parameter.

---

## 19.3 Export metadata

Recommended:

```text report name
period
filters
generatedAt
generatedBy
```

---

# 20. EMPLOYEE SELF-SERVICE

Employee actions should be constrained to their own data.

Examples:

```text GET /attendance/:id
```

must verify the target attendance belongs to the authenticated employee.

Do not trust:

```text employeeId from request body
```

to determine whose data is accessible.

---

# 21. ATTENDANCE → PAYROLL

Do not let payroll consume raw device events directly.

Correct:

```text Raw Punches
    ↓
Attendance Session
    ↓
Schedule Interpretation
    ↓
Exception Resolution
    ↓
Approved/usable work time
    ↓
Payroll
```

This makes payroll independent from:

- duplicate punch handling
- GPS issues
- kiosk retries
- correction mechanics

---

# 22. TIME OFF → PAYROLL

Time Off Type must define whether the leave has payroll impact.

Do not globally assume:

```text all leave = unpaid
```

or:

```text all leave = paid
```

---

# 23. CONTRACT → PAYROLL

Contract supplies payroll context:

```text wage
working schedule
salary structure
validity
employment terms
```

Payslip should be able to identify which contract/context was used.

---

# 24. OFFBOARDING

For production-grade behavior:

```text Termination date
    ↓
Stop future attendance
    ↓
Stop future time-off requests where appropriate
    ↓
Review future approved leave
    ↓
Final payroll
    ↓
Archive employee
```

Historical records remain accessible to authorized users.

Odoo's current employee/offboarding design similarly treats departure as a controlled workflow followed by archiving.

---

# 25. CONCURRENCY & RACE CONDITIONS

Test every state-changing operation against simultaneous requests.

Important cases:

```text two punches
two leave approvals
two Payrun creations
two Mark Paid
two correction approvals
two salary rule updates
```

Use appropriate:

- unique indexes
- atomic updates
- transactions
- optimistic concurrency
- state-condition checks

depending on the operation and database.

---

# 26. DATABASE INTEGRITY — MONGODB/MONGOOSE

For the current TypeScript/Mongo implementation:

Use:

- schema validation
- unique indexes
- compound indexes
- transactions for multi-document critical operations where appropriate
- version/concurrency control where appropriate

Potential index families should follow real query patterns:

```text Attendance:
employeeId + state
employeeId + occurredAt

Contract:
employeeId + startDate
employeeId + endDate

Time Off:
employeeId + startDate + endDate + status

Payslip:
employeeId + period + payrunId

Payrun:
periodStart + periodEnd + scope
```

Do not add indexes blindly; inspect actual queries.

---

# 27. TRANSACTIONS

Use a transaction where one business action should change multiple records atomically.

Example Time Off approval:

```text Approve request
+
consume allocation
+
create ledger/consumption record
```

Either all commit or all fail.

Never leave:

```text request = APPROVED
allocation = unchanged
```

after an unsuccessful update.

---

# 28. BACKGROUND JOBS

For:

- auto checkout
- emails
- accruals
- reminders
- report generation

assume a job can run twice.

Jobs should be idempotent.

For example:

```text Send payslip job
→ check delivery state
→ don't resend already-sent message
```

---

# 29. RATE LIMITING & RESOURCE CONTROL

Protect:

- OTP request
- OTP verification
- bulk email
- PDF generation
- Payrun compute
- dashboard queries
- employee search
- uploads

Use:

- rate limits
- pagination
- payload size limits
- operation limits
- timeouts
- retry/backoff

OWASP specifically identifies unrestricted resource consumption as an API security risk.

---

# 30. INPUT VALIDATION

## Strings

Validate:

- required
- length
- normalization
- allowed format where appropriate

## Numbers

Validate:

- finite
- min/max
- no NaN
- no Infinity
- monetary precision

## Dates

Validate:

- valid date
- timezone semantics
- start <= end
- relevant period relationship

## Arrays

Validate:

- max length
- duplicates
- referenced record authorization

## Files

Validate:

- size
- type
- content
- extension
- authorization

---

# 31. AUTHENTICATION / OTP ROBUSTNESS

If OTP is used:

```text request OTP
→ rate limit
→ cooldown
→ generate expiry
→ verify with attempt limit
→ invalidate after success
```

Use stable states:

```text ACTIVE
USED
EXPIRED
LOCKED
```

Do not log OTP values.

Avoid account enumeration where feasible.

---

# 32. PASSWORDS

If password authentication is used:

Never store plaintext.

Use a modern slow password hash such as:

```text Argon2id
bcrypt
PBKDF2
```

with a unique salt and an appropriate cost configuration.

OWASP recommends strong slow password hashing and explicitly warns against fast general-purpose hashes such as raw SHA-256 for password storage.

---

# 33. FILE / PDF ACCESS CONTROL

A payslip download must validate:

```text authenticated user
+
permission
+
target employee
+
document relationship
```

Do not expose:

```text /payslips/123.pdf
```

as a universally readable file merely because 123 is difficult to guess.

---

# 34. SEARCH & FILTER STALENESS

If frontend requests:

```text "Rah"
```

then immediately:

```text "Rahul"
```

and the first request returns later, it must not overwrite the newer results.

Use:

- request cancellation
- request sequence IDs
- query keys
- state libraries with stale-result protection

where appropriate.

---

# 35. PAGINATION

Never return unbounded:

```text all attendance
all payslips
all employees
```

The backend must enforce maximum page sizes.

Do not rely only on the client.

---

# 36. AUDIT TRAIL

Audit at minimum:

```text employee status changes
contract changes
attendance corrections
leave approvals/refusals
allocation changes
salary structure changes
salary rule changes
Payrun compute/validate/pay
Payslip finalization
payroll overrides
role/permission changes
```

Audit event model:

```text eventType
actor
targetType
targetId
timestamp
before
after
reason
requestId
```

Do not put unnecessary sensitive data into audit/log records.

---

# 37. HISTORICAL INTEGRITY

The system must distinguish:

```text current truth
```

from:

```text historical truth
```

Examples:

- old contract wage
- old salary structure
- finalized payslip
- historical department
- historical schedule

Do not use today's state to rewrite yesterday's payroll.

---

# 38. CALCULATION REPRODUCIBILITY

For finalized payroll, strive to reproduce/explain:

```text employee
+
contract
+
structure
+
salary rules
+
attendance inputs
+
time off
+
other inputs
→ final payslip
```

Useful metadata:

```text calculatedAt
calculatedBy
engineVersion
configurationVersion
```

---

# 39. OBSERVABILITY

Use a request/correlation ID.

A significant operation should be traceable:

```text request
→ user
→ action
→ record
→ result
→ error
```

Monitor:

- failed login
- access-control failure
- repeated punch retries
- payroll computation errors
- PDF failures
- email failures
- unexpected exceptions
- unusual bulk operations

OWASP recommends consistent structured logs and cautions against logging secrets or unnecessary sensitive personal information.

---

# 40. USER-FRIENDLY UX RULES

## 40.1 Every error answers three questions

1. What happened?
2. Why?
3. What should I do?

Bad:

> Validation failed.

Good:

> Rahul has no valid contract covering 1–31 August 2026.
> Create or correct a contract before computing the payslip.

Action:

```text View Contracts
```

---

## 40.2 Critical mutation UX

```text click
↓
loading
↓
disable duplicate action
↓
server confirmation
↓
authoritative state
```

Do not optimistic-update irreversible states such as:

- Paid
- Approved
- Finalized

before the server confirms.

---

## 40.3 Empty states

Examples:

> No employees match these filters.

> No attendance records exist for this period.

> No eligible employees were found for this Payrun.

Do not use "0" when the actual meaning is "no data."

---

## 40.4 Confirmation for destructive/irreversible actions

Before:

```text archive
delete
mark paid
finalize
```

show impact where useful.

For finalized payroll, make the irreversible nature explicit.

---

# 41. MODULE-LEVEL EDGE CASE MATRIX

## Employee

```text
[ ] duplicate identity
[ ] missing required HR data
[ ] joining date
[ ] termination date
[ ] inactive/archived
[ ] circular manager
[ ] unauthorized field update
```

## Contract

```text
[ ] no contract
[ ] expired
[ ] future
[ ] overlap
[ ] mid-period change
[ ] exact boundary dates
[ ] wage change
[ ] structure change
```

## Schedule

```text
[ ] invalid interval
[ ] zero duration
[ ] overnight
[ ] split shift
[ ] break
[ ] schedule change
[ ] no schedule
```

## Attendance

```text
[ ] double click
[ ] network retry
[ ] two devices
[ ] IN while already IN
[ ] OUT without IN
[ ] missing OUT
[ ] late
[ ] early arrival
[ ] early checkout
[ ] overtime
[ ] multiple sessions
[ ] overnight
[ ] weekend/holiday
[ ] leave conflict
[ ] manual correction
[ ] post-payroll correction
[ ] timezone
[ ] device clock
[ ] GPS unavailable
[ ] outside geofence
```

## Time Off

```text
[ ] insufficient balance
[ ] exact balance
[ ] overlapping request
[ ] adjacent request
[ ] partial day
[ ] weekend
[ ] holiday
[ ] expired allocation
[ ] concurrent approval
[ ] self approval
[ ] termination
```

## Salary Rules

```text
[ ] sequence
[ ] duplicate sequence
[ ] missing dependency
[ ] circular dependency
[ ] divide by zero
[ ] negative result
[ ] rounding
[ ] precision
[ ] missing input
[ ] fixed amount
[ ] percentage
[ ] formula
```

## Payrun

```text
[ ] invalid period
[ ] no employees
[ ] duplicate run
[ ] employee without contract
[ ] employee without structure
[ ] duplicate payslip
[ ] partial computation failure
[ ] blocking warning
[ ] repeated compute
[ ] repeated mark paid
[ ] finalized edit
```

## Payslip

```text
[ ] correct period
[ ] correct contract
[ ] correct structure
[ ] worked days
[ ] leave input
[ ] salary breakdown
[ ] duplicate
[ ] PDF failure
[ ] unauthorized access
```

## Email

```text
[ ] invalid recipient
[ ] timeout
[ ] provider failure
[ ] duplicate click
[ ] partial batch failure
[ ] retry
```

## Dashboard

```text
[ ] no data
[ ] one record
[ ] many records
[ ] period filter
[ ] department filter
[ ] employee type filter
[ ] combined filters
[ ] live updates
[ ] historical accuracy
[ ] unauthorized data
```

---

# 42. RECOMMENDED "ATTENDANCE EXCEPTION CENTER"

A useful production-style screen:

```text
Attendance Exceptions

Employee     Date       Type                 Severity
--------------------------------------------------------
Rahul        05 Sep     Missing checkout     High
Priya        05 Sep     Late arrival         Low
Amit         04 Sep     Leave conflict       High
Neha         03 Sep     Manual correction    Medium
```

Click:

```text
Open record
Review evidence
Approve / Reject / Correct
```

This directly strengthens PeoplePay360's payroll validation story.

---

# 43. RECOMMENDED "PAYROLL VALIDATION COCKPIT"

Before finalization:

```text
PAYRUN — AUGUST 2026

Employees: 24
Payslips: 24

✅ Valid Contracts              24/24
✅ Salary Structures            24/24
⚠ Missing Bank Details            2
⚠ Missing Check-outs              3
⚠ Duplicate Payslips              1
⚠ Unresolved Corrections          1

[Review Issues]
```

The important thing is that every count comes from actual records.

---

# 44. RECOMMENDED DEMO FLOW

## Scenario 1 — Employee → Payslip

```text
Employee
   ↓
Active contract
   ↓
Working schedule
   ↓
Attendance
   ↓
Time Off
   ↓
Create Payrun
   ↓
Select employees
   ↓
Compute
   ↓
Validation
   ↓
Salary rule breakdown
   ↓
Validate
   ↓
Mark Paid
   ↓
Generate PDF
   ↓
Dashboard updates
```

## Scenario 2 — Allocation → Time Off

```text
Allocation
   ↓
Approval
   ↓
Employee request
   ↓
Manager approval
   ↓
Balance decreases
   ↓
Dashboard updates
```

The PS explicitly suggests these kinds of end-to-end demonstrations.

---

# 45. HIGH-VALUE ENHANCEMENTS

After P0 is stable:

### P1

```text
Payroll validation cockpit
Explainable salary rules
Attendance exception center
Effective-dated contract timeline
Overtime approval
Auto checkout
Location-aware attendance
Manager correction workflow
```

### P2/FUTURE

```text
Accrual engine
Advanced geofencing
Kiosk mode
Offline attendance queue
Anomaly detection
Biometric integration
Multi-country localization
AI assistant
```

Do not sacrifice payroll correctness for these.

---

# 46. WHAT NOT TO DO

## Fake payroll

```text
if Rahul:
    salary = 70000
```

## Fake dashboard

```text
totalNetSalary = 1200000
```

## Static Salary Rule screen

A UI that stores rules but doesn't use them is not an implementation.

## Frontend-only security

Hiding buttons is not authorization.

## Giant controller

Do not put the entire payroll calculation engine inside an HTTP handler.

## Giant schema

Do not put every HR/payroll concept into a single unmaintainable object.

## Blind retries

Do not retry every mutation automatically.

## Silent historical mutation

Do not rewrite finalized payroll or historical contracts invisibly.

## Technology for show

Do not add Redis/Kafka/microservices/LLMs/etc. unless they solve a real requirement.

---

# 47. DEFINITION OF DONE

A feature is complete only when:

```text
Happy path works
+
Invalid input handled
+
Boundary cases handled
+
Authorization verified
+
Concurrency considered
+
Historical behavior correct
+
Errors understandable
+
Auditability sufficient
+
UI reflects backend state
+
Tests exist
+
Demo works
```

---

# 48. FINAL PEOPLEPAY360 QUALITY GATE

## Employee

- [ ] Central employee hub
- [ ] Kanban/List/Form
- [ ] Role-safe fields
- [ ] Active/inactive lifecycle
- [ ] Historical-safe archive
- [ ] Related navigation

## Contract

- [ ] Historical contracts
- [ ] Period-based selection
- [ ] Overlap handling
- [ ] Effective dates
- [ ] Salary structure association

## Schedule

- [ ] Valid intervals
- [ ] Automatic weekly hours
- [ ] Overnight handling
- [ ] Effective assignment

## Attendance

- [ ] Idempotent punch
- [ ] One open session
- [ ] Late/early interpretation
- [ ] Missing checkout
- [ ] Multiple sessions
- [ ] Manual correction
- [ ] Audit
- [ ] Payroll integration

## Time Off

- [ ] Types
- [ ] Allocations
- [ ] Balance tracking
- [ ] Requests
- [ ] Approval
- [ ] Overlap detection
- [ ] Holidays/weekends
- [ ] Payroll relationship

## Salary

- [ ] Structures functional
- [ ] Rules functional
- [ ] Rule sequencing
- [ ] Dependency validation
- [ ] Precision/rounding
- [ ] Safe formulas

## Payrun

- [ ] Two-step wizard
- [ ] Eligibility
- [ ] Compute
- [ ] Validation
- [ ] Warnings
- [ ] Mark Paid
- [ ] History

## Payslip

- [ ] Correct period
- [ ] Correct contract
- [ ] Correct structure
- [ ] Rule breakdown
- [ ] PDF
- [ ] Secure access

## Delivery

- [ ] Bulk email
- [ ] Per-recipient status
- [ ] Retry
- [ ] Duplicate protection

## Dashboard

- [ ] Live data
- [ ] Period filter
- [ ] Department filter
- [ ] Employee type filter
- [ ] KPI definitions
- [ ] Actionable alerts
- [ ] Historical correctness

## Security

- [ ] Authentication
- [ ] Object authorization
- [ ] Property authorization
- [ ] Role boundaries
- [ ] Mass-assignment protection
- [ ] Sensitive logging controls

## Reliability

- [ ] Idempotency
- [ ] Transactions where required
- [ ] Retry strategy
- [ ] Rate limiting
- [ ] Timeouts
- [ ] Request IDs
- [ ] Structured logs

---

# 49. RESEARCH BASIS

## PeoplePay360 Problem Statement

The supplied PS is the primary authority for project scope and required behavior.

It specifically states that:

- the employee is the central hub
- contracts and schedules provide payroll context
- attendance and Time Off capture day-to-day activity
- salary structures/rules drive computation
- Payruns generate validated payslips
- historical contracts must be retained
- payroll must use the applicable period-specific contract
- schedules calculate weekly hours
- approved Time Off consumes allocations
- salary rules execute in sequence
- Payruns have a two-step creation flow
- warnings must be surfaced before finalization
- dashboards use live data
- Payslip PDFs and bulk delivery are required

## Odoo 19 reference behavior

Used as a benchmark for mature HR/payroll behavior:

- Employees
- Attendances
- Attendance Logs
- Work Approvals and Overtime
- Overtime Rulesets
- Contracts
- Payroll
- Salaries
- Payslips
- Pay Runs
- Time Off
- Time Off Types
- Allocations
- Accrual Plans
- Public Holidays
- India Payroll Localization

Odoo's current documentation, for example, shows:
- attendance methods and detailed attendance metadata
- automatic checkout
- management of incomplete attendance
- configurable overtime/tolerance
- Time Off approvals and allocations
- contract-linked working schedules
- payroll validation before processing
- salary-rule sequencing
- period-specific payroll processing
- live payroll/work-entry dependencies

## Security / API standards

- OWASP API Security Top 10
- OWASP Application Security Verification Standard
- OWASP Password Storage guidance
- OWASP security logging guidance
- IETF RFC 9457 — Problem Details for HTTP APIs

## Browser / location

- MDN Geolocation API
- MDN Geolocation accuracy / permissions policy

## Worker privacy

- ICO guidance on monitoring workers and proportionality/privacy

---

# 50. FINAL PRINCIPLE

> **A payroll number is trustworthy only when you can explain where it came from.**
>
> **An attendance record is trustworthy only when you can explain how it was recorded, interpreted and corrected.**
>
> **A leave balance is trustworthy only when every approval and consumption is traceable.**
>
> **A dashboard is trustworthy only when its numbers come from live operational records.**
>
> **A production-grade HRMS is not defined by the number of screens. It is defined by how safely and predictably those screens change real business state.**
