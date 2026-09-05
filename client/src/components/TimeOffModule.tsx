import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCw, Plus, Check, X } from 'lucide-react';
import { timeOffApi, masterApi } from '../services/hrApi';
import { fmtDate } from '../lib/format';
import { Card, Table, EmptyRow, Field, Drawer } from './ConfigModule';

type Tab = 'REQUESTS' | 'ALLOCATIONS' | 'TYPES';
const nameOf = (v: any) => (v && typeof v === 'object' ? v.name : v) || '—';
const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-brand-leaveBg text-brand-leaveText',
  APPROVED: 'bg-brand-activeBg text-brand-activeText',
  REJECTED: 'bg-brand-warningBg text-brand-warningText',
};

export const TimeOffModule: React.FC = () => {
  const [tab, setTab] = useState<Tab>('REQUESTS');
  const [requests, setRequests] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState<any>(null); // { kind, ...fields }

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [rq, al, ty, em] = await Promise.all([
        timeOffApi.getRequests(), timeOffApi.getAllocations(), timeOffApi.getTypes(), masterApi.getEmployees(),
      ]);
      setRequests(Array.isArray(rq) ? rq : []);
      setAllocations(Array.isArray(al) ? al : []);
      setTypes(Array.isArray(ty) ? ty : []);
      setEmployees(Array.isArray(em) ? em : []);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const review = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setBusy(id + status); setError('');
    try { await timeOffApi.review(id, { status }); load(); }
    catch (e: any) { setError(e.message); }
    finally { setBusy(''); }
  };

  const submit = async () => {
    setBusy('save'); setError('');
    try {
      if (form.kind === 'TYPE') {
        await timeOffApi.createType({ name: form.name, description: form.description || '', isPaid: !!form.isPaid, requiresAllocation: !!form.requiresAllocation });
      } else if (form.kind === 'ALLOCATION') {
        await timeOffApi.createAllocation({ employeeId: form.employeeId, timeOffTypeId: form.timeOffTypeId, validityYear: Number(form.validityYear), grantedDays: Number(form.grantedDays) });
      } else if (form.kind === 'REQUEST') {
        await timeOffApi.raiseRequest({ timeOffTypeId: form.timeOffTypeId, startDate: form.startDate, endDate: form.endDate });
      }
      setForm(null); load();
    } catch (e: any) { setError(e.message); }
    finally { setBusy(''); }
  };

  const set = (k: string) => (e: any) => setForm((f: any) => ({ ...f, [k]: e.target.value }));
  const TABS: Tab[] = ['REQUESTS', 'ALLOCATIONS', 'TYPES'];
  const newLabel = { REQUESTS: 'New Request', ALLOCATIONS: 'New Allocation', TYPES: 'New Type' }[tab];
  const openNew = () => setForm({ kind: tab.slice(0, -1), validityYear: new Date().getFullYear(), isPaid: true, requiresAllocation: true });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-brand-darkCharcoal">Time Off</h2>
          <p className="text-sm text-brand-mutedSlate">Leave requests, allocations (balances) and leave types.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-lg border border-brand-sandBorder text-brand-mutedSlate hover:bg-brand-hoverRow"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={openNew} className="flex items-center gap-2 bg-brand-darkTeal hover:bg-brand-teal text-brand-offWhite font-semibold px-4 py-2 rounded-lg text-sm"><Plus className="w-4 h-4" /> {newLabel}</button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-brand-sandBorder mb-4">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px ${tab === t ? 'border-brand-teal text-brand-darkTeal' : 'border-transparent text-brand-mutedSlate hover:text-brand-darkCharcoal'}`}>
            {t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {error && <div className="mb-4 rounded-lg bg-brand-warningBg text-brand-warningText px-3 py-2.5 text-sm">{error}</div>}

      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brand-teal" /></div>
        : tab === 'REQUESTS' ? (
          <Card><Table head={['Employee', 'Type', 'Dates', 'Days', 'Status', '']}>
            {requests.map((r) => (
              <tr key={r._id} className="border-b border-brand-sandBorder/60 last:border-0 hover:bg-brand-hoverRow">
                <td className="td font-medium text-brand-darkCharcoal">{nameOf(r.employeeId)}</td>
                <td className="td">{nameOf(r.timeOffTypeId)}</td>
                <td className="td">{fmtDate(r.startDate)} – {fmtDate(r.endDate)}</td>
                <td className="td">{r.requestedDays}</td>
                <td className="td"><span className={`badge ${STATUS_BADGE[r.status] || ''}`}>{r.status}</span></td>
                <td className="td">
                  {r.status === 'PENDING' && (
                    <div className="flex gap-1.5">
                      <button onClick={() => review(r._id, 'APPROVED')} disabled={!!busy} className="p-1.5 rounded bg-brand-activeBg text-brand-activeText hover:opacity-80" title="Approve"><Check className="w-4 h-4" /></button>
                      <button onClick={() => review(r._id, 'REJECTED')} disabled={!!busy} className="p-1.5 rounded bg-brand-warningBg text-brand-warningText hover:opacity-80" title="Reject"><X className="w-4 h-4" /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {requests.length === 0 && <EmptyRow cols={6} msg="No time-off requests yet." />}
          </Table></Card>
        ) : tab === 'ALLOCATIONS' ? (
          <Card><Table head={['Employee', 'Type', 'Year', 'Granted', 'Used', 'Remaining']}>
            {allocations.map((a) => (
              <tr key={a._id} className="border-b border-brand-sandBorder/60 last:border-0 hover:bg-brand-hoverRow">
                <td className="td font-medium text-brand-darkCharcoal">{nameOf(a.employeeId)}</td>
                <td className="td">{nameOf(a.timeOffTypeId)}</td>
                <td className="td">{a.validityYear}</td>
                <td className="td">{a.grantedDays} d</td>
                <td className="td">{a.usedDays} d</td>
                <td className="td font-semibold text-brand-darkTeal">{(a.grantedDays - a.usedDays)} d</td>
              </tr>
            ))}
            {allocations.length === 0 && <EmptyRow cols={6} msg="No allocations yet." />}
          </Table></Card>
        ) : (
          <Card><Table head={['Name', 'Paid', 'Allocation Required', 'Status']}>
            {types.map((t) => (
              <tr key={t._id} className="border-b border-brand-sandBorder/60 last:border-0 hover:bg-brand-hoverRow">
                <td className="td font-medium text-brand-darkCharcoal">{t.name}</td>
                <td className="td">{t.isPaid ? <span className="badge bg-brand-activeBg text-brand-activeText">Paid</span> : <span className="badge bg-brand-warningBg text-brand-warningText">Unpaid</span>}</td>
                <td className="td">{t.requiresAllocation ? 'Yes' : 'No'}</td>
                <td className="td"><span className="badge bg-brand-activeBg text-brand-activeText">{t.isActive === false ? 'Inactive' : 'Active'}</span></td>
              </tr>
            ))}
            {types.length === 0 && <EmptyRow cols={4} msg="No leave types yet." />}
          </Table></Card>
        )}

      {form && (
        <Drawer title={form.kind === 'TYPE' ? 'New Leave Type' : form.kind === 'ALLOCATION' ? 'New Allocation' : 'New Request'} onClose={() => setForm(null)}
          footer={<>
            <button onClick={() => setForm(null)} className="px-4 py-2 text-sm text-brand-mutedSlate">Cancel</button>
            <button onClick={submit} disabled={busy === 'save'} className="flex items-center gap-2 bg-brand-darkTeal hover:bg-brand-teal text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">{busy === 'save' && <Loader2 className="w-4 h-4 animate-spin" />} Save</button>
          </>}>
          {form.kind === 'TYPE' && (
            <div className="space-y-4">
              <Field label="Name"><input className="inp" value={form.name || ''} onChange={set('name')} placeholder="Sick Leave" /></Field>
              <Field label="Description"><input className="inp" value={form.description || ''} onChange={set('description')} /></Field>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.isPaid} onChange={(e) => setForm({ ...form, isPaid: e.target.checked })} /> Paid leave</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.requiresAllocation} onChange={(e) => setForm({ ...form, requiresAllocation: e.target.checked })} /> Requires allocation (balance)</label>
            </div>
          )}
          {form.kind === 'ALLOCATION' && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Employee"><select className="inp" value={form.employeeId || ''} onChange={set('employeeId')}><option value="">— Select —</option>{employees.map((e) => <option key={e.id || e._id} value={e.id || e._id}>{e.name}</option>)}</select></Field>
              <Field label="Leave Type"><select className="inp" value={form.timeOffTypeId || ''} onChange={set('timeOffTypeId')}><option value="">— Select —</option>{types.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}</select></Field>
              <Field label="Validity Year"><input type="number" className="inp" value={form.validityYear} onChange={set('validityYear')} /></Field>
              <Field label="Granted Days"><input type="number" className="inp" value={form.grantedDays || ''} onChange={set('grantedDays')} /></Field>
            </div>
          )}
          {form.kind === 'REQUEST' && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Leave Type"><select className="inp" value={form.timeOffTypeId || ''} onChange={set('timeOffTypeId')}><option value="">— Select —</option>{types.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}</select></Field>
              <div />
              <Field label="Start Date"><input type="date" className="inp" value={form.startDate || ''} onChange={set('startDate')} /></Field>
              <Field label="End Date"><input type="date" className="inp" value={form.endDate || ''} onChange={set('endDate')} /></Field>
            </div>
          )}
        </Drawer>
      )}
    </div>
  );
};
