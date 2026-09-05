import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, ShieldCheck, BadgeCheck, Mail, AlertTriangle } from 'lucide-react';
import DataTable from '../../components/ui/DataTable.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import PayslipView from './PayslipView.jsx';
import {
  usePayrun, usePayslips, useEmployees, useStructures,
  useComputePayrun, useValidatePayrun, useMarkPaidPayrun, useSendPayslips,
} from './api.js';
import { inr } from '../../lib/format.js';

export default function PayrunView() {
  const { id } = useParams();
  const nav = useNavigate();
  const { data: run, isLoading } = usePayrun(id);
  const { data: allSlips = [] } = usePayslips();
  const { data: employees = [] } = useEmployees();
  const { data: structures = [] } = useStructures();

  const compute = useComputePayrun();
  const validate = useValidatePayrun();
  const markPaid = useMarkPaidPayrun();
  const send = useSendPayslips();

  const [slip, setSlip] = useState(null);
  const [slipOpen, setSlipOpen] = useState(false);

  const empName = (eid) => employees.find((e) => e._id === eid)?.name || '—';
  const structName = (sid) => structures.find((s) => s._id === sid)?.name || '—';
  const slips = useMemo(() => allSlips.filter((s) => s.payrun === id), [allSlips, id]);
  const totals = useMemo(() => ({
    net: slips.reduce((s, x) => s + (x.net || 0), 0),
    warnings: slips.reduce((s, x) => s + (x.warnings?.length || 0), 0),
  }), [slips]);

  if (isLoading || !run) return <div className="card p-10 text-center text-muted">Loading payrun…</div>;

  const columns = [
    { key: 'emp', label: 'Employee', render: (r) => <span className="font-medium">{empName(r.employee)}</span> },
    { key: 'workedDays', label: 'Worked', render: (r) => `${r.workedDays}/${r.totalDays}` },
    { key: 'gross', label: 'Gross', className: 'text-right', render: (r) => inr(r.gross) },
    { key: 'deductionsTotal', label: 'Deductions', className: 'text-right', render: (r) => <span className="text-rose-600">{inr(-r.deductionsTotal)}</span> },
    { key: 'net', label: 'Net', className: 'text-right', render: (r) => <span className="font-semibold">{inr(r.net)}</span> },
    {
      key: 'warn', label: '', render: (r) => r.warnings?.length
        ? <span className="badge bg-warning/10 text-amber-700"><AlertTriangle size={12} className="mr-1" />{r.warnings.length}</span> : null,
    },
    { key: 'state', label: 'Status', render: (r) => <StatusBadge status={r.state} /> },
  ];

  const act = (m) => m.mutate(id);

  return (
    <div>
      <button className="btn-ghost mb-3 -ml-2 text-muted" onClick={() => nav('/payroll')}><ArrowLeft size={16} /> Payruns</button>

      <div className="card mb-5 flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">{run.name}</h2>
            <StatusBadge status={run.state} />
          </div>
          <p className="mt-1 text-sm text-muted">
            {structName(run.salaryStructure)} · {run.employees?.length || 0} employees
            {slips.length > 0 && <> · Net {inr(totals.net)}</>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="btn-primary" onClick={() => act(compute)} disabled={compute.isPending || run.state === 'paid'}>
            <Calculator size={16} /> {compute.isPending ? 'Computing…' : 'Compute'}
          </button>
          <button className="btn-ghost border border-line" onClick={() => act(validate)} disabled={run.state !== 'computed'}>
            <ShieldCheck size={16} /> Validate
          </button>
          <button className="btn-ghost border border-line" onClick={() => act(markPaid)} disabled={run.state !== 'validated'}>
            <BadgeCheck size={16} /> Mark Paid
          </button>
          <button className="btn-ghost border border-line" onClick={() => send.mutate(id, { onSuccess: (r) => alert(`Sent ${r.sent} payslips by email.`) })} disabled={slips.length === 0}>
            <Mail size={16} /> Send Payslips
          </button>
        </div>
      </div>

      {totals.warnings > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm text-amber-700">
          <AlertTriangle size={16} /> {totals.warnings} warning(s) across payslips — resolve before marking paid.
        </div>
      )}

      <DataTable
        columns={columns} rows={slips}
        onRowClick={(r) => { setSlip(r); setSlipOpen(true); }}
        empty="No payslips yet. Click Compute to generate them."
      />

      <PayslipView open={slipOpen} slip={slip} empName={slip ? empName(slip.employee) : ''} onClose={() => setSlipOpen(false)} />
    </div>
  );
}
