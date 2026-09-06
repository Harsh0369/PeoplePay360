import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCw, Plus, Check, X, Download } from 'lucide-react';
import { timeOffApi, masterApi } from '../services/hrApi';
import { fmtDate } from '../lib/format';
import { Card, Table, EmptyRow, Field, Drawer } from './ConfigModule';
import { useAuth } from '../hooks/useAuth';
import { PERM } from '../lib/permissions';
import { useClientList } from '../hooks/usePagedList';
import { SearchBar } from './ui/SearchBar';
import { Paginator } from './ui/Paginator';
import { notify } from '../lib/toast';

type Tab = 'REQUESTS' | 'ALLOCATIONS' | 'TYPES';
const nameOf = (v: any) => (v && typeof v === 'object' ? v.name : v) || '—';
const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-brand-leaveBg text-brand-leaveText',
  APPROVED: 'bg-brand-activeBg text-brand-activeText',
  REJECTED: 'bg-brand-warningBg text-brand-warningText',
};

export const TimeOffModule: React.FC = () => {
  const { can } = useAuth();
  const canWrite = can(...PERM.timeOffWrite);
  const canApprove = can(...PERM.timeOffApprove);
  const [tab, setTab] = useState<Tab>('REQUESTS');
  const [requests, setRequests] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState<any>(null); // { kind, ...fields }
  const [override, setOverride] = useState<any | null>(null); // { _id, employeeName, current, newStatus, reason }

  const reqList = useClientList(requests, { searchFields: ['employeeId.name', 'timeOffTypeId.name', 'status'], pageSize: 15 });
  const allocList = useClientList(allocations, { searchFields: ['employeeId.name', 'timeOffTypeId.name'], pageSize: 15 });
  const typeList = useClientList(types, { searchFields: ['name', 'code'], pageSize: 15 });
  const cl = tab === 'REQUESTS' ? reqList : tab === 'ALLOCATIONS' ? allocList : typeList;

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
    setBusy(id + status);
    try { await timeOffApi.review(id, { status }); notify.success(`Request ${status.toLowerCase()}.`); load(); }
    catch (e: any) { notify.error(e.message); }
    finally { setBusy(''); }
  };

  const submitOverride = async () => {
    if (!override.reason.trim()) { notify.error('A reason is required for an admin override.'); return; }
    setBusy('override');
    try {
      await timeOffApi.adminOverride(override._id, { newStatus: override.newStatus, reason: override.reason.trim() });
      notify.success(`Request forcibly ${override.newStatus.toLowerCase()}.`);
      setOverride(null); load();
    } catch (e: any) { notify.error(e.message); }
    finally { setBusy(''); }
  };

  const submit = async () => {
    setBusy('save');
    try {
      if (form.kind === 'TYPE') {
        await timeOffApi.createType({ name: form.name, description: form.description || '', isPaid: !!form.isPaid, requiresAllocation: !!form.requiresAllocation });
      } else if (form.kind === 'ALLOCATION') {
        await timeOffApi.createAllocation({ employeeId: form.employeeId, timeOffTypeId: form.timeOffTypeId, validityYear: Number(form.validityYear), grantedDays: Number(form.grantedDays) });
      } else if (form.kind === 'REQUEST') {
        if (!form.timeOffTypeId || !form.startDate || !form.endDate) {
          notify.error('Select a leave type and both start and end dates.');
          return;
        }
        const start = new Date(form.startDate);
        const end = new Date(form.endDate);
        // Inclusive calendar-day count (the backend stores this and checks it against the balance).
        const requestedDays = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
        if (requestedDays < 1) {
          notify.error('End date must be on or after the start date.');
          return;
        }
        await timeOffApi.raiseRequest({ timeOffTypeId: form.timeOffTypeId, startDate: form.startDate, endDate: form.endDate, requestedDays });
      }
      notify.success(`${form.kind.charAt(0) + form.kind.slice(1).toLowerCase()} created.`);
      setForm(null); load();
    } catch (e: any) { notify.error(e.message); }
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
          <button onClick={load} className="p-2 rounded-lg border border-brand-sandBorder text-brand-mutedSlate hover:bg-brand-hoverRow" title="Refresh"><RefreshCw className="w-4 h-4" /></button>
          {tab === 'ALLOCATIONS' && (
            <button onClick={() => {
              setBusy('export');
              timeOffApi.exportAllocations().catch(e => notify.error(e.message)).finally(() => setBusy(''));
            }} disabled={busy === 'export'} className="flex items-center gap-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
              <Download className="w-4 h-4" /> Export Ledger
            </button>
          )}
          {(tab === 'REQUESTS' || canWrite) && <button onClick={openNew} className="flex items-center gap-2 bg-brand-darkTeal hover:bg-brand-teal text-brand-offWhite font-semibold px-4 py-2 rounded-lg text-sm"><Plus className="w-4 h-4" /> {newLabel}</button>}
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

      <div className="mb-3"><SearchBar value={cl.search} onChange={cl.setSearch} placeholder="Search…" className="w-64" /></div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brand-teal" /></div>
        : tab === 'REQUESTS' ? (
          <Card><Table head={['Employee', 'Type', 'Dates', 'Days', 'Status', '']}>
            {reqList.items.map((r) => (
              <tr key={r._id} className="border-b border-brand-sandBorder/60 last:border-0 hover:bg-brand-hoverRow">
                <td className="td font-medium text-brand-darkCharcoal">{nameOf(r.employeeId)}</td>
                <td className="td">{nameOf(r.timeOffTypeId)}</td>
                <td className="td">{fmtDate(r.startDate)} – {fmtDate(r.endDate)}</td>
                <td className="td">{r.requestedDays}</td>
                <td className="td"><span className={`badge ${STATUS_BADGE[r.status] || ''}`}>{r.status}</span></td>
                <td className="td">
                  {r.status === 'PENDING' && canApprove && (
                    <div className="flex gap-1.5">
                      <button onClick={() => review(r._id, 'APPROVED')} disabled={!!busy} className="p-1.5 rounded bg-brand-activeBg text-brand-activeText hover:opacity-80" title="Approve"><Check className="w-4 h-4" /></button>
                      <button onClick={() => review(r._id, 'REJECTED')} disabled={!!busy} className="p-1.5 rounded bg-brand-warningBg text-brand-warningText hover:opacity-80" title="Reject"><X className="w-4 h-4" /></button>
                    </div>
                  )}
                  {r.status !== 'PENDING' && canWrite && (
                    <button onClick={() => setOverride({ _id: r._id, employeeName: nameOf(r.employeeId), current: r.status, newStatus: r.status === 'APPROVED' ? 'REJECTED' : 'APPROVED', reason: '' })}
                      className="text-xs font-semibold text-brand-teal hover:underline" title="Force-change this decision">Override</button>
                  )}
                </td>
              </tr>
            ))}
            {requests.length === 0 && <EmptyRow cols={6} msg="No time-off requests yet." />}
            <tr><td colSpan={6} className="p-0"><Paginator page={reqList.page} totalPages={reqList.totalPages} totalItems={reqList.totalItems} pageSize={reqList.pageSize} onPage={reqList.setPage} /></td></tr>
          </Table></Card>
        ) : tab === 'ALLOCATIONS' ? (
          <Card><Table head={['Employee', 'Type', 'Year', 'Granted', 'Used', 'Remaining']}>
            {allocList.items.map((a) => (
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
            <tr><td colSpan={6} className="p-0"><Paginator page={allocList.page} totalPages={allocList.totalPages} totalItems={allocList.totalItems} pageSize={allocList.pageSize} onPage={allocList.setPage} /></td></tr>
          </Table></Card>
        ) : (
          <Card><Table head={['Name', 'Paid', 'Allocation Required', 'Status']}>
            {typeList.items.map((t) => (
              <tr key={t._id} className="border-b border-brand-sandBorder/60 last:border-0 hover:bg-brand-hoverRow">
                <td className="td font-medium text-brand-darkCharcoal">{t.name}</td>
                <td className="td">{t.isPaid ? <span className="badge bg-brand-activeBg text-brand-activeText">Paid</span> : <span className="badge bg-brand-warningBg text-brand-warningText">Unpaid</span>}</td>
                <td className="td">{t.requiresAllocation ? 'Yes' : 'No'}</td>
                <td className="td"><span className="badge bg-brand-activeBg text-brand-activeText">{t.isActive === false ? 'Inactive' : 'Active'}</span></td>
              </tr>
            ))}
            {types.length === 0 && <EmptyRow cols={4} msg="No leave types yet." />}
            <tr><td colSpan={4} className="p-0"><Paginator page={typeList.page} totalPages={typeList.totalPages} totalItems={typeList.totalItems} pageSize={typeList.pageSize} onPage={typeList.setPage} /></td></tr>
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

      {override && (
        <Drawer title="Admin Override" onClose={() => setOverride(null)}
          footer={<>
            <button onClick={() => setOverride(null)} className="px-4 py-2 text-sm text-brand-mutedSlate">Cancel</button>
            <button onClick={submitOverride} disabled={busy === 'override' || !override.reason.trim()} className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">{busy === 'override' && <Loader2 className="w-4 h-4 animate-spin" />} Force {override.newStatus === 'APPROVED' ? 'Approve' : 'Reject'}</button>
          </>}>
          <p className="text-sm text-brand-mutedSlate mb-4">Forcibly change <span className="font-semibold text-brand-darkCharcoal">{override.employeeName}</span>'s request (currently <span className="font-semibold">{override.current}</span>). Balances are adjusted and the action is audit-logged.</p>
          <Field label="New Status">
            <select className="inp" value={override.newStatus} onChange={(e) => setOverride((o: any) => ({ ...o, newStatus: e.target.value }))}>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </Field>
          <div className="mt-4">
            <Field label="Reason (required)">
              <textarea className="inp" rows={3} value={override.reason} onChange={(e) => setOverride((o: any) => ({ ...o, reason: e.target.value }))} placeholder="Why is this decision being overridden?" />
            </Field>
          </div>
        </Drawer>
      )}
    </div>
  );
};
