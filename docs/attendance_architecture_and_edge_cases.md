# Attendance Module: Architecture, Edge Cases & Error Handling

This document outlines every edge case, restriction, exception, and error handling mechanism currently implemented in the PeoplePay360 Attendance module. 

A production-grade HRMS must treat attendance not just as a "time clock" where a button click equals a database row, but as an **event ingestion and interpretation system**. The rules below detail how we protect the integrity of the data and ensure payroll accurately consumes approved time.

---

## 1. Network Retries & Duplicate Punches (API Idempotency)
- **The Problem:** A user clicks "Clock In" on a laggy mobile network. The server successfully processes the punch, but the response never reaches the phone. Thinking it failed, the user clicks "Clock In" again, resulting in duplicate records or confusing error messages.
- **How We Handle It:** **API Idempotency Middleware**.
  - The frontend sends a unique `Idempotency-Key` header with every punch request.
  - The backend checks the `IdempotencyRecord` collection. If the key exists, it *intercepts* the request and immediately returns the cached, successful HTTP 200 response.
  - **Why:** This allows the client to blindly retry requests without causing duplicate state changes or throwing false-positive conflict errors.

## 2. Concurrent Requests & Race Conditions (The "One Open Session" Rule)
- **The Problem:** Two requests arrive at the exact same millisecond (e.g., user opened the app on two devices and clicked simultaneously). Traditional application-level checks (`if (!attendance) create()`) fail because both requests see no active session before either writes to the DB.
- **How We Handle It:** **MongoDB Partial Unique Index**.
  - We removed the legacy "One row per day" constraint.
  - We applied a strict database-level index: `attendanceSchema.index({ employeeId: 1 }, { unique: true, partialFilterExpression: { sessionState: "OPEN" } })`.
  - **Why:** This pushes the concurrency lock down to the storage engine. It is mathematically impossible for an employee to have two `OPEN` sessions simultaneously. The second request will hit an `E11000` duplicate key error, which we catch and format as a `ConflictError("You already have an open attendance session.")`.

## 3. Rapid Successive Punches (The Double-Click)
- **The Problem:** A user accidentally double-clicks the punch button. The first click registers as a Clock-In, and the immediate second click registers as a Clock-Out, creating a 0-second attendance session.
- **How We Handle It:** **Minimum Session Duration Lock**.
  - In `clock-out.service.ts`, we calculate the difference between the check-in time and the current time.
  - If the duration is less than 60 seconds, we throw a `ValidationError("Please wait at least 1 minute before clocking out.")`.
  - **Why:** Protects against accidental double-taps and UI glitches, ensuring that only intentional, meaningful work sessions are logged.

## 4. Split Shifts & Multiple Daily Sessions
- **The Problem:** Strict "One attendance record per day" logic breaks when an employee takes an unpaid 1-hour lunch break, or works a morning shift (9-1) and an evening shift (5-9).
- **How We Handle It:** **Session-Based Architecture**.
  - Because we rely on the `sessionState: "OPEN"` invariant rather than a unique `date` index, an employee can clock out (closing the session) and then clock back in later that same day (opening a new session).
  - **Why:** Real-world timekeeping requires duration intervals, not just "Present/Absent" toggles. This natively supports breaks and split shifts.

## 5. Late Arrivals
- **The Problem:** An employee clocks in at 9:17 AM for a 9:00 AM shift. We must preserve the exact punch time while interpreting the lateness based on company policy.
- **How We Handle It:** **Dynamic Schedule Resolution & Grace Periods**.
  - The API fetches the employee's active `Contract` and `WorkingSchedule`.
  - It compares the authoritative server time against the scheduled `startTime`.
  - If the punch is > 15 minutes late (the grace period), the session's status is flagged as `"Late"`.
  - **Why:** Preserves the raw audit trail (they punched at 9:17) while applying policy-driven interpretation for HR dashboards.

## 6. Early Checkouts & The Exception Engine
- **The Problem:** An employee leaves 2 hours early. If we just flag the row as "Half-Day", Payroll doesn't know if this was an approved doctor's visit or an unauthorized early departure. Payroll shouldn't be processing ambiguous data.
- **How We Handle It:** **The `AttendanceException` Model**.
  - If an employee checks out > 30 minutes early, we flag the status as `"Half-Day"`, BUT we also generate a dedicated `AttendanceException` document of type `EARLY_CHECKOUT` with a `PENDING_REVIEW` status.
  - **Why:** This intercepts the automated flow. Payroll modules can be configured to strictly **block** processing for any employee with an unresolved `AttendanceException`, forcing HR to review, categorize, and approve the anomaly before money changes hands.

## 7. Missing Schedules or Contracts
- **The Problem:** An employee attempts to punch in, but HR hasn't finalized their contract, or their schedule is missing.
- **How We Handle It:** **Strict Validation**.
  - `clock-in.service.ts` actively searches for a `Running` contract valid for `today`.
  - If missing, it throws a `ValidationError("Cannot clock in: No active contract found for today.")`.
  - **Why:** Prevents orphaned attendance records that cannot be interpreted or tied to a wage calculation later.

## 8. Client Clock Manipulation & Time Zones
- **The Problem:** An employee changes their phone's local time to 9:00 AM when it is actually 9:40 AM to avoid being marked late.
- **How We Handle It:** **Server-Authoritative Timestamps**.
  - We *never* accept a `timestamp` provided in the client's payload for the actual punch event.
  - The backend unconditionally uses `new Date()` (UTC) to record the exact moment the server processed the event.
  - **Why:** Ensures the audit trail is completely tamper-proof.

## 9. Clocking Out Twice
- **The Problem:** An employee manages to send two clock-out requests for the same open session.
- **How We Handle It:** **State Validation**.
  - The service specifically queries for an `OPEN` session. The first clock-out request sets `sessionState = "CLOSED"`. The second request will simply fail with `NotFoundError("No open attendance session found")`.
  - **Why:** Prevents overwriting the original, accurate clock-out time.

---

### Summary
By separating **Raw Punches** (Idempotent API), **Attendance Sessions** (Open/Closed State Machine), and **Policy Deviations** (Exception Engine), the PeoplePay360 architecture guarantees data integrity, prevents concurrency corruption, and provides a clean, validated data feed for the Payroll module.
