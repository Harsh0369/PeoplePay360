import http from 'k6/http';
import { check } from 'k6';
import { CONFIG } from '../config/env.js';

/**
 * Log in and return a JWT, or null on failure. Used both in setup() (once, to
 * share a token across the browsing VUs) and by the dedicated auth scenario.
 */
export function login(email, password) {
  const res = http.post(
    `${CONFIG.BASE_URL}/auth/login`,
    JSON.stringify({ email: email || CONFIG.ADMIN_EMAIL, password: password || CONFIG.ADMIN_PASSWORD }),
    { headers: { 'Content-Type': 'application/json' }, tags: { name: 'POST /auth/login', group: 'auth' }, timeout: CONFIG.REQUEST_TIMEOUT },
  );

  check(res, {
    'login: status 200': (r) => r.status === 200,
    'login: returned token': (r) => {
      try { return !!(r.json('data.token') || r.json('token')); } catch { return false; }
    },
  });

  try {
    return res.json('data.token') || res.json('token') || null;
  } catch {
    return null;
  }
}

/** Authorization headers for a bearer token (empty object if none — the dev
 *  server treats token-less requests as admin, so the suite still works). */
export function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
