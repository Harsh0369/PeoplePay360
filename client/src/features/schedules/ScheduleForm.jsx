import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import FormDrawer from '../../components/ui/FormDrawer.jsx';
import { Field, TextInput, Select, FormGrid } from '../../components/ui/Field.jsx';
import { useSaveSchedule } from './api.js';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABEL = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
const EMPTY = { name: '', calendarType: 'full_time', company: 'Urban Corp', lines: [], active: true };
const defaultLines = () =>
  ['mon', 'tue', 'wed', 'thu', 'fri'].map((day) => ({ day, startTime: 9, endTime: 18, breakHours: 1 }));

export default function ScheduleForm({ open, schedule, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const save = useSaveSchedule();

  useEffect(() => {
    setForm(schedule ? { ...EMPTY, ...schedule, lines: schedule.lines?.length ? schedule.lines : defaultLines() }
                      : { ...EMPTY, lines: defaultLines() });
  }, [schedule, open]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setLine = (i, k, v) =>
    setForm((f) => ({ ...f, lines: f.lines.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)) }));
  const addLine = () => setForm((f) => ({ ...f, lines: [...f.lines, { day: 'mon', startTime: 9, endTime: 18, breakHours: 1 }] }));
  const removeLine = (i) => setForm((f) => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }));

  // Weekly hours derived from the lines — never entered manually.
  const hoursPerWeek = useMemo(
    () => form.lines.reduce((s, l) => s + Math.max(0, Number(l.endTime) - Number(l.startTime) - Number(l.breakHours || 0)), 0),
    [form.lines]
  );
  const daysPerWeek = useMemo(() => new Set(form.lines.map((l) => l.day)).size, [form.lines]);

  const submit = async () => {
    await save.mutateAsync({ ...form, hoursPerWeek, daysPerWeek });
    onClose();
  };

  return (
    <FormDrawer
      open={open}
      title={schedule?._id ? form.name || 'Schedule' : 'New Working Schedule'}
      subtitle={`${hoursPerWeek} h/week · ${daysPerWeek} days`}
      onClose={onClose}
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={!form.name || save.isPending}>
            {save.isPending ? 'Saving…' : 'Save'}
          </button>
        </>
      }
    >
      <FormGrid>
        <Field label="Name" required>
          <TextInput value={form.name} onChange={set('name')} placeholder="e.g. Standard 40h" />
        </Field>
        <Field label="Type">
          <Select value={form.calendarType} onChange={set('calendarType')}>
            <option value="full_time">Full-time</option>
            <option value="part_time">Part-time</option>
            <option value="flexible">Flexible</option>
          </Select>
        </Field>
      </FormGrid>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Weekly Pattern</h3>
          <button className="btn-ghost text-brand" onClick={addLine}><Plus size={14} /> Add line</button>
        </div>
        <div className="card divide-y divide-line">
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 bg-slate-50/60 px-3 py-2 text-xs font-medium text-muted">
            <span>Day</span><span>Start</span><span>End</span><span>Break (h)</span><span />
          </div>
          {form.lines.map((l, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-center gap-2 px-3 py-2">
              <select className="input" value={l.day} onChange={(e) => setLine(i, 'day', e.target.value)}>
                {DAYS.map((d) => <option key={d} value={d}>{DAY_LABEL[d]}</option>)}
              </select>
              <input className="input" type="number" step="0.5" value={l.startTime} onChange={(e) => setLine(i, 'startTime', Number(e.target.value))} />
              <input className="input" type="number" step="0.5" value={l.endTime} onChange={(e) => setLine(i, 'endTime', Number(e.target.value))} />
              <input className="input" type="number" step="0.5" value={l.breakHours} onChange={(e) => setLine(i, 'breakHours', Number(e.target.value))} />
              <button className="btn-ghost p-2 text-danger" onClick={() => removeLine(i)}><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-end gap-2 text-sm">
          <span className="text-muted">Total weekly hours:</span>
          <span className="badge bg-brand-light text-brand">{hoursPerWeek} h</span>
        </div>
      </div>
    </FormDrawer>
  );
}
