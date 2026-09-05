import {
  Wallet,
  FileText,
  TrendingUp,
  CalendarCheck,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { inrCompact, inr, num } from '../lib/format.js';

const KPIS = [
  { label: 'Total Net Salary Paid', value: inrCompact(7840000), sub: 'This month', icon: Wallet, tint: 'text-brand bg-brand-light' },
  { label: 'Payslips Generated', value: num(748), sub: 'Feb 2026', icon: FileText, tint: 'text-indigo-600 bg-indigo-50' },
  { label: 'Average Salary', value: inr(12482), sub: 'Per employee', icon: TrendingUp, tint: 'text-emerald-600 bg-emerald-50' },
  { label: 'Approved Time Off', value: '34 Days', sub: 'This month', icon: CalendarCheck, tint: 'text-amber-600 bg-amber-50' },
  { label: 'Attendance Health', value: '96%', sub: 'Coverage', icon: Activity, tint: 'text-emerald-600 bg-emerald-50' },
];

const DEPT = [
  { name: 'Engineering', value: 92 },
  { name: 'Sales', value: 68 },
  { name: 'Design', value: 45 },
  { name: 'Finance', value: 54 },
  { name: 'HR', value: 30 },
  { name: 'Support', value: 40 },
];

const ALERTS = [
  { t: 'Missing bank details — 3 employees', kind: 'danger' },
  { t: 'Duplicate payslip flagged — Payrun Feb 2026', kind: 'warning' },
  { t: '2 contracts expiring this month', kind: 'warning' },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {KPIS.map((k) => (
          <div key={k.label} className="card p-4">
            <div className={`mb-3 grid h-10 w-10 place-items-center rounded-lg ${k.tint}`}>
              <k.icon size={20} />
            </div>
            <div className="text-2xl font-bold tracking-tight">{k.value}</div>
            <div className="mt-1 text-sm font-medium text-ink">{k.label}</div>
            <div className="text-xs text-muted">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Salary cost by department */}
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Salary Cost by Department</h2>
            <span className="badge bg-brand-light text-brand">Feb 2026</span>
          </div>
          <div className="flex h-56 items-end gap-4">
            {DEPT.map((d) => (
              <div key={d.name} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-brand to-indigo-400 transition-all hover:opacity-90"
                  style={{ height: `${d.value}%` }}
                  title={`${d.name}: ${d.value}`}
                />
                <span className="text-xs text-muted">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-warning" />
            <h2 className="font-semibold">Payroll Alerts</h2>
          </div>
          <ul className="space-y-3">
            {ALERTS.map((a, i) => (
              <li
                key={i}
                className={`flex items-start gap-3 rounded-lg border p-3 text-sm ${
                  a.kind === 'danger'
                    ? 'border-danger/20 bg-danger/5'
                    : 'border-warning/20 bg-warning/5'
                }`}
              >
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    a.kind === 'danger' ? 'bg-danger' : 'bg-warning'
                  }`}
                />
                <span className="text-ink">{a.t}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">
            Live warnings surface before a payrun is finalized.
          </p>
        </div>
      </div>

      <p className="text-center text-xs text-muted">
        Sample data shown — will bind to live HR &amp; Payroll records once the API is connected.
      </p>
    </div>
  );
}
