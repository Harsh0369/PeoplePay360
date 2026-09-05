// Maps any status string to a consistent semantic color. Add new statuses here
// so every module shows the same colors for the same meaning.
const MAP = {
  // positive / done
  active: 'bg-emerald-50 text-emerald-700',
  running: 'bg-emerald-50 text-emerald-700',
  approved: 'bg-emerald-50 text-emerald-700',
  paid: 'bg-emerald-50 text-emerald-700',
  validated: 'bg-emerald-50 text-emerald-700',
  present: 'bg-emerald-50 text-emerald-700',
  // in-progress / neutral
  draft: 'bg-slate-100 text-slate-600',
  to_approve: 'bg-amber-50 text-amber-700',
  computed: 'bg-indigo-50 text-indigo-700',
  late: 'bg-amber-50 text-amber-700',
  half_day: 'bg-amber-50 text-amber-700',
  // negative / stopped
  inactive: 'bg-slate-100 text-slate-500',
  expired: 'bg-rose-50 text-rose-600',
  cancelled: 'bg-rose-50 text-rose-600',
  refused: 'bg-rose-50 text-rose-600',
  absent: 'bg-rose-50 text-rose-600',
  overtime: 'bg-indigo-50 text-indigo-700',
};

const LABELS = { to_approve: 'To Approve', half_day: 'Half Day' };

export default function StatusBadge({ status }) {
  if (!status) return null;
  const cls = MAP[status] || 'bg-slate-100 text-slate-600';
  const label = LABELS[status] || status.charAt(0).toUpperCase() + status.slice(1);
  return <span className={`badge ${cls}`}>{label}</span>;
}
