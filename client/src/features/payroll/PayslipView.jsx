import { Printer, AlertTriangle } from 'lucide-react';
import FormDrawer from '../../components/ui/FormDrawer.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { inr } from '../../lib/format.js';

const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

// Opens a print-ready window (acts as the "Print Payslip / PDF" action).
function printPayslip(slip, empName) {
  const rows = slip.lines
    .map((l) => `<tr><td>${l.ruleName}</td><td style="text-align:right;color:${l.amount < 0 ? '#dc2626' : '#111'}">${inr(l.amount)}</td></tr>`)
    .join('');
  const html = `<!doctype html><html><head><title>Payslip - ${empName}</title>
  <style>
    body{font-family:Inter,Arial,sans-serif;color:#0f172a;padding:40px;max-width:640px;margin:auto}
    h1{color:#4F46E5;margin:0 0 4px} .muted{color:#64748b;font-size:13px}
    table{width:100%;border-collapse:collapse;margin-top:20px} td{padding:8px 4px;border-bottom:1px solid #eee}
    .net{background:#EEF2FF;font-weight:700} .net td{border:0;font-size:18px}
    .hd{display:flex;justify-content:space-between;border-bottom:2px solid #4F46E5;padding-bottom:12px}
  </style></head><body>
  <div class="hd"><div><h1>PeoplePay360</h1><div class="muted">Payslip</div></div>
  <div style="text-align:right"><strong>${empName}</strong><div class="muted">${fmt(slip.periodStart)} – ${fmt(slip.periodEnd)}</div>
  <div class="muted">Worked ${slip.workedDays}/${slip.totalDays} days</div></div></div>
  <table>${rows}
  <tr class="net"><td>Net Salary</td><td style="text-align:right">${inr(slip.net)}</td></tr></table>
  <p class="muted" style="margin-top:24px">Gross ${inr(slip.gross)} · Deductions ${inr(slip.deductionsTotal)}</p>
  </body></html>`;
  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 300);
}

export default function PayslipView({ open, slip, empName, onClose }) {
  if (!slip) return null;
  const earnings = slip.lines.filter((l) => l.amount >= 0);
  const deductions = slip.lines.filter((l) => l.amount < 0);

  return (
    <FormDrawer
      open={open}
      title={`Payslip — ${empName}`}
      subtitle={`${fmt(slip.periodStart)} – ${fmt(slip.periodEnd)} · Worked ${slip.workedDays}/${slip.totalDays} days`}
      onClose={onClose}
      footer={
        <>
          <StatusBadge status={slip.state} />
          <button className="btn-primary ml-auto" onClick={() => printPayslip(slip, empName)}>
            <Printer size={16} /> Print / PDF
          </button>
        </>
      }
    >
      {slip.warnings?.length > 0 && (
        <div className="mb-4 rounded-lg border border-warning/30 bg-warning/5 p-3">
          {slip.warnings.map((w, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-amber-700">
              <AlertTriangle size={15} /> {w}
            </div>
          ))}
        </div>
      )}

      <Section title="Earnings" lines={earnings} />
      <Section title="Deductions" lines={deductions} />

      <div className="mt-5 space-y-2 rounded-xl bg-brand-light p-4">
        <Row label="Gross" value={inr(slip.gross)} />
        <Row label="Total Deductions" value={inr(-slip.deductionsTotal)} danger />
        <div className="border-t border-brand/20 pt-2">
          <Row label="Net Salary" value={inr(slip.net)} big />
        </div>
      </div>
    </FormDrawer>
  );
}

function Section({ title, lines }) {
  if (!lines.length) return null;
  return (
    <div className="mb-4">
      <h3 className="mb-2 text-sm font-semibold text-muted">{title}</h3>
      <div className="card divide-y divide-line">
        {lines.map((l) => (
          <div key={l.ruleCode} className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span>{l.ruleName} <span className="ml-1 font-mono text-xs text-muted">{l.ruleCode}</span></span>
            <span className={`font-medium ${l.amount < 0 ? 'text-rose-600' : 'text-ink'}`}>{inr(l.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value, big, danger }) {
  return (
    <div className="flex items-center justify-between">
      <span className={big ? 'font-semibold text-ink' : 'text-sm text-ink'}>{label}</span>
      <span className={`${big ? 'text-xl font-bold text-brand' : 'font-medium'} ${danger ? 'text-rose-600' : ''}`}>{value}</span>
    </div>
  );
}
