import { useEffect, useState } from 'react';
import { FileText, Clock, CalendarDays } from 'lucide-react';
import FormDrawer from '../../components/ui/FormDrawer.jsx';
import SmartButton from '../../components/ui/SmartButton.jsx';
import { Field, TextInput, Select, FormGrid } from '../../components/ui/Field.jsx';
import { useSaveEmployee, useSchedules, useContracts } from './api.js';

const EMPTY = {
  name: '', workEmail: '', mobile: '', department: '', jobPosition: '',
  employeeType: 'full_time', status: 'active', workingSchedule: '', bankAccount: '',
};

export default function EmployeeForm({ open, employee, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const save = useSaveEmployee();
  const { data: schedules = [] } = useSchedules();
  const { data: contracts = [] } = useContracts();

  useEffect(() => {
    setForm(employee ? { ...EMPTY, ...employee } : EMPTY);
  }, [employee, open]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const isEdit = !!employee?._id;
  const myContracts = contracts.filter((c) => c.employee === employee?._id);

  const submit = async () => {
    await save.mutateAsync(form);
    onClose();
  };

  return (
    <FormDrawer
      open={open}
      title={isEdit ? form.name || 'Employee' : 'New Employee'}
      subtitle={isEdit ? `${form.jobPosition || '—'} · ${form.department || '—'}` : 'Create an employee record'}
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
      {/* Smart buttons — related records, Odoo style */}
      {isEdit && (
        <div className="mb-6 flex flex-wrap gap-3">
          <SmartButton icon={FileText} count={myContracts.length} label="Contracts" />
          <SmartButton icon={Clock} count={0} label="Attendance" />
          <SmartButton icon={CalendarDays} count={0} label="Time Off" />
        </div>
      )}

      <FormGrid>
        <Field label="Full Name" required>
          <TextInput value={form.name} onChange={set('name')} placeholder="e.g. Aarav Mehta" />
        </Field>
        <Field label="Work Email">
          <TextInput type="email" value={form.workEmail} onChange={set('workEmail')} placeholder="name@company.com" />
        </Field>
        <Field label="Mobile">
          <TextInput value={form.mobile} onChange={set('mobile')} placeholder="+91 …" />
        </Field>
        <Field label="Department">
          <TextInput value={form.department} onChange={set('department')} placeholder="e.g. Engineering" />
        </Field>
        <Field label="Job Position">
          <TextInput value={form.jobPosition} onChange={set('jobPosition')} placeholder="e.g. Senior Engineer" />
        </Field>
        <Field label="Employee Type">
          <Select value={form.employeeType} onChange={set('employeeType')}>
            <option value="full_time">Full-time</option>
            <option value="part_time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="intern">Intern</option>
          </Select>
        </Field>
        <Field label="Working Schedule">
          <Select value={form.workingSchedule} onChange={set('workingSchedule')}>
            <option value="">— Select —</option>
            {schedules.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Status">
          <Select value={form.status} onChange={set('status')}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </Field>
        <Field label="Bank Account" hint="Missing bank details trigger a payroll warning.">
          <TextInput value={form.bankAccount} onChange={set('bankAccount')} placeholder="e.g. HDFC ****4521" />
        </Field>
      </FormGrid>
    </FormDrawer>
  );
}
