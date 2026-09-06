import React, { useEffect, useState } from 'react';
import {
  Plus, Loader2, RefreshCw, ArrowLeft, Calculator, ShieldCheck, BadgeCheck, XCircle, Printer,
} from 'lucide-react';
import { payrollApi } from '../services/hrApi';
import { inr, fmtDate } from '../lib/format';
import { Card, Table, EmptyRow, Field, Drawer } from './ConfigModule';
import { useAuth } from '../hooks/useAuth';
import { PERM } from '../lib/permissions';
import { useClientList } from '../hooks/usePagedList';
import { SearchBar } from './ui/SearchBar';
import { Paginator } from './ui/Paginator';
import { notify } from '../lib/toast';

const STATUS_BADGE: Record<string, string> = {
  DRAFT: 'bg-brand-draftBg text-brand-draftText',
  COMPUTED: 'bg-brand-leaveBg text-brand-leaveText',
  VALIDATED: 'bg-brand-activeBg text-brand-activeText',
  PAID: 'bg-brand-activeBg text-brand-activeText',
  CANCELLED: 'bg-brand-warningBg text-brand-warningText',
};
const Badge = ({ s }: { s: string }) => (
  <span className={`badge ${STATUS_BADGE[(s || '').toUpperCase()] || 'bg-brand-draftBg text-brand-draftText'}`}>{s}</span>
);
const nameOf = (v: any) => (v && typeof v === 'object' ? v.name : v) || '—';

export const PayrollModule: React.FC = () => {
  const { can } = useAuth();
  const canWrite = can(...PERM.payrollWrite);
  const [payruns, setPayruns] = useState<any[]>([]);
  const cl = useClientList(payruns, { searchFields: ['status', 'createdBy.name'], pageSize: 15 });
  const [detail, setDetail] = useState<any>(null); // { payrun, payslips, totals }
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [slip, setSlip] = useState<any>(null);
  const [form, setForm] = useState({ periodStart: '', periodEnd: '' });

  const loadList = async () => {
    setLoading(true); setError('');
    try {
      const r = await payrollApi.getPayruns();
      setPayruns(Array.isArray(r) ? r : []);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadList(); }, []);

  const openDetail = async (id: string) => {
    setLoading(true); setError('');
    try { setDetail(await payrollApi.getPayrunDetail(id)); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const act = async (fn: () => Promise<any>, label: string) => {
    setBusy(label);
    try {
      await fn();
      notify.success(`Payrun ${label === 'markpaid' ? 'marked paid' : label + 'd'} successfully.`);
      if (detail?.payrun?._id) await openDetail(detail.payrun._id);
      else await loadList();
    } catch (e: any) { notify.error(e.message); }
    finally { setBusy(''); }
  };

  const createPayrun = async () => {
    setBusy('create');
    try {
      const run: any = await payrollApi.createPayrun({
        periodStart: form.periodStart, periodEnd: form.periodEnd,
      });
      notify.success('Payrun created.');
      setShowNew(false); setForm({ periodStart: '', periodEnd: '' });
      const id = run?._id || run?.payrun?._id;
      if (id) await openDetail(id); else await loadList();
    } catch (e: any) { notify.error(e.message); }
    finally { setBusy(''); }
  };

  // ---------- Detail view ----------
  if (detail?.payrun) {
    const run = detail.payrun;
    const st = (run.status || '').toUpperCase();
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button onClick={() => setDetail(null)} className="flex items-center gap-1.5 text-sm text-brand-mutedSlate hover:text-brand-darkCharcoal mb-3">
          <ArrowLeft className="w-4 h-4" /> All Payruns
        </button>

        <div className="bg-brand-offWhite rounded-xl border border-brand-sandBorder shadow-sm p-5 mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-brand-darkCharcoal">
                {fmtDate(run.periodStart)} – {fmtDate(run.periodEnd)}
              </h2>
              <Badge s={run.status} />
            </div>
            <p className="text-sm text-brand-mutedSlate mt-1">
              {nameOf(run.departmentId) === '—' ? 'All departments' : nameOf(run.departmentId)} ·{' '}
              {detail.totals?.employeeCount ?? detail.payslips?.length ?? 0} payslips · Net {inr(detail.totals?.totalNet || 0)}
            </p>
          </div>
          {canWrite ? (
          <div className="flex flex-wrap items-center gap-2">
            <ActBtn icon={Calculator} label="Compute" busy={busy === 'compute'} disabled={st === 'PAID' || st === 'CANCELLED'} onClick={() => act(() => payrollApi.compute(run._id), 'compute')} primary />
            <ActBtn icon={ShieldCheck} label="Validate" busy={busy === 'validate'} disabled={st !== 'COMPUTED'} onClick={() => act(() => payrollApi.validate(run._id), 'validate')} />
            <ActBtn icon={BadgeCheck} label="Mark Paid" busy={busy === 'markpaid'} disabled={st !== 'VALIDATED'} onClick={() => act(() => payrollApi.markPaid(run._id), 'markpaid')} />
            <ActBtn icon={XCircle} label="Cancel" busy={busy === 'cancel'} disabled={st === 'PAID' || st === 'CANCELLED'} onClick={() => act(() => payrollApi.cancel(run._id), 'cancel')} />
          </div>
          ) : (
            <span className="text-xs text-slate-400 italic">Read-only — you can view payslips but not process this payrun.</span>
          )}
        </div>

        {error && <div className="mb-4 rounded-lg bg-brand-warningBg text-brand-warningText px-3 py-2.5 text-sm">{error}</div>}

        <Card>
          <Table head={['Employee', 'Gross', 'Deductions', 'Net', '']}>
            {(detail.payslips || []).map((ps: any) => (
              <tr key={ps._id} className="border-b border-brand-sandBorder/60 last:border-0 hover:bg-brand-hoverRow cursor-pointer" onClick={() => setSlip(ps)}>
                <td className="td font-medium text-brand-darkCharcoal">{nameOf(ps.employeeId)}</td>
                <td className="td">{inr(ps.grossSalary)}</td>
                <td className="td text-brand-warningText">{inr(-ps.totalDeductions)}</td>
                <td className="td font-semibold">{inr(ps.netSalary)}</td>
                <td className="td text-brand-teal text-xs">View</td>
              </tr>
            ))}
            {(!detail.payslips || detail.payslips.length === 0) && <EmptyRow cols={5} msg="No payslips. Click Compute to generate them." />}
          </Table>
        </Card>

        {slip && <PayslipDrawer slip={slip} onClose={() => setSlip(null)} />}
      </div>
    );
  }

  // ---------- List view ----------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-brand-darkCharcoal">Payroll — Payruns</h2>
          <p className="text-sm text-brand-mutedSlate">Create a payrun, compute payslips, validate and mark paid.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadList} className="p-2 rounded-lg border border-brand-sandBorder text-brand-mutedSlate hover:bg-brand-hoverRow"><RefreshCw className="w-4 h-4" /></button>
          {canWrite && (
            <button onClick={() => setShowNew(true)} className="flex items-center gap-2 bg-brand-darkTeal hover:bg-brand-teal text-brand-offWhite font-semibold px-4 py-2 rounded-lg text-sm">
              <Plus className="w-4 h-4" /> New Payrun
            </button>
          )}
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg bg-brand-warningBg text-brand-warningText px-3 py-2.5 text-sm">{error}</div>}

      <div className="mb-3"><SearchBar value={cl.search} onChange={cl.setSearch} placeholder="Search by status…" className="w-full sm:w-64" /></div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brand-teal" /></div>
      ) : (
        <Card>
          <Table head={['Period', 'Department', 'Status', 'Created By']}>
            {cl.items.map((p) => (
              <tr key={p._id} className="border-b border-brand-sandBorder/60 last:border-0 hover:bg-brand-hoverRow cursor-pointer" onClick={() => openDetail(p._id)}>
                <td className="td font-medium text-brand-darkCharcoal">{fmtDate(p.periodStart)} – {fmtDate(p.periodEnd)}</td>
                <td className="td">{nameOf(p.departmentId) === '—' ? 'All' : nameOf(p.departmentId)}</td>
                <td className="td"><Badge s={p.status} /></td>
                <td className="td text-brand-mutedSlate">{nameOf(p.createdBy)}</td>
              </tr>
            ))}
            {payruns.length === 0 && <EmptyRow cols={4} msg="No payruns yet. Create one to generate payslips." />}
            <tr><td colSpan={4} className="p-0"><Paginator page={cl.page} totalPages={cl.totalPages} totalItems={cl.totalItems} pageSize={cl.pageSize} onPage={cl.setPage} /></td></tr>
          </Table>
        </Card>
      )}

      {showNew && (
        <Drawer title="New Payrun" onClose={() => setShowNew(false)}
          footer={
            <>
              <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm text-brand-mutedSlate">Cancel</button>
              <button onClick={createPayrun} disabled={!form.periodStart || !form.periodEnd || busy === 'create'}
                className="flex items-center gap-2 bg-brand-darkTeal hover:bg-brand-teal text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
                {busy === 'create' && <Loader2 className="w-4 h-4 animate-spin" />} Create Payrun
              </button>
            </>
          }>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Period Start"><input type="date" className="inp" value={form.periodStart} onChange={(e) => setForm({ ...form, periodStart: e.target.value })} /></Field>
            <Field label="Period End"><input type="date" className="inp" value={form.periodEnd} onChange={(e) => setForm({ ...form, periodEnd: e.target.value })} /></Field>
          </div>
          <p className="text-xs text-brand-mutedSlate mt-3">The backend includes eligible employees (running contract in the period) automatically.</p>
        </Drawer>
      )}
    </div>
  );
};

const ActBtn: React.FC<any> = ({ icon: Icon, label, busy, disabled, onClick, primary }) => (
  <button onClick={onClick} disabled={disabled || busy}
    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed ${primary ? 'bg-brand-darkTeal hover:bg-brand-teal text-white' : 'border border-brand-sandBorder text-brand-darkCharcoal hover:bg-brand-hoverRow'}`}>
    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />} {label}
  </button>
);

const PayslipDrawer: React.FC<{ slip: any; onClose: () => void }> = ({ slip, onClose }) => {
  const lines = slip.lineItems || [];
  const earnings = lines.filter((l: any) => l.category === 'EARNING' || l.category === 'GROSS');
  const deductions = lines.filter((l: any) => l.category === 'DEDUCTION');
  const print = () => {
    const rows = lines.map((l: any) => `<tr><td>${l.ruleName}</td><td style="text-align:right;color:${l.category === 'DEDUCTION' ? '#b91c1c' : '#111'}">${inr(l.amount)}</td></tr>`).join('');
    const w = window.open('', '_blank'); if (!w) return;
    w.document.write(`<html><head><title>Payslip</title></head><body style="font-family:Arial;padding:32px;max-width:620px;margin:auto"><h2 style="color:#0B5D57">PeoplePay360 — Payslip</h2><p>${nameOf(slip.employeeId)} · ${fmtDate(slip.periodStart)}–${fmtDate(slip.periodEnd)}</p><table style="width:100%;border-collapse:collapse">${rows}<tr style="background:#DCEFEB;font-weight:700"><td style="padding:8px">Net Salary</td><td style="padding:8px;text-align:right">${inr(slip.netSalary)}</td></tr></table></body></html>`);
    w.document.close(); setTimeout(() => w.print(), 300);
  };
  return (
    <Drawer title={`Payslip — ${nameOf(slip.employeeId)}`} onClose={onClose}
      footer={<button onClick={print} className="flex items-center gap-2 bg-brand-darkTeal hover:bg-brand-teal text-white px-4 py-2 rounded-lg text-sm font-semibold ml-auto"><Printer className="w-4 h-4" /> Print / PDF</button>}>
      <p className="text-sm text-brand-mutedSlate mb-4">{fmtDate(slip.periodStart)} – {fmtDate(slip.periodEnd)} · Wage {inr(slip.wage)}</p>
      <Section title="Earnings" lines={earnings} />
      <Section title="Deductions" lines={deductions} />
      <div className="mt-5 rounded-xl bg-brand-activeBg p-4 space-y-1.5">
        <Row label="Gross" val={inr(slip.grossSalary)} />
        <Row label="Deductions" val={inr(-slip.totalDeductions)} danger />
        <div className="border-t border-brand-teal/20 pt-2"><Row label="Net Salary" val={inr(slip.netSalary)} big /></div>
      </div>
    </Drawer>
  );
};
const Section: React.FC<{ title: string; lines: any[] }> = ({ title, lines }) => lines.length ? (
  <div className="mb-4">
    <h4 className="text-sm font-semibold text-brand-mutedSlate mb-2">{title}</h4>
    <div className="bg-brand-offWhite rounded-lg border border-brand-sandBorder divide-y divide-brand-sandBorder/60">
      {lines.map((l: any, i: number) => (
        <div key={i} className="flex justify-between px-4 py-2.5 text-sm">
          <span>{l.ruleName} <span className="font-mono text-xs text-brand-mutedSlate ml-1">{l.ruleCode}</span></span>
          <span className={`font-medium ${l.category === 'DEDUCTION' ? 'text-brand-warningText' : 'text-brand-darkCharcoal'}`}>{inr(l.amount)}</span>
        </div>
      ))}
    </div>
  </div>
) : null;
const Row: React.FC<{ label: string; val: string; big?: boolean; danger?: boolean }> = ({ label, val, big, danger }) => (
  <div className="flex justify-between items-center">
    <span className={big ? 'font-bold text-brand-darkCharcoal' : 'text-sm text-brand-darkCharcoal'}>{label}</span>
    <span className={`${big ? 'text-xl font-bold text-brand-darkTeal' : 'font-medium'} ${danger ? 'text-brand-warningText' : ''}`}>{val}</span>
  </div>
);
