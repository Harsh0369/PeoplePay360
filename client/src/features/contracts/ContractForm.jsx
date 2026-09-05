import { useEffect, useState } from 'react';
import FormDrawer from '../../components/ui/FormDrawer.jsx';
import { Field, TextInput, Select, FormGrid } from '../../components/ui/Field.jsx';
import { useSaveContract, useEmployees, useSchedules, useStructures } from './api.js';

const EMPTY = {
  name: '', employee: '', startDate: '', endDate: '', wage: 0,
  department: '', jobPosition: '', workingSchedule: '', salaryStructure: '', state: 'draft',
};

export default function ContractForm({ open, contract, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const save = useSaveContract();
  const { data: employees = [] } = useEmployees();
  const { data: schedules = [] } = useSchedules();
  const { data: structures = [] } = useStructures();

  useEffect(() => {
    setForm(contract ? { ...EMPTY, ...contract, endDate: contract.endDate || '' } : EMPTY);
  }, [contract, open]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    await save.mutateAsync({ ...form, wage: Number(form.wage), endDate: form.endDate || null });
    onClose();
  };

  return (
    <FormDrawer
      open={open}
      title={contract?._id ? form.name || 'Contract' : 'New Contract'}
      subtitle="Employment terms for a period"
      onClose={onClose}
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={!form.employee || !form.wage || save.isPending}>
            {save.isPending ? 'Saving…' : 'Save'}
          </button>
        </>
      }
    >
      <FormGrid>
        <Field label="Reference" hint="e.g. CO/2026/0042">
          <TextInput value={form.name} onChange={set('name')} placeholder="CO/2026/…" />
        </Field>
        <Field label="Employee" required>
          <Select value={form.employee} onChange={set('employee')}>
            <option value="">— Select —</option>
            {employees.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
          </Select>
        </Field>
        <Field label="Start Date" required>
          <TextInput type="date" value={form.startDate?.slice(0, 10)} onChange={set('startDate')} />
        </Field>
        <Field label="End Date" hint="Leave empty for open-ended">
          <TextInput type="date" value={form.endDate?.slice(0, 10)} onChange={set('endDate')} />
        </Field>
        <Field label="Monthly Wage (₹)" required>
          <TextInput type="number" value={form.wage} onChange={set('wage')} placeholder="90000" />
        </Field>
        <Field label="Department">
          <TextInput value={form.department} onChange={set('department')} />
        </Field>
        <Field label="Job Position">
          <TextInput value={form.jobPosition} onChange={set('jobPosition')} />
        </Field>
        <Field label="Working Schedule">
          <Select value={form.workingSchedule} onChange={set('workingSchedule')}>
            <option value="">— Select —</option>
            {schedules.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </Select>
        </Field>
        <Field label="Salary Structure">
          <Select value={form.salaryStructure} onChange={set('salaryStructure')}>
            <option value="">— Select —</option>
            {structures.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </Select>
        </Field>
        <Field label="Status">
          <Select value={form.state} onChange={set('state')}>
            <option value="draft">Draft</option>
            <option value="running">Running</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </Field>
      </FormGrid>
    </FormDrawer>
  );
}
