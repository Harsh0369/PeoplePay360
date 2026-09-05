import { useEffect, useState } from 'react';
import FormDrawer from '../../components/ui/FormDrawer.jsx';
import { Field, TextInput, Select, FormGrid } from '../../components/ui/Field.jsx';
import { useSaveAttendance, useEmployees } from './api.js';

const EMPTY = { employee: '', checkIn: '', checkOut: '', status: 'present' };
const toLocal = (iso) => (iso ? new Date(iso).toISOString().slice(0, 16) : '');

export default function AttendanceForm({ open, record, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const save = useSaveAttendance();
  const { data: employees = [] } = useEmployees();

  useEffect(() => {
    setForm(record ? { ...EMPTY, ...record, checkIn: toLocal(record.checkIn), checkOut: toLocal(record.checkOut) } : EMPTY);
  }, [record, open]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    const checkIn = form.checkIn ? new Date(form.checkIn).toISOString() : null;
    const checkOut = form.checkOut ? new Date(form.checkOut).toISOString() : null;
    const workedHours = checkIn && checkOut ? Math.max(0, (new Date(checkOut) - new Date(checkIn)) / 3.6e6) : 0;
    await save.mutateAsync({ ...form, checkIn, checkOut, workedHours: Math.round(workedHours * 100) / 100, manualEdit: true });
    onClose();
  };

  return (
    <FormDrawer
      open={open}
      title={record?._id ? 'Correct Attendance' : 'New Attendance'}
      subtitle="Manual corrections are logged"
      onClose={onClose}
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={!form.employee || save.isPending}>
            {save.isPending ? 'Saving…' : 'Save'}
          </button>
        </>
      }
    >
      <FormGrid>
        <Field label="Employee" required>
          <Select value={form.employee} onChange={set('employee')}>
            <option value="">— Select —</option>
            {employees.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
          </Select>
        </Field>
        <Field label="Status">
          <Select value={form.status} onChange={set('status')}>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="absent">Absent</option>
            <option value="overtime">Overtime</option>
            <option value="half_day">Half Day</option>
          </Select>
        </Field>
        <Field label="Check In"><TextInput type="datetime-local" value={form.checkIn} onChange={set('checkIn')} /></Field>
        <Field label="Check Out"><TextInput type="datetime-local" value={form.checkOut} onChange={set('checkOut')} /></Field>
      </FormGrid>
    </FormDrawer>
  );
}
