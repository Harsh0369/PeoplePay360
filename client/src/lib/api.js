import axios from 'axios';
import { mockRequest } from './mock.js';

// Defaults to mock unless explicitly disabled, so the app runs with no .env.
const USE_MOCK = String(import.meta.env.VITE_USE_MOCK ?? 'true') !== 'false';

const http = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token if present (backend teammate can read `Authorization`).
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('pp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize errors so every screen shows a consistent message.
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.error || err.response?.data?.message || err.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

/**
 * Single entry point for all data access. When VITE_USE_MOCK=true it routes to
 * the in-memory mock adapter, so frontend devs are never blocked by the backend.
 * Flip the flag to hit the real API — no screen code changes.
 *
 * @param {'get'|'post'|'put'|'patch'|'delete'} method
 * @param {string} path  e.g. '/employees' or '/employees/123'
 * @param {object} [body]
 */
export async function apiRequest(method, path, body) {
  if (USE_MOCK) return mockRequest(method, path, body);
  const res = await http.request({ method, url: path, data: body });
  return res.data;
}

export const IS_MOCK = USE_MOCK;
