import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCw, LogIn, LogOut, Clock } from 'lucide-react';
import { attendanceApi } from '../services/hrApi';
import { Card, Table, EmptyRow } from './ConfigModule';

const STATUS_BADGE: Record<string, string> = {
  Present: 'bg-brand-activeBg text-brand-activeText',
  Late: 'bg-brand-leaveBg text-brand-leaveText',
  'Half-Day': 'bg-brand-leaveBg text-brand-leaveText',
  Absent: 'bg-brand-warningBg text-brand-warningText',
};
const nameOf = (v: any) => (v && typeof v === 'object' ? v.name : v) || '—';
const fmtTime = (d?: string) => (d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');

export const AttendanceModule: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { const r = await attendanceApi.getAll(); setRows(Array.isArray(r) ? r : (r?.data ?? [])); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  // Kiosk: backend derives the employee from the JWT; location is required by the model.
  const punch = async (kind: 'in' | 'out') => {
    setBusy(kind); setError(''); setMsg('');
    const payload = { location: { lat: 19.076, lng: 72.8777, address: 'Office HQ' } };
    try {
      if (kind === 'in') await attendanceApi.clockIn(payload);
      else await attendanceApi.clockOut(payload);
      setMsg(`Clock ${kind === 'in' ? 'in' : 'out'} recorded.`);
      load();
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
        <button onClick={load} className="p-2 rounded-lg border border-brand-sandBorder text-brand-mutedSlate hover:bg-brand-hoverRow"><RefreshCw className="w-4 h-4" /></button>
      </div>

      {/* Kiosk */}
      <div className="bg-brand-offWhite rounded-xl border border-brand-sandBorder shadow-sm p-5 mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-activeBg text-brand-darkTeal grid place-items-center"><Clock className="w-5 h-5" /></div>
          <div>
            <h3 className="font-semibold text-brand-darkCharcoal">Attendance Kiosk</h3>
            <p className="text-sm text-brand-mutedSlate">Record your check-in or check-out for today.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => punch('in')} disabled={busy === 'in'} className="flex items-center gap-2 bg-brand-darkTeal hover:bg-brand-teal text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
            {busy === 'in' ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />} Clock In
          </button>
          <button onClick={() => punch('out')} disabled={busy === 'out'} className="flex items-center gap-2 border border-brand-sandBorder text-brand-darkCharcoal hover:bg-brand-hoverRow px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
            {busy === 'out' ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />} Clock Out
          </button>
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
                <td className="td">{(r.workedHours ?? 0).toFixed?.(2) ?? r.workedHours} h</td>
                <td className="td"><span className={`badge ${STATUS_BADGE[r.status] || 'bg-brand-draftBg text-brand-draftText'}`}>{r.status}</span></td>
              </tr>
            ))}
            {rows.length === 0 && <EmptyRow cols={5} msg="No attendance records yet. Use the kiosk to clock in." />}
          </Table>
        </Card>
      )}
    </div>
  );
};
