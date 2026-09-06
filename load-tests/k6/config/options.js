import { CONFIG } from './env.js';

// ---------------------------------------------------------------------------
// k6 options — load profile + pass/fail thresholds.
//
// Two scenarios run together:
//   1) browse  — ramps to PEAK_VUS (default 1000) concurrent users hitting the
//                full read API surface. This is the headline 1k-user load.
//   2) auth    — a steady, low trickle of real logins (constant arrival rate) so
//                /auth/login latency is measured under load WITHOUT a 1k bcrypt
//                storm melting the single-process dev server (which would just
//                measure bcrypt, not the app).
// ---------------------------------------------------------------------------

const PEAK = CONFIG.PEAK_VUS;

// Fast pipeline check: `-e SMOKE=1` runs a tiny, short version of both scenarios
// so you can validate the whole flow (setup, requests, report generation) in ~25s
// before committing to the multi-minute 1k-user run.
const SMOKE = __ENV.SMOKE === '1' || __ENV.SMOKE === 'true';

export const options = SMOKE ? {
  scenarios: {
    browse: {
      executor: 'ramping-vus', startVUs: 0, exec: 'browse', gracefulRampDown: '5s',
      stages: [{ duration: '10s', target: 10 }, { duration: '10s', target: 10 }, { duration: '5s', target: 0 }],
      tags: { scenario: 'browse' },
    },
    auth: {
      executor: 'constant-arrival-rate', exec: 'authFlow', rate: 2, timeUnit: '1s',
      duration: '25s', preAllocatedVUs: 5, maxVUs: 20, tags: { scenario: 'auth' },
    },
  },
  thresholds: { http_req_failed: ['rate<0.5'] },
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
} : {
  scenarios: {
    browse: {
      executor: 'ramping-vus',
      startVUs: 0,
      exec: 'browse',
      gracefulRampDown: '30s',
      stages: [
        { duration: '45s', target: Math.round(PEAK * 0.25) }, // warm up
        { duration: '45s', target: Math.round(PEAK * 0.5) },  // climb
        { duration: '60s', target: PEAK },                    // reach peak (1000)
        { duration: '90s', target: PEAK },                    // hold at peak
        { duration: '30s', target: 0 },                       // ramp down
      ],
      tags: { scenario: 'browse' },
    },
    auth: {
      executor: 'constant-arrival-rate',
      exec: 'authFlow',
      rate: 5,
      timeUnit: '1s',
      duration: '4m30s',
      preAllocatedVUs: 20,
      maxVUs: 150,
      tags: { scenario: 'auth' },
    },
  },

  // Thresholds double as the report's pass/fail criteria. For a stress test to
  // 1k users on a single-process dev server some of these may legitimately breach
  // — that is the point: they mark where the system starts to degrade.
  thresholds: {
    http_req_failed: ['rate<0.10'],                 // <10% hard errors
    http_req_duration: ['p(95)<2000', 'p(99)<5000'],
    checks: ['rate>0.95'],                          // >95% of assertions pass
    'http_req_duration{scenario:auth}': ['p(95)<4000'],
    // Per-module read latency (custom trends, see lib/metrics.js)
    'group_duration{group:::employees}': ['p(95)<3000'],
    'group_duration{group:::payroll}': ['p(95)<3000'],
  },

  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
  discardResponseBodies: false, // we assert on body shape in checks
  noConnectionReuse: false,
};
