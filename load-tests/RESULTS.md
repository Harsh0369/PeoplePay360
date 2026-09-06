# Load Test Results — 1,000 Concurrent Users

> **Update — after local-only optimizations.** The same 1k profile was re-run after
> the optimizations below (bigger DB pool, cached+parallelized dashboard,
> `estimatedDocumentCount` for unfiltered totals, sort-covering indexes, `.lean()`).
> No Redis/queue/external services were added.
>
> | Metric (peak 1k) | Before | After | Change |
> |---|---|---|---|
> | Failed requests | 97.2% | **85.9%** | ↓ |
> | Checks passed | 2.8% | **14.5%** | **≈5× more** |
> | Business errors | 97.5% | **88.0%** | ↓ |
> | Data served | 419 KB | **9.0 MB** | **≈21× more** |
> | Successful requests | 205 | **~1,090** | **≈5×** |
> | A single warm read (idle) | ~0.9s | **~0.25s** | **≈3.6× faster** |
>
> **Takeaway:** within the local-only constraint the app now serves several times
> more successful traffic per run. 1,000 concurrent users still exceeds what a
> **single Node process + shared Atlas M0** can absorb (offered load ≫ capacity),
> so p95 stays at the timeout ceiling at the very peak — closing that final gap
> needs horizontal scaling (multi-process) and a larger DB tier, which are out of
> scope by request. See `reports/before-optimization.html` vs
> `reports/after-optimization.html`. Optimizations are listed in the repo chat /
> commit `feat(perf)`.

---


**Suite:** `load-tests/k6` · **Tool:** k6 v2.2.0 · **Date:** 2026-09-06
**Target:** `http://localhost:5000/api/v1` (single-process `tsx` dev server → MongoDB Atlas)
**Raw report:** [`reports/summary.html`](reports/summary.html) · [`reports/summary.json`](reports/summary.json)

## What was tested

The full **read API surface** (every module — auth, employees, contracts, job
positions, org, attendance, time-off, payroll, payroll-config, roles, users,
audit, dashboard, permissions, health) under a `ramping-vus` profile peaking at
**1,000 concurrent users** for a 90s hold, plus a parallel 5 logins/sec auth
scenario (peak **1,150** total VUs).

## Headline numbers

| Metric | Result |
|---|---|
| Peak concurrent VUs | **1,150** (1,000 browse + up to 150 auth) |
| Total HTTP requests | 7,334 |
| **Throughput** | **≈ 24 requests/sec** |
| **Failed requests** | **97.2%** (7,129 failed / 205 OK) |
| Requests that succeeded | 205 |
| Check pass rate | 2.8% (410 / 14,660) |
| `http_req_duration` p95 / p99 | **30s / 30s** (= the request timeout) |
| `http_req_duration` avg | 29.3s |
| Latency of the *successful* requests | avg 5.4s, p90 16.7s, p95 20.4s |
| Completed iterations | 7,233 (160 dropped) |

## Verdict

**The application in its current single-process / shared-Atlas configuration does
not withstand 1,000 concurrent users — it saturates and collapses well before that.**
Under peak load almost every request queued past the 30-second client timeout;
effective throughput flatlined at ~24 req/s. `GET /health` (no database) kept
returning 200, which confirms the Node process stayed *alive* — the wall was the
**database / request-handling path, not the web layer crashing.**

For calibration, the smoke run at just **10 VUs already showed p95 ≈ 2.2s** — so the
data-heavy list endpoints are expensive even under trivial load, and there is little
headroom before contention dominates.

All configured thresholds were crossed (by design — this is a stress test that
locates the breaking point):

```
http_req_failed ......... 97.2%   (limit <10%)
http_req_duration p95 ... 30s     (limit <2s)
checks .................. 2.8%    (limit >95%)
group{employees} p95 .... 30s     (limit <3s)
group{payroll} p95 ...... 30s     (limit <3s)
```

## Where the bottleneck is (analysis)

1. **Single Node event loop.** The server runs one `tsx` process — no clustering /
   PM2 / worker threads. One core serializes all request handling; 1,000 concurrent
   callers cannot be served in parallel.
2. **Database round-trips dominate.** Even light load is slow (p95 2.2s at 10 VUs),
   pointing at un-indexed / expensive queries. The heaviest lists — `attendance`
   (~32k docs), `business-logs` (~5k+), `employees` (~1,500) — each do a
   `find(...).skip().limit()` **plus a `countDocuments()`** per request; unindexed
   sorts/filters and full counts on large collections are the usual culprits.
3. **Shared Atlas tier + connection pool.** A shared/free Atlas cluster has limited
   IOPS and connection headroom; the mongoose pool becomes the choke point and
   requests queue behind it until they time out.
4. **bcrypt on the hot path.** `/auth/login` hashes at cost 12 (~hundreds of ms of
   CPU each) on the same single core, competing with request handling.

## Recommendations (highest leverage first)

- **Index the query paths:** `attendance.date`, `businessLog.createdAt`,
  `employee.name` / `workEmail` (search), and any field used in `sort`/filter on the
  big collections.
- **Stop counting huge collections every request:** use `estimatedDocumentCount()`
  or cached/approximate totals for `attendance` / `business-logs` pagination.
- **Run production-mode, multi-core:** build (`tsc`) and run under PM2/cluster or
  container replicas behind a load balancer instead of the single `tsx` dev process.
- **Scale/tune MongoDB:** move off the shared tier for load tests and size the
  mongoose connection pool to the workload.
- **Cache reference data:** roles, time-off types, salary rules/structures and
  `dashboard/stats` change rarely — cache (in-memory / Redis) with short TTLs.
- **Add gzip compression and keep list page sizes small** (the suite already uses
  `limit=20`; the frontend's `limit=100000` GET pattern should be revisited).
- **Throttle logins** and/or lower bcrypt cost for non-production, to keep auth off
  the critical CPU path.

## Reproduce

```bash
cd load-tests
./run.sh                       # full 1,000-user run  (or ./run.ps1 on Windows)
./run.sh -e SMOKE=1            # ~25s pipeline check
./run.sh -e PEAK_VUS=250       # find the knee: try 100 / 250 / 500 / 1000
```

A useful next step is a **capacity sweep** (100 → 250 → 500 → 1,000 VUs) to pinpoint
the exact concurrency at which p95 crosses an acceptable SLO — that number, not the
1k cliff, is what capacity planning needs.
