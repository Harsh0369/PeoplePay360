import axios from 'axios';
import { mockRequest } from './mock.js';
import {
  unwrapEnvelope, toUiEmployee, toUiContract, toUiRule, toUiStructure, toUiUser,
} from './adapters.js';

/**
 * Data access with three modes (set VITE_USE_MOCK in .env):
 *   true  -> everything from the in-memory mock (safe, fully featured demo)
 *   false -> HYBRID: real backend for what it actually implements,
 *            mock for the rest, so no screen breaks.
 *
 * The backend currently exposes list endpoints only for employees, contracts
 * and payroll-config (rules/structures). Attendance and time-off expose only
 * POST actions, and payruns/payslips/schedules/users don't exist yet — those
 * stay on mock until the backend adds them.
 */
const FULL_MOCK = String(import.meta.env.VITE_USE_MOCK ?? 'true') !== 'false';

const http = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('pp_token');
  if (token && !token.startsWith('mock.')) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message || err.response?.data?.error || err.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

// Resources the real backend can actually serve (GET list/detail).
const REAL = {
  employees: { path: '/employees', norm: toUiEmployee },
  contracts: { path: '/contracts', norm: toUiContract },
  salaryRules: { path: '/payroll-config/rules', norm: toUiRule },
  salaryStructures: { path: '/payroll-config/structures', norm: toUiStructure },
};

async function realLogin(body) {
  const res = await http.post('/auth/login', body);
  const data = unwrapEnvelope(res.data);
  return { token: data.token, user: toUiUser(data.user) };
}

/**
 * @param {object} [opts]
 * @param {boolean} [opts.forceMock] Always use the mock. Needed by modules that
 *   are mock-only (payroll) so their records stay internally consistent instead
 *   of half-referencing real API data.
 */
export async function apiRequest(method, path, body, opts = {}) {
  if (FULL_MOCK || opts.forceMock) return mockRequest(method, path, body);

  const [, resource, id, action] = path.split('/');

  // --- Auth: try the real backend, fall back to the mock demo accounts ---
  if (resource === 'auth' && id === 'login') {
    try {
      return await realLogin(body);
    } catch {
      // Lets the seeded demo accounts keep working alongside real credentials.
      return mockRequest(method, path, body);
    }
  }

  const cfg = REAL[resource];
  if (!cfg) return mockRequest(method, path, body); // hybrid fallback

  // Reads come from the real API.
  if (method === 'get') {
    try {
      const res = await http.get(id ? `${cfg.path}/${id}` : cfg.path);
      const data = unwrapEnvelope(res.data);
      return Array.isArray(data) ? data.map(cfg.norm) : cfg.norm(data);
    } catch (err) {
      // Auth-gated or unavailable -> don't break the screen.
      console.warn(`[api] real GET ${cfg.path} failed (${err.message}); using mock`);
      return mockRequest(method, path, body);
    }
  }

  // Writes stay on mock: the backend expects different payloads (ObjectId
  // departmentId/jobPositionId etc.) and we must not write into the shared
  // team database from demo forms.
  return mockRequest(method, path, body);
}

export const IS_MOCK = FULL_MOCK;
