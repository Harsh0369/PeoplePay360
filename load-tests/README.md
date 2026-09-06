# PeoplePay360 — k6 Load Tests

An extensive [k6](https://k6.io) load-test suite that drives the **entire read API
surface** of the PeoplePay360 backend at **1,000 concurrent users** and produces a
shareable HTML + JSON report.

## Why it's built this way

- **Modular, not one giant file.** Config, auth, HTTP helpers, endpoint catalogue,
  metrics and reporting are separate modules under `k6/` so the suite is readable
  and extendable.
- **Realistic load model.** A shared admin token (acquired once in `setup()`) avoids
  a 1k-wide login storm; VUs then "browse" weighted sections of the app with think
  time between actions, like real users. A separate low-rate scenario measures
  `/auth/login` latency under that load.
- **Every module is covered and broken out in the report** via k6 groups + per-request
  tags, so you can see latency/error rate per endpoint and per module.
- **Safe against the shared database.** The 1k run is **read-only**. Write endpoints
  are covered by a separate, tiny, opt-in smoke (`k6/scenarios/write-smoke.js`) so we
  never flood a shared DB with junk. See _Writes_ below.

## Layout

```
load-tests/
├── run.ps1 / run.sh            # convenience runners
├── reports/                    # generated summary.html / summary.json
├── .bin/                       # local k6 binary (git-ignored)
└── k6/
    ├── main.js                 # entry: setup + scenarios + report hook
    ├── config/
    │   ├── env.js              # BASE_URL, creds, load knobs (all -e overridable)
    │   └── options.js          # scenarios (ramp to 1000 VUs) + thresholds
    ├── lib/
    │   ├── auth.js             # login() + bearer headers
    │   ├── http.js             # tagged, checked authenticated GET
    │   ├── endpoints.js        # the full read API catalogue, grouped + weighted
    │   ├── metrics.js          # custom metrics (business errors, api latency)
    │   ├── summary.js          # handleSummary → HTML + JSON + stdout
    │   └── vendor/             # k6-reporter + k6-summary (vendored, no runtime CDN)
    └── scenarios/
        └── write-smoke.js      # optional, bounded write coverage (off by default)
```

## Prerequisites

- The backend running and reachable (default `http://localhost:5000/api/v1`).
- k6. A Windows binary is auto-placed in `.bin/` by the setup used to create this
  suite; otherwise install k6 (`choco install k6` / `brew install k6`) — the runners
  fall back to `k6` on your PATH.

## Running

```bash
# from load-tests/
./run.sh                         # or:  ./run.ps1   (PowerShell)
```

Override anything via k6 `-e`:

```bash
./run.sh -e PEAK_VUS=1000 -e BASE_URL=http://localhost:5000/api/v1
./run.sh -e PEAK_VUS=250          # lighter local run
```

Reports are written to `load-tests/reports/summary.html` (open in a browser) and
`summary.json` (raw metrics).

## Load profile (default)

`browse` scenario — `ramping-vus` to **1000** concurrent VUs:

| Phase   | Duration | Target VUs |
|---------|----------|------------|
| warm up | 45s      | 250        |
| climb   | 45s      | 500        |
| reach   | 60s      | 1000       |
| **hold**| 90s      | **1000**   |
| drain   | 30s      | 0          |

`auth` scenario runs in parallel: 5 logins/sec (`constant-arrival-rate`) for the
duration, to measure bcrypt-backed login latency under load.

## Endpoints covered (read surface)

`auth` (`/auth/me`, `/auth/login`), `dashboard` (`/dashboard/stats`), `employees`
(list, search, `/me`, `/:id`), `contracts` (list, `/applicable/:employeeId`),
`job-positions`, `departments`, `working-schedules`, `attendance` (list, `/my`),
`time-off` (types, allocations, requests, `/my/*`), `payruns` (list, `/:id`,
`/:id/eligible-employees`), `payslips` (list, `/:id`, `/my`), `payroll-config`
(rules, structures), `roles` (list, `/:id`), `users` (list, join-requests),
`business-logs`, `permissions/registry`, `health`.

## Thresholds (report pass/fail)

- `http_req_failed` < 10%
- `http_req_duration` p95 < 2s, p99 < 5s
- `checks` pass rate > 95%
- per-module (employees, payroll) group p95 < 3s

> On a single-process dev server backed by a shared Atlas tier, some thresholds may
> legitimately breach at 1k users — that is the purpose of a stress test: it shows
> where the system starts to degrade.

## Writes

Create/update/delete endpoints are **excluded from the 1k run on purpose** — this
suite runs against a shared database and mass writes would pollute it. To exercise
the write paths at low volume:

```bash
.bin/k6.exe run k6/scenarios/write-smoke.js
```

It creates ~20 clearly-labelled `LOADTEST-*` records (roles, departments,
schedules). Re-seed afterwards if you want a pristine DB.
