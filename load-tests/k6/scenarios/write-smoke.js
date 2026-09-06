// OPTIONAL, LOW-VOLUME write smoke test — NOT part of the 1k-user run.
//
// Why separate: the main suite targets a SHARED database. Driving create/update
// endpoints at 1k concurrency would flood it with junk (and the only cleanup is a
// destructive re-seed). This scenario instead pokes each write endpoint a handful
// of times at low concurrency, with clearly-labelled "LOADTEST-" records, just to
// confirm the write paths respond under light load.
//
// Run it deliberately:
//   .bin/k6.exe run k6/scenarios/write-smoke.js
//
// It creates a small, bounded number of throwaway roles / departments / schedules
// and raises a couple of time-off requests. Clean these up with a re-seed if you
// want a pristine DB afterwards.

import http from 'k6/http';
import { check, sleep } from 'k6';
import { CONFIG } from '../config/env.js';
import { login, authHeaders } from '../lib/auth.js';

export const options = {
  scenarios: {
    writes: {
      executor: 'per-vu-iterations',
      vus: 5,
      iterations: 4, // 5 VUs x 4 = 20 iterations total — deliberately tiny
      exec: 'writeFlow',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.25'],
  },
};

export function setup() {
  return { token: login(CONFIG.ADMIN_EMAIL, CONFIG.ADMIN_PASSWORD) };
}

export function writeFlow(data) {
  const headers = { 'Content-Type': 'application/json', ...authHeaders(data.token) };
  const stamp = `${__VU}-${__ITER}-${Date.now()}`;
  const post = (path, body, name) =>
    http.post(`${CONFIG.BASE_URL}${path}`, JSON.stringify(body), { headers, tags: { name }, timeout: CONFIG.REQUEST_TIMEOUT });

  const role = post('/roles', { name: `LOADTEST-Role-${stamp}`, dataScope: 'self', permissions: { 'Employee.Read': true } }, 'POST /roles');
  check(role, { 'create role: 2xx': (r) => r.status >= 200 && r.status < 300 });

  const dept = post('/departments', { name: `LOADTEST-Dept-${stamp}` }, 'POST /departments');
  check(dept, { 'create department: 2xx': (r) => r.status >= 200 && r.status < 300 });

  const schedule = post('/working-schedules', {
    name: `LOADTEST-Schedule-${stamp}`,
    workingDays: [{ dayOfWeek: 'Monday', startTime: '09:00', endTime: '18:00', breakDurationMinutes: 60 }],
  }, 'POST /working-schedules');
  check(schedule, { 'create schedule: 2xx': (r) => r.status >= 200 && r.status < 300 });

  sleep(1);
}
