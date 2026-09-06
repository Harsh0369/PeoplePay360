import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCw, Plus, Trash2, Pencil, UserPlus, X } from 'lucide-react';
import { masterApi } from '../services/hrApi';
import { Card, Table, EmptyRow, Field, Drawer } from './ConfigModule';
import { useAuth } from '../hooks/useAuth';
import { PERM } from '../lib/permissions';
import { useClientList } from '../hooks/usePagedList';
import { SearchBar } from './ui/SearchBar';
import { Paginator } from './ui/Paginator';
import { notify } from '../lib/toast';

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

  const deptList = useClientList(departments, { searchFields: ['name'], pageSize: 15 });
  const schedList = useClientList(schedules, { searchFields: ['name'], pageSize: 15 });
  const cl = tab === 'DEPARTMENTS' ? deptList : schedList;
  const [error, setError] = useState('');
  const [form, setForm] = useState<any>(null);
  
  // Assignment Modal
  const [assigningDept, setAssigningDept] = useState<any>(null);
  const [assignMode, setAssignMode] = useState<'ASSIGN' | 'UNASSIGN'>('ASSIGN');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');

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
        if (form._id) {
          await masterApi.updateDepartment(form._id, { name: form.name, ...(form.managerId ? { managerId: form.managerId } : {}), ...(form.parentDepartmentId ? { parentDepartmentId: form.parentDepartmentId } : {}) });
          notify.success(`Department "${form.name}" updated.`);
        } else {
          await masterApi.createDepartment({ name: form.name, ...(form.managerId ? { managerId: form.managerId } : {}), ...(form.parentDepartmentId ? { parentDepartmentId: form.parentDepartmentId } : {}) });
          notify.success(`Department "${form.name}" created.`);
        }
      } else {
        const workingDays = (form.workingDays || []).map((l: any) => ({
          dayOfWeek: l.dayOfWeek, startTime: l.startTime, endTime: l.endTime, breakDurationMinutes: Number(l.breakDurationMinutes) || 0,
        }));
        if (form._id) {
          await masterApi.updateWorkingSchedule(form._id, { name: form.name, workingDays });
          notify.success(`Working schedule "${form.name}" updated.`);
        } else {
          await masterApi.createWorkingSchedule({ name: form.name, workingDays });
          notify.success(`Working schedule "${form.name}" created.`);
        }
      }
      setForm(null); load();
    } catch (e: any) { notify.error(e.message); }
    finally { setBusy(''); }
  };

  const handleConfirmAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningDept || !selectedEmployeeId) return;
    try {
      await masterApi.assignDepartment(selectedEmployeeId, assignMode === 'ASSIGN' ? assigningDept._id : '');
      notify.success(`Employee ${assignMode === 'ASSIGN' ? 'assigned to' : 'unassigned from'} department.`);
      setAssigningDept(null);
      setSelectedEmployeeId('');
      load();
    } catch (err: any) {
      notify.error(err.message || 'Failed to assign employee');
    }
  };

  const eligibleEmployees = assigningDept 
    ? employees.filter(emp => assignMode === 'ASSIGN' 
        ? !emp.department || emp.department === '—' || emp.department === '-' || emp.department.trim() === ''
        : emp.department === assigningDept.name)
    : [];

  const set = (k: string) => (e: any) => setForm((f: any) => ({ ...f, [k]: e.target.value }));
  const defLines = () => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((d) => ({ dayOfWeek: d, startTime: '09:00', endTime: '18:00', breakDurationMinutes: 60 }));
  const openNew = () => setForm(tab === 'DEPARTMENTS' ? { kind: 'DEPT', name: '' } : { kind: 'SCHED', name: '', workingDays: defLines() });
  const editSchedule = (s: any) => setForm({
    kind: 'SCHED', _id: s._id, name: s.name,
    workingDays: (s.workingDays || []).map((l: any) => ({
      dayOfWeek: l.dayOfWeek, startTime: l.startTime, endTime: l.endTime, breakDurationMinutes: l.breakDurationMinutes ?? 0,
    })),
  });
  const setLine = (i: number, k: string, v: any) => setForm((f: any) => ({ ...f, workingDays: f.workingDays.map((l: any, idx: number) => idx === i ? { ...l, [k]: v } : l) }));
  const addLine = () => setForm((f: any) => ({ ...f, workingDays: [...f.workingDays, { dayOfWeek: 'Monday', startTime: '09:00', endTime: '18:00', breakDurationMinutes: 60 }] }));
  const rmLine = (i: number) => setForm((f: any) => ({ ...f, workingDays: f.workingDays.filter((_: any, idx: number) => idx !== i) }));

  // parentDepartmentId / managerId arrive populated as objects; the <select> options
  // use string ids, so extract the id or they won't pre-select (and save would clobber them).
  const idOf = (v: any) => (v && typeof v === 'object' ? v._id : v) || '';
  const editDepartment = (d: any) => setForm({ kind: 'DEPT', _id: d._id, name: d.name, parentDepartmentId: idOf(d.parentDepartmentId), managerId: idOf(d.managerId) });
  const deleteDepartment = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try { await masterApi.deleteDepartment(id); notify.success('Department deleted.'); load(); }
    catch (e: any) { notify.error(e.message); }
  };
  const deleteSchedule = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try { await masterApi.deleteWorkingSchedule(id); notify.success('Schedule deleted.'); load(); }
    catch (e: any) { notify.error(e.message); }
  };

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

      <div className="mb-3"><SearchBar value={cl.search} onChange={cl.setSearch} placeholder={tab === 'DEPARTMENTS' ? 'Search departments…' : 'Search schedules…'} className="w-64" /></div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brand-teal" /></div>
        : tab === 'DEPARTMENTS' ? (
          <Card><Table head={['Department', 'Parent', 'Manager', ...(canWrite ? [''] : [])]}>
            {deptList.items.map((d) => (
              <tr key={d._id} className="border-b border-brand-sandBorder/60 last:border-0 hover:bg-brand-hoverRow">
                <td className="td font-medium text-brand-darkCharcoal">{d.name}</td>
                <td className="td">{nameOf(d.parentDepartmentId)}</td>
                <td className="td">{nameOf(d.managerId)}</td>
                {canWrite && <td className="td flex justify-end gap-1">
                  <button onClick={() => { setAssigningDept(d); setAssignMode('ASSIGN'); setSelectedEmployeeId(''); }} className="px-2 py-1 bg-brand-softSand text-brand-deepTeal text-xs font-bold rounded hover:bg-brand-teal hover:text-white flex items-center gap-1" title="Manage Staff"><UserPlus className="w-3.5 h-3.5" /> Staff</button>
                  <button onClick={() => editDepartment(d)} className="p-1.5 rounded-lg text-brand-mutedSlate hover:text-brand-darkTeal hover:bg-brand-activeBg"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => deleteDepartment(d._id)} className="p-1.5 rounded-lg text-brand-warningText hover:bg-brand-warningBg"><Trash2 className="w-4 h-4" /></button>
                </td>}
              </tr>
            ))}
            {departments.length === 0 && <EmptyRow cols={canWrite ? 4 : 3} msg="No departments yet." />}
            <tr><td colSpan={canWrite ? 4 : 3} className="p-0"><Paginator page={deptList.page} totalPages={deptList.totalPages} totalItems={deptList.totalItems} pageSize={deptList.pageSize} onPage={deptList.setPage} /></td></tr>
          </Table></Card>
        ) : (
          <Card><Table head={['Schedule', 'Working Days', 'Weekly Hours', ...(canWrite ? [''] : [])]}>
            {schedList.items.map((s) => (
              <tr key={s._id} className="border-b border-brand-sandBorder/60 last:border-0 hover:bg-brand-hoverRow">
                <td className="td font-medium text-brand-darkCharcoal">{s.name}</td>
                <td className="td">{(s.workingDays || []).length} days</td>
                <td className="td font-semibold">{s.totalWeeklyHours ?? 0} h</td>
                {canWrite && <td className="td flex justify-end gap-1"><button onClick={() => editSchedule(s)} className="p-1.5 rounded-lg text-brand-mutedSlate hover:text-brand-darkTeal hover:bg-brand-activeBg" title="Edit"><Pencil className="w-4 h-4" /></button><button onClick={() => deleteSchedule(s._id)} className="p-1.5 rounded-lg text-brand-warningText hover:bg-brand-warningBg"><Trash2 className="w-4 h-4" /></button></td>}
              </tr>
            ))}
            {schedules.length === 0 && <EmptyRow cols={canWrite ? 4 : 3} msg="No working schedules yet." />}
            <tr><td colSpan={canWrite ? 4 : 3} className="p-0"><Paginator page={schedList.page} totalPages={schedList.totalPages} totalItems={schedList.totalItems} pageSize={schedList.pageSize} onPage={schedList.setPage} /></td></tr>
          </Table></Card>
        )}

      {form && (
        <Drawer title={form.kind === 'DEPT' ? (form._id ? 'Edit Department' : 'New Department') : form._id ? 'Edit Working Schedule' : 'New Working Schedule'} onClose={() => setForm(null)}
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

      {/* Assign Dept Staff Modal */}
      {assigningDept && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-offWhite w-full max-w-md rounded-2xl shadow-2xl border border-brand-teal/20 overflow-hidden animate-fadeIn">
            <div className="bg-brand-deepTeal text-brand-offWhite px-5 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-brand-teal" />
                <h3 className="font-bold text-sm">Manage Staff for {assigningDept.name}</h3>
              </div>
              <button onClick={() => setAssigningDept(null)} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b border-brand-teal/20">
              <button
                onClick={() => { setAssignMode('ASSIGN'); setSelectedEmployeeId(''); }}
                className={`flex-1 py-3 text-xs font-bold transition-colors ${assignMode === 'ASSIGN' ? 'text-brand-deepTeal border-b-2 border-brand-deepTeal bg-brand-teal/5' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                Assign Staff
              </button>
              <button
                onClick={() => { setAssignMode('UNASSIGN'); setSelectedEmployeeId(''); }}
                className={`flex-1 py-3 text-xs font-bold transition-colors ${assignMode === 'UNASSIGN' ? 'text-brand-deepTeal border-b-2 border-brand-deepTeal bg-brand-teal/5' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                Unassign Staff
              </button>
            </div>

            <form onSubmit={handleConfirmAssignment} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">
                  Select Employee to {assignMode === 'ASSIGN' ? 'Assign' : 'Unassign'}
                </label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full p-2.5 bg-white text-xs border border-brand-teal/30 rounded-xl focus:ring-2 focus:ring-brand-teal outline-none font-medium"
                >
                  <option value="" disabled>-- Select an employee --</option>
                  {eligibleEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.empCode})
                    </option>
                  ))}
                </select>
                {eligibleEmployees.length === 0 && (
                  <p className="text-xs text-amber-600 mt-2">
                    No employees available to {assignMode.toLowerCase()}.
                  </p>
                )}
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setAssigningDept(null)}
                  className="px-3 py-1.5 text-xs font-bold bg-brand-softSand rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedEmployeeId}
                  className={`px-4 py-1.5 text-xs font-bold text-white rounded-xl shadow transition-colors ${!selectedEmployeeId ? 'bg-gray-400 cursor-not-allowed' : assignMode === 'ASSIGN' ? 'bg-brand-teal hover:bg-brand-darkTeal' : 'bg-red-500 hover:bg-red-600'}`}
                >
                  {assignMode === 'ASSIGN' ? 'Confirm Assignment' : 'Confirm Unassignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
