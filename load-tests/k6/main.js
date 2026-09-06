import http from 'k6/http';
import { sleep, group } from 'k6';
import { CONFIG } from './config/env.js';
import { options as loadOptions } from './config/options.js';
import { login, authHeaders } from './lib/auth.js';
import { authGet } from './lib/http.js';
import { buildModules, resolvePath } from './lib/endpoints.js';
import { handleSummary } from './lib/summary.js';

export const options = loadOptions;
export { handleSummary };

const rand = (min, max) => Math.random() * (max - min) + min;

// ---------------------------------------------------------------------------
// setup() runs ONCE before the load. It logs in with the admin demo account so
// the 1k browsing VUs share a single token (no login storm), and discovers a few
// real document ids so the `:id` endpoints are exercised against real data.
// ---------------------------------------------------------------------------
export function setup() {
  const token = login(CONFIG.ADMIN_EMAIL, CONFIG.ADMIN_PASSWORD);
  const h = { headers: authHeaders(token), timeout: CONFIG.REQUEST_TIMEOUT };
  const get = (p) => http.get(`${CONFIG.BASE_URL}${p}`, h);

  const firstId = (res) => {
    try {
      const d = res.json('data');
      const arr = Array.isArray(d) ? d : d && d.data;
      return arr && arr.length ? (arr[0]._id || arr[0].id || null) : null;
    } catch {
      return null;
    }
  };

  const ids = {
    employeeId: firstId(get('/employees?limit=1')),
    payrunId: firstId(get('/payruns')),
    payslipId: firstId(get('/payslips?limit=1')),
    roleId: firstId(get('/roles')),
  };

  console.log(`setup complete — auth token: ${token ? 'acquired' : 'none (dev bypass)'}; discovered ids: ${JSON.stringify(ids)}`);
  return { token, ids };
}

function weightedPick(modules) {
  const total = modules.reduce((s, m) => s + m.weight, 0);
  let r = Math.random() * total;
  for (const m of modules) {
    r -= m.weight;
    if (r <= 0) return m;
  }
  return modules[modules.length - 1];
}

// Built once per VU (init of setup data isn't available at module init, so memoise).
let MODULES = null;

// ---------------------------------------------------------------------------
// browse() — the headline scenario. Each iteration models a user viewing one
// section of the app: pick a module (weighted toward high-traffic areas), hit a
// representative endpoint inside a k6 group() so the report breaks down per
// module, then think for a moment. Ramps to 1000 concurrent VUs.
// ---------------------------------------------------------------------------
export function browse(data) {
  if (!MODULES) MODULES = buildModules(data.ids);
  const mod = weightedPick(MODULES);

  group(mod.group, () => {
    const ep = mod.endpoints[Math.floor(Math.random() * mod.endpoints.length)];
    if (ep) authGet(data.token, ep.name, mod.group, resolvePath(ep.path));
  });

  sleep(rand(CONFIG.THINK_MIN, CONFIG.THINK_MAX));
}

// ---------------------------------------------------------------------------
// authFlow() — a steady trickle of real logins running alongside the browse load
// so we measure /auth/login (bcrypt) latency under concurrency without a 1k-wide
// login storm that would only measure CPU saturation.
// ---------------------------------------------------------------------------
export function authFlow() {
  const token = login(CONFIG.ADMIN_EMAIL, CONFIG.ADMIN_PASSWORD);
  if (token) authGet(token, 'GET /auth/me', 'auth', '/auth/me');
  sleep(rand(0.5, 1.5));
}
