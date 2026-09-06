import http from 'k6/http';
import { check } from 'k6';
import { CONFIG } from '../config/env.js';
import { authHeaders } from './auth.js';
import { businessErrors, apiCalls, apiLatency } from './metrics.js';

/**
 * Issue one authenticated GET, tag it (so the summary/report breaks down per
 * endpoint and per module), assert on it, and feed the custom metrics.
 *
 * @param {string} token   bearer token from setup()
 * @param {string} name    stable label, e.g. "GET /employees"
 * @param {string} group   module bucket, e.g. "employees"
 * @param {string} path    path relative to BASE_URL, e.g. "/employees?limit=20"
 */
export function authGet(token, name, group, path) {
  const res = http.get(`${CONFIG.BASE_URL}${path}`, {
    headers: authHeaders(token),
    tags: { name, group },
    timeout: CONFIG.REQUEST_TIMEOUT,
  });

  apiCalls.add(1, { group });
  apiLatency.add(res.timings.duration, { group });

  const ok = check(res, {
    [`${name}: status 2xx`]: (r) => r.status >= 200 && r.status < 300,
    [`${name}: has body`]: (r) => !!r.body && r.body.length > 0,
  });

  // A transport-OK response that still carries an error shape counts as a failure.
  businessErrors.add(!ok, { group });
  return res;
}
