import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, RefreshCw, LogIn, LogOut, Clock, CheckCircle2, Pencil } from 'lucide-react';
import { attendanceApi } from '../services/hrApi';
import { Card, Table, EmptyRow, Drawer, Field } from './ConfigModule';
import { Paginator } from './ui/Paginator';
import { useAuth } from '../hooks/useAuth';
import { PERM } from '../lib/permissions';
import { notify } from '../lib/toast';

const STATUS_BADGE: Record<string, string> = {
  Present: 'bg-brand-activeBg text-brand-activeText',
  Late: 'bg-brand-leaveBg text-brand-leaveText',
  'Half-Day': 'bg-brand-leaveBg text-brand-leaveText',
  Absent: 'bg-brand-warningBg text-brand-warningText',
};
const nameOf = (v: any) => (v && typeof v === 'object' ? v.name : v) || '—';
const fmtTime = (d?: string) => (d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');
// datetime-local wants "yyyy-MM-ddThh:mm" in LOCAL time.
const toLocalInput = (d?: string) => {
  if (!d) return '';
  const dt = new Date(d);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};
const STATUSES = ['Present', 'Late', 'Half-Day', 'Absent'];
const PAGE_SIZE = 15;

export const AttendanceModule: React.FC = () => {
  const { user, can } = useAuth();
  const employeeId = (user as any)?.employeeId as string | undefined;
  const canWrite = can(...PERM.attendanceWrite);
  const [edit, setEdit] = useState<any | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [rows, setRows] = useState<any[]>([]);
  const [pageInfo, setPageInfo] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');

  // The signed-in user's most recent session (open or closed).
  const [latest, setLatest] = useState<any | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const isOpen = !!latest && latest.sessionState === 'OPEN' && !latest.checkOut?.time;

  const loadPage = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const res: any = await attendanceApi.getAll(`?page=${page}&limit=${PAGE_SIZE}`);
      const data = Array.isArray(res) ? res : res?.data ?? [];
      setRows(data);
      setPageInfo({ page, totalPages: Math.max(1, Math.ceil((data.length < PAGE_SIZE && page === 1 ? data.length : page * PAGE_SIZE + (data.length === PAGE_SIZE ? PAGE_SIZE : 0)) / PAGE_SIZE)), totalItems: 0 });
    } catch (e: any) { notify.error(e.message); }
    finally { setLoading(false); }
  }, []);

  const refreshSession = useCallback(async () => {
    if (!employeeId) { setSessionLoading(false); return; }
    setSessionLoading(true);
    try { setLatest(await attendanceApi.myLatest(employeeId)); }
    catch { setLatest(null); }
    finally { setSessionLoading(false); }
  }, [employeeId]);

  useEffect(() => { loadPage(1); refreshSession(); }, [loadPage, refreshSession]);

  const punch = async (kind: 'in' | 'out') => {
    setBusy(kind);
    const payload = { location: { lat: 19.076, lng: 72.8777, address: 'Office HQ' } };
    try {
      if (kind === 'in') await attendanceApi.clockIn(payload);
      else await attendanceApi.clockOut(payload);
      notify.success(kind === 'in' ? 'Clocked in successfully.' : 'Clocked out successfully.');
      await Promise.all([loadPage(1), refreshSession()]);
    } catch (e: any) { notify.error(e.message); }
    finally { setBusy(''); }
  };

  const openEdit = (r: any) => setEdit({
    _id: r._id,
    employeeName: nameOf(r.employeeId),
    checkInTime: toLocalInput(r.checkIn?.time),
    checkOutTime: toLocalInput(r.checkOut?.time),
    status: r.status || 'Present',
  });

  const saveEdit = async () => {
    setSavingEdit(true);
    try {
      const payload: any = { status: edit.status };
      if (edit.checkInTime) payload.checkInTime = new Date(edit.checkInTime).toISOString();
      if (edit.checkOutTime) payload.checkOutTime = new Date(edit.checkOutTime).toISOString();
      await attendanceApi.adminUpdate(edit._id, payload);
      notify.success('Attendance record corrected.');
      setEdit(null);
      loadPage(pageInfo.page);
    } catch (e: any) { notify.error(e.message); }
    finally { setSavingEdit(false); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-brand-darkCharcoal">Attendance</h2>
          <p className="text-sm text-brand-mutedSlate">Daily check-in / check-out, worked hours and status.</p>
        </div>
        <button onClick={() => { loadPage(pageInfo.page); refreshSession(); }} className="p-2 rounded-lg border border-brand-sandBorder text-brand-mutedSlate hover:bg-brand-hoverRow"><RefreshCw className="w-4 h-4" /></button>
      </div>

      {/* Kiosk — shows ONLY the action valid for the current session state */}
      <div className="bg-brand-offWhite rounded-xl border border-brand-sandBorder shadow-sm p-5 mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-activeBg text-brand-darkTeal grid place-items-center"><Clock className="w-5 h-5" /></div>
          <div>
            <h3 className="font-semibold text-brand-darkCharcoal">Attendance Kiosk</h3>
            {sessionLoading ? (
              <p className="text-sm text-brand-mutedSlate">Checking your status…</p>
            ) : isOpen ? (
              <p className="text-sm text-emerald-700 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Clocked in at {fmtTime(latest.checkIn?.time)} — you have an open session.</p>
            ) : latest ? (
              <p className="text-sm text-brand-mutedSlate flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-slate-400" /> Last clocked out at {fmtTime(latest.checkOut?.time)}. Start a new session below.</p>
            ) : (
              <p className="text-sm text-brand-mutedSlate">No sessions yet. Clock in to start.</p>
            )}
          </div>
        </div>

        <div>
          {sessionLoading ? (
            <div className="px-4 py-2"><Loader2 className="w-4 h-4 animate-spin text-brand-teal" /></div>
          ) : isOpen ? (
            <button onClick={() => punch('out')} disabled={busy === 'out'} className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50">
              {busy === 'out' ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />} Clock Out
            </button>
          ) : (
            <button onClick={() => punch('in')} disabled={busy === 'in'} className="flex items-center gap-2 bg-brand-darkTeal hover:bg-brand-teal text-white px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50">
              {busy === 'in' ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />} Clock In
            </button>
          )}
        </div>
      </div>


      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brand-teal" /></div>
      ) : (
        <Card>
          <Table head={['Employee', 'Check In', 'Check Out', 'Worked Hours', 'Status', ...(canWrite ? [''] : [])]}>
            {rows.map((r) => (
              <tr key={r._id} className="border-b border-brand-sandBorder/60 last:border-0 hover:bg-brand-hoverRow">
                <td className="td font-medium text-brand-darkCharcoal">{nameOf(r.employeeId)}{r.isEditedByAdmin && <span className="ml-2 badge bg-brand-leaveBg text-brand-leaveText">edited</span>}</td>
                <td className="td">{fmtTime(r.checkIn?.time)}</td>
                <td className="td">{r.checkOut?.time ? fmtTime(r.checkOut.time) : <span className="text-brand-leaveText">open</span>}</td>
                <td className="td">{Number(r.workedHours ?? 0).toFixed(2)} h</td>
                <td className="td"><span className={`badge ${STATUS_BADGE[r.status] || 'bg-brand-draftBg text-brand-draftText'}`}>{r.status}</span></td>
                {canWrite && <td className="td"><button onClick={() => openEdit(r)} className="p-1.5 rounded-lg text-brand-mutedSlate hover:text-brand-darkTeal hover:bg-brand-activeBg" title="Correct record"><Pencil className="w-4 h-4" /></button></td>}
              </tr>
            ))}
            {rows.length === 0 && <EmptyRow cols={canWrite ? 6 : 5} msg="No attendance records yet. Use the kiosk to clock in." />}
          </Table>
          <Paginator
            page={pageInfo.page}
            totalPages={rows.length === PAGE_SIZE ? pageInfo.page + 1 : pageInfo.page}
            onPage={loadPage}
          />
        </Card>
      )}

      {edit && (
        <Drawer title="Correct Attendance" onClose={() => setEdit(null)}
          footer={<>
            <button onClick={() => setEdit(null)} className="px-4 py-2 text-sm text-brand-mutedSlate">Cancel</button>
            <button onClick={saveEdit} disabled={savingEdit} className="flex items-center gap-2 bg-brand-darkTeal hover:bg-brand-teal text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">{savingEdit && <Loader2 className="w-4 h-4 animate-spin" />} Save Correction</button>
          </>}>
          <p className="text-sm text-brand-mutedSlate mb-4">Editing record for <span className="font-semibold text-brand-darkCharcoal">{edit.employeeName}</span>. This is audit-logged as an admin override.</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Check In"><input type="datetime-local" className="inp" value={edit.checkInTime} onChange={(e) => setEdit((f: any) => ({ ...f, checkInTime: e.target.value }))} /></Field>
            <Field label="Check Out"><input type="datetime-local" className="inp" value={edit.checkOutTime} onChange={(e) => setEdit((f: any) => ({ ...f, checkOutTime: e.target.value }))} /></Field>
            <Field label="Status">
              <select className="inp" value={edit.status} onChange={(e) => setEdit((f: any) => ({ ...f, status: e.target.value }))}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
        </Drawer>
      )}
    </div>
  );
};
