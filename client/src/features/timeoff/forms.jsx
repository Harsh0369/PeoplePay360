import { useEffect, useState } from 'react';
import FormDrawer from '../../components/ui/FormDrawer.jsx';
import { Field, TextInput, Select, FormGrid } from '../../components/ui/Field.jsx';
import { useSaveRequest, useSaveAllocation, useSaveType, useEmployees, useTypes } from './api.js';

const daysBetween = (a, b) => Math.max(0, Math.floor((new Date(b) - new Date(a)) / 86400000) + 1);

// ---- Request form ----
export function RequestForm({ open, record, onClose }) {
  const EMPTY = { employee: '', timeOffType: '', dateFrom: '', dateTo: '', reason: '', state: 'draft' };
  const [form, setForm] = useState(EMPTY);
  const save = useSaveRequest();
  const { data: employees = [] } = useEmployees();
  const { data: types = [] } = useTypes();
  useEffect(() => { setForm(record ? { ...EMPTY, ...record } : EMPTY); }, [record, open]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    await save.mutateAsync({ ...form, duration: daysBetween(form.dateFrom, form.dateTo) });
    onClose();
  };
  const invalid = !form.employee || !form.timeOffType || !form.dateFrom || !form.dateTo || new Date(form.dateTo) < new Date(form.dateFrom);

  return (
    <FormDrawer open={open} title={record?._id ? 'Time Off Request' : 'New Request'}
      subtitle={form.dateFrom && form.dateTo ? `${daysBetween(form.dateFrom, form.dateTo)} day(s)` : 'Request leave'}
      onClose={onClose}
      footer={<>
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={submit} disabled={invalid || save.isPending}>{save.isPending ? 'Saving…' : 'Save'}</button>
      </>}>
      <FormGrid>
        <Field label="Employee" required>
          <Select value={form.employee} onChange={set('employee')}>
            <option value="">— Select —</option>{employees.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
          </Select>
        </Field>
        <Field label="Leave Type" required>
          <Select value={form.timeOffType} onChange={set('timeOffType')}>
            <option value="">— Select —</option>{types.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
          </Select>
        </Field>
        <Field label="From" required><TextInput type="date" value={form.dateFrom?.slice(0,10)} onChange={set('dateFrom')} /></Field>
        <Field label="To" required><TextInput type="date" value={form.dateTo?.slice(0,10)} onChange={set('dateTo')} /></Field>
        <Field label="Status">
          <Select value={form.state} onChange={set('state')}>
            <option value="draft">Draft</option><option value="to_approve">To Approve</option>
            <option value="approved">Approved</option><option value="refused">Refused</option>
          </Select>
        </Field>
      </FormGrid>
      <div className="mt-4"><Field label="Reason"><TextInput value={form.reason} onChange={set('reason')} /></Field></div>
    </FormDrawer>
  );
}

// ---- Allocation form ----
export function AllocationForm({ open, record, onClose }) {
  const EMPTY = { employee: '', timeOffType: '', allocated: 0, validFrom: '', validTo: '', state: 'draft' };
  const [form, setForm] = useState(EMPTY);
  const save = useSaveAllocation();
  const { data: employees = [] } = useEmployees();
  const { data: types = [] } = useTypes();
  useEffect(() => { setForm(record ? { ...EMPTY, ...record } : EMPTY); }, [record, open]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = async () => { await save.mutateAsync({ ...form, allocated: Number(form.allocated) }); onClose(); };

  return (
    <FormDrawer open={open} title={record?._id ? 'Allocation' : 'New Allocation'} subtitle="Grant leave balance"
      onClose={onClose}
      footer={<>
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={submit} disabled={!form.employee || !form.timeOffType || save.isPending}>{save.isPending ? 'Saving…' : 'Save'}</button>
      </>}>
      <FormGrid>
        <Field label="Employee" required>
          <Select value={form.employee} onChange={set('employee')}>
            <option value="">— Select —</option>{employees.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
          </Select>
        </Field>
        <Field label="Leave Type" required>
          <Select value={form.timeOffType} onChange={set('timeOffType')}>
            <option value="">— Select —</option>{types.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
          </Select>
        </Field>
        <Field label="Allocated (days)" required><TextInput type="number" value={form.allocated} onChange={set('allocated')} /></Field>
        <Field label="Status">
          <Select value={form.state} onChange={set('state')}>
            <option value="draft">Draft</option><option value="approved">Approved</option><option value="refused">Refused</option>
          </Select>
        </Field>
        <Field label="Valid From"><TextInput type="date" value={form.validFrom?.slice(0,10)} onChange={set('validFrom')} /></Field>
        <Field label="Valid To"><TextInput type="date" value={form.validTo?.slice(0,10)} onChange={set('validTo')} /></Field>
      </FormGrid>
    </FormDrawer>
  );
}

// ---- Type form ----
export function TypeForm({ open, record, onClose }) {
  const EMPTY = { name: '', code: '', unit: 'day', requiresAllocation: true, approvalRequired: true, paid: true, color: '#4f46e5', active: true };
  const [form, setForm] = useState(EMPTY);
  const save = useSaveType();
  useEffect(() => { setForm(record ? { ...EMPTY, ...record } : EMPTY); }, [record, open]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggle = (k) => () => setForm((f) => ({ ...f, [k]: !f[k] }));
  const submit = async () => { await save.mutateAsync({ ...form, code: form.code.toUpperCase() }); onClose(); };

  const Check = ({ k, label }) => (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={form[k]} onChange={toggle(k)} className="h-4 w-4 accent-[#4F46E5]" /> {label}
    </label>
  );

  return (
    <FormDrawer open={open} title={record?._id ? 'Time Off Type' : 'New Type'} subtitle="Leave policy" onClose={onClose}
      footer={<>
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={submit} disabled={!form.name || !form.code || save.isPending}>{save.isPending ? 'Saving…' : 'Save'}</button>
      </>}>
      <FormGrid>
        <Field label="Name" required><TextInput value={form.name} onChange={set('name')} placeholder="e.g. Paid Time Off" /></Field>
        <Field label="Code" required><TextInput value={form.code} onChange={set('code')} placeholder="PTO" /></Field>
        <Field label="Unit">
          <Select value={form.unit} onChange={set('unit')}><option value="day">Days</option><option value="hour">Hours</option></Select>
        </Field>
      </FormGrid>
      <div className="mt-5 space-y-3">
        <Check k="requiresAllocation" label="Requires allocation (balance)" />
        <Check k="approvalRequired" label="Requires approval" />
        <Check k="paid" label="Paid leave (unpaid → payroll deduction)" />
      </div>
    </FormDrawer>
  );
}
