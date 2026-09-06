// The complete read (GET) surface of the API, grouped by module and weighted so
// list/dashboard endpoints (what real users hit most) get proportionally more
// traffic. `:id` endpoints are only included when setup() discovered a real id.
//
// Paths may be a string or a () => string (used to randomise pagination so we are
// not just serving one cached page over and over).
//
// NOTE ON WRITES: create/update/delete endpoints are intentionally excluded from
// the default 1k-user run. This suite targets a SHARED database, and hammering
// writes at 1k concurrency would pollute it with thousands of junk records (and
// on this project the only cleanup is a full destructive re-seed). Writes are
// covered separately and safely by scenarios/write-smoke.js.

const rint = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pagedList = (base, maxPage = 10) => () => {
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}page=${rint(1, maxPage)}&limit=20`;
};

export function buildModules(ids = {}) {
  const modules = [
    {
      group: 'dashboard',
      weight: 12,
      endpoints: [{ name: 'GET /dashboard/stats', path: '/dashboard/stats' }],
    },
    {
      group: 'employees',
      weight: 20,
      endpoints: [
        { name: 'GET /employees', path: pagedList('/employees', 75) },
        { name: 'GET /employees?search', path: () => `/employees?search=${['a', 'priya', 'sh', 'kumar', 'raj'][rint(0, 4)]}&limit=20` },
        { name: 'GET /employees/me', path: '/employees/me' },
        ids.employeeId && { name: 'GET /employees/:id', path: `/employees/${ids.employeeId}` },
      ],
    },
    {
      group: 'contracts',
      weight: 12,
      endpoints: [
        { name: 'GET /contracts', path: pagedList('/contracts', 80) },
        ids.employeeId && { name: 'GET /contracts/applicable/:employeeId', path: `/contracts/applicable/${ids.employeeId}` },
      ],
    },
    {
      group: 'jobPositions',
      weight: 6,
      endpoints: [{ name: 'GET /job-positions', path: '/job-positions' }],
    },
    {
      group: 'org',
      weight: 8,
      endpoints: [
        { name: 'GET /departments', path: '/departments' },
        { name: 'GET /working-schedules', path: '/working-schedules' },
      ],
    },
    {
      group: 'attendance',
      weight: 14,
      endpoints: [
        { name: 'GET /attendance', path: pagedList('/attendance', 100) },
        { name: 'GET /attendance/my', path: '/attendance/my' },
      ],
    },
    {
      group: 'timeoff',
      weight: 10,
      endpoints: [
        { name: 'GET /time-off/types', path: '/time-off/types' },
        { name: 'GET /time-off/allocations', path: pagedList('/time-off/allocations', 30) },
        { name: 'GET /time-off/requests', path: pagedList('/time-off/requests', 25) },
        { name: 'GET /time-off/my/allocations', path: '/time-off/my/allocations' },
        { name: 'GET /time-off/my/requests', path: '/time-off/my/requests' },
      ],
    },
    {
      group: 'payroll',
      weight: 12,
      endpoints: [
        { name: 'GET /payruns', path: '/payruns' },
        { name: 'GET /payslips', path: pagedList('/payslips', 40) },
        { name: 'GET /payslips/my', path: '/payslips/my' },
        ids.payrunId && { name: 'GET /payruns/:id', path: `/payruns/${ids.payrunId}` },
        ids.payrunId && { name: 'GET /payruns/:id/eligible-employees', path: `/payruns/${ids.payrunId}/eligible-employees` },
        ids.payslipId && { name: 'GET /payslips/:id', path: `/payslips/${ids.payslipId}` },
      ],
    },
    {
      group: 'config',
      weight: 6,
      endpoints: [
        { name: 'GET /payroll-config/rules', path: '/payroll-config/rules' },
        { name: 'GET /payroll-config/structures', path: '/payroll-config/structures' },
      ],
    },
    {
      group: 'roles',
      weight: 5,
      endpoints: [
        { name: 'GET /roles', path: '/roles' },
        ids.roleId && { name: 'GET /roles/:id', path: `/roles/${ids.roleId}` },
      ],
    },
    {
      group: 'users',
      weight: 5,
      endpoints: [
        { name: 'GET /users', path: pagedList('/users', 75) },
        { name: 'GET /users/join-requests', path: '/users/join-requests' },
      ],
    },
    {
      group: 'audit',
      weight: 8,
      endpoints: [{ name: 'GET /business-logs', path: pagedList('/business-logs', 200) }],
    },
    {
      group: 'permissions',
      weight: 3,
      endpoints: [{ name: 'GET /permissions/registry', path: '/permissions/registry' }],
    },
    {
      group: 'auth',
      weight: 4,
      endpoints: [{ name: 'GET /auth/me', path: '/auth/me' }],
    },
    {
      group: 'health',
      weight: 2,
      endpoints: [{ name: 'GET /health', path: '/health' }],
    },
  ];

  // Drop any falsy (skipped :id) endpoints.
  return modules.map((m) => ({ ...m, endpoints: m.endpoints.filter(Boolean) }));
}

/** Resolve a path that may be a string or a () => string. */
export const resolvePath = (p) => (typeof p === 'function' ? p() : p);
