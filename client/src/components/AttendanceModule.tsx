import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, RefreshCw, LogIn, LogOut, Clock, CheckCircle2 } from 'lucide-react';
import { attendanceApi } from '../services/hrApi';
import { Card, Table, EmptyRow } from './ConfigModule';
import { Paginator } from './ui/Paginator';
import { useAuth } from '../hooks/useAuth';

const STATUS_BADGE: Record<string, string> = {
  Present: 'bg-brand-activeBg text-brand-activeText',
  Late: 'bg-brand-leaveBg text-brand-leaveText',
  'Half-Day': 'bg-brand-leaveBg text-brand-leaveText',
  Absent: 'bg-brand-warningBg text-brand-warningText',
};
const nameOf = (v: any) => (v && typeof v === 'object' ? v.name : v) || '—';
const fmtTime = (d?: string) => (d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');
const PAGE_SIZE = 15;

export const AttendanceModule: React.FC = () => {
  const { user } = useAuth();
  const employeeId = (user as any)?.employeeId as string | undefined;

  const [rows, setRows] = useState<any[]>([]);
  const [pageInfo, setPageInfo] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  // The signed-in user's currently open session (null = they are clocked out).
  const [openSession, setOpenSession] = useState<any | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  const loadPage = useCallback(async (page: number) => {
    setLoading(true); setError('');
    try {
      const res: any = await attendanceApi.getAll(`?page=${page}&limit=${PAGE_SIZE}`);
      const data = Array.isArray(res) ? res : res?.data ?? [];
      setRows(data);
      setPageInfo({ page, totalPages: Math.max(1, Math.ceil((data.length < PAGE_SIZE && page === 1 ? data.length : page * PAGE_SIZE + (data.length === PAGE_SIZE ? PAGE_SIZE : 0)) / PAGE_SIZE)), totalItems: 0 });
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  const refreshSession = useCallback(async () => {
    if (!employeeId) { setSessionLoading(false); return; }
    setSessionLoading(true);
    try { setOpenSession(await attendanceApi.myOpenSession(employeeId)); }
    catch { setOpenSession(null); }
    finally { setSessionLoading(false); }
  }, [employeeId]);

  useEffect(() => { loadPage(1); refreshSession(); }, [loadPage, refreshSession]);

  const punch = async (kind: 'in' | 'out') => {
    setBusy(kind); setError(''); setMsg('');
    const payload = { location: { lat: 19.076, lng: 72.8777, address: 'Office HQ' } };
    try {
      if (kind === 'in') await attendanceApi.clockIn(payload);
      else await attendanceApi.clockOut(payload);
      setMsg(`Clock ${kind === 'in' ? 'in' : 'out'} recorded.`);
      await Promise.all([loadPage(1), refreshSession()]);
    } catch (e: any) { setError(e.message); }
    finally { setBusy(''); }
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
            ) : openSession ? (
              <p className="text-sm text-emerald-700 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Clocked in at {fmtTime(openSession.checkIn?.time)} — you have an open session.</p>
            ) : (
              <p className="text-sm text-brand-mutedSlate">You are clocked out. Start a new session below.</p>
            )}
          </div>
        </div>

        <div>
          {sessionLoading ? (
            <div className="px-4 py-2"><Loader2 className="w-4 h-4 animate-spin text-brand-teal" /></div>
          ) : openSession ? (
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

      {msg && <div className="mb-4 rounded-lg bg-brand-activeBg text-brand-activeText px-3 py-2.5 text-sm">{msg}</div>}
      {error && <div className="mb-4 rounded-lg bg-brand-warningBg text-brand-warningText px-3 py-2.5 text-sm">{error}</div>}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brand-teal" /></div>
      ) : (
        <Card>
          <Table head={['Employee', 'Check In', 'Check Out', 'Worked Hours', 'Status']}>
            {rows.map((r) => (
              <tr key={r._id} className="border-b border-brand-sandBorder/60 last:border-0 hover:bg-brand-hoverRow">
                <td className="td font-medium text-brand-darkCharcoal">{nameOf(r.employeeId)}</td>
                <td className="td">{fmtTime(r.checkIn?.time)}</td>
                <td className="td">{r.checkOut?.time ? fmtTime(r.checkOut.time) : <span className="text-brand-leaveText">open</span>}</td>
                <td className="td">{Number(r.workedHours ?? 0).toFixed(2)} h</td>
                <td className="td"><span className={`badge ${STATUS_BADGE[r.status] || 'bg-brand-draftBg text-brand-draftText'}`}>{r.status}</span></td>
              </tr>
            ))}
            {rows.length === 0 && <EmptyRow cols={5} msg="No attendance records yet. Use the kiosk to clock in." />}
          </Table>
          <Paginator
            page={pageInfo.page}
            totalPages={rows.length === PAGE_SIZE ? pageInfo.page + 1 : pageInfo.page}
            onPage={loadPage}
          />
        </Card>
      )}
    </div>
  );
};
