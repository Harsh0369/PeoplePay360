import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { masterApi } from '../services/hrApi';
import { Card, Table, EmptyRow, Field, Drawer } from './ConfigModule';
import { useAuth } from '../hooks/useAuth';
import { PERM } from '../lib/permissions';

type Tab = 'DEPARTMENTS' | 'SCHEDULES';
const nameOf = (v: any) => (v && typeof v === 'object' ? v.name : v) || '—';
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const OrgModule: React.FC = () => {
  const { can } = useAuth();
  const canWrite = can(...PERM.orgWrite);
  const [tab, setTab] = useState<Tab>('DEPARTMENTS');
  const [departments, setDepartments] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState<any>(null);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [d, s, e] = await Promise.all([masterApi.getDepartments(), masterApi.getWorkingSchedules(), masterApi.getEmployees()]);
      setDepartments(Array.isArray(d) ? d : []);
      setSchedules(Array.isArray(s) ? s : []);
      setEmployees(Array.isArray(e) ? e : []);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    setBusy('save'); setError('');
    try {
      if (form.kind === 'DEPT') {
        await masterApi.createDepartment({ name: form.name, ...(form.managerId ? { managerId: form.managerId } : {}), ...(form.parentDepartmentId ? { parentDepartmentId: form.parentDepartmentId } : {}) });
      } else {
        const workingDays = (form.workingDays || []).map((l: any) => ({
          dayOfWeek: l.dayOfWeek, startTime: l.startTime, endTime: l.endTime, breakDurationMinutes: Number(l.breakDurationMinutes) || 0,
        }));
        await masterApi.createWorkingSchedule({ name: form.name, workingDays });
      }
      setForm(null); load();
    } catch (e: any) { setError(e.message); }
    finally { setBusy(''); }
  };

  const set = (k: string) => (e: any) => setForm((f: any) => ({ ...f, [k]: e.target.value }));
  const defLines = () => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((d) => ({ dayOfWeek: d, startTime: '09:00', endTime: '18:00', breakDurationMinutes: 60 }));
  const openNew = () => setForm(tab === 'DEPARTMENTS' ? { kind: 'DEPT', name: '' } : { kind: 'SCHED', name: '', workingDays: defLines() });
  const setLine = (i: number, k: string, v: any) => setForm((f: any) => ({ ...f, workingDays: f.workingDays.map((l: any, idx: number) => idx === i ? { ...l, [k]: v } : l) }));
  const addLine = () => setForm((f: any) => ({ ...f, workingDays: [...f.workingDays, { dayOfWeek: 'Monday', startTime: '09:00', endTime: '18:00', breakDurationMinutes: 60 }] }));
  const rmLine = (i: number) => setForm((f: any) => ({ ...f, workingDays: f.workingDays.filter((_: any, idx: number) => idx !== i) }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-brand-darkCharcoal">Organization</h2>
          <p className="text-sm text-brand-mutedSlate">Departments and working schedules.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-lg border border-brand-sandBorder text-brand-mutedSlate hover:bg-brand-hoverRow"><RefreshCw className="w-4 h-4" /></button>
          {canWrite && <button onClick={openNew} className="flex items-center gap-2 bg-brand-darkTeal hover:bg-brand-teal text-brand-offWhite font-semibold px-4 py-2 rounded-lg text-sm"><Plus className="w-4 h-4" /> {tab === 'DEPARTMENTS' ? 'New Department' : 'New Schedule'}</button>}
        </div>
      </div>

      <div className="flex gap-1 border-b border-brand-sandBorder mb-4">
        {(['DEPARTMENTS', 'SCHEDULES'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px ${tab === t ? 'border-brand-teal text-brand-darkTeal' : 'border-transparent text-brand-mutedSlate hover:text-brand-darkCharcoal'}`}>
            {t === 'DEPARTMENTS' ? 'Departments' : 'Working Schedules'}
          </button>
        ))}
      </div>

      {error && <div className="mb-4 rounded-lg bg-brand-warningBg text-brand-warningText px-3 py-2.5 text-sm">{error}</div>}

      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brand-teal" /></div>
        : tab === 'DEPARTMENTS' ? (
          <Card><Table head={['Department', 'Parent', 'Manager']}>
            {departments.map((d) => (
              <tr key={d._id} className="border-b border-brand-sandBorder/60 last:border-0 hover:bg-brand-hoverRow">
                <td className="td font-medium text-brand-darkCharcoal">{d.name}</td>
                <td className="td">{nameOf(d.parentDepartmentId)}</td>
                <td className="td">{nameOf(d.managerId)}</td>
              </tr>
            ))}
            {departments.length === 0 && <EmptyRow cols={3} msg="No departments yet." />}
          </Table></Card>
        ) : (
          <Card><Table head={['Schedule', 'Working Days', 'Weekly Hours']}>
            {schedules.map((s) => (
              <tr key={s._id} className="border-b border-brand-sandBorder/60 last:border-0 hover:bg-brand-hoverRow">
                <td className="td font-medium text-brand-darkCharcoal">{s.name}</td>
                <td className="td">{(s.workingDays || []).length} days</td>
                <td className="td font-semibold">{s.totalWeeklyHours ?? 0} h</td>
              </tr>
            ))}
            {schedules.length === 0 && <EmptyRow cols={3} msg="No working schedules yet." />}
          </Table></Card>
        )}

      {form && (
        <Drawer title={form.kind === 'DEPT' ? 'New Department' : 'New Working Schedule'} onClose={() => setForm(null)}
          footer={<>
            <button onClick={() => setForm(null)} className="px-4 py-2 text-sm text-brand-mutedSlate">Cancel</button>
            <button onClick={submit} disabled={!form.name || busy === 'save'} className="flex items-center gap-2 bg-brand-darkTeal hover:bg-brand-teal text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">{busy === 'save' && <Loader2 className="w-4 h-4 animate-spin" />} Save</button>
          </>}>
          {form.kind === 'DEPT' ? (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Name"><input className="inp" value={form.name} onChange={set('name')} placeholder="Engineering" /></Field>
              <Field label="Parent Department"><select className="inp" value={form.parentDepartmentId || ''} onChange={set('parentDepartmentId')}><option value="">— None —</option>{departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}</select></Field>
              <Field label="Manager"><select className="inp" value={form.managerId || ''} onChange={set('managerId')}><option value="">— None —</option>{employees.map((e) => <option key={e.id || e._id} value={e.id || e._id}>{e.name}</option>)}</select></Field>
            </div>
          ) : (
            <div>
              <Field label="Name"><input className="inp" value={form.name} onChange={set('name')} placeholder="Standard 40h" /></Field>
              <div className="mt-4 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-brand-darkCharcoal">Weekly Pattern</h4>
                <button onClick={addLine} className="text-brand-darkTeal text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Add day</button>
              </div>
              <div className="mt-2 space-y-2">
                {form.workingDays.map((l: any, i: number) => (
                  <div key={i} className="grid grid-cols-[1.4fr_1fr_1fr_1fr_auto] gap-2 items-center">
                    <select className="inp" value={l.dayOfWeek} onChange={(e) => setLine(i, 'dayOfWeek', e.target.value)}>{DAYS.map((d) => <option key={d}>{d}</option>)}</select>
                    <input className="inp" type="time" value={l.startTime} onChange={(e) => setLine(i, 'startTime', e.target.value)} />
                    <input className="inp" type="time" value={l.endTime} onChange={(e) => setLine(i, 'endTime', e.target.value)} />
                    <input className="inp" type="number" value={l.breakDurationMinutes} onChange={(e) => setLine(i, 'breakDurationMinutes', e.target.value)} title="Break (min)" />
                    <button onClick={() => rmLine(i)} className="p-2 text-brand-warningText"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-brand-mutedSlate mt-3">Total weekly hours are computed by the backend from these shifts.</p>
            </div>
          )}
        </Drawer>
      )}
    </div>
  );
};
