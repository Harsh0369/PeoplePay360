/**
 * Odoo-style smart button: shows a count + label and opens a related, filtered
 * view. Used on Form screens (e.g. an Employee's Contracts / Attendance).
 */
export default function SmartButton({ icon: Icon, count, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex min-w-[120px] items-center gap-3 rounded-lg border border-line bg-white px-4 py-2.5 text-left transition hover:border-brand hover:shadow-sm"
    >
      {Icon && (
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-light text-brand">
          <Icon size={18} />
        </span>
      )}
      <span className="leading-tight">
        <span className="block text-lg font-semibold text-ink">{count ?? 0}</span>
        <span className="block text-xs text-muted">{label}</span>
      </span>
    </button>
  );
}
