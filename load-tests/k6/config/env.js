// Central configuration for the load test. Everything is overridable from the
// command line via `-e KEY=value` so the same suite runs against local, staging
// or CI without code changes.
//
// Example:
//   k6 run -e BASE_URL=http://localhost:5000/api/v1 -e PEAK_VUS=1000 main.js

const env = (k, fallback) => (typeof __ENV[k] === 'string' && __ENV[k] !== '' ? __ENV[k] : fallback);
const num = (k, fallback) => {
  const v = env(k, null);
  const n = v === null ? NaN : Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export const CONFIG = {
  // API root — note the /api/v1 prefix the server mounts every route under.
  BASE_URL: env('BASE_URL', 'http://localhost:5000/api/v1'),

  // Admin demo account (full read access) — see CREDS.md. Used once in setup()
  // so the 1k browsing VUs share a token instead of a login storm.
  ADMIN_EMAIL: env('ADMIN_EMAIL', 'admin@peoplepay.com'),
  ADMIN_PASSWORD: env('ADMIN_PASSWORD', 'Test@1234'),

  // Load shape. Peak concurrency defaults to 1000 concurrent VUs ("users").
  PEAK_VUS: num('PEAK_VUS', 1000),

  // Per-iteration think time bounds (seconds) — models real users pausing
  // between actions rather than hammering in a tight loop.
  THINK_MIN: num('THINK_MIN', 0.5),
  THINK_MAX: num('THINK_MAX', 2.5),

  // Per-request timeout.
  REQUEST_TIMEOUT: env('REQUEST_TIMEOUT', '30s'),
};
