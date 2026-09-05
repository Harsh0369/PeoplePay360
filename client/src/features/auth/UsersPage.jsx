import { useEffect, useMemo, useState } from 'react';
import PageToolbar from '../../components/ui/PageToolbar.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import FormDrawer from '../../components/ui/FormDrawer.jsx';
import { Field, TextInput, Select, FormGrid } from '../../components/ui/Field.jsx';
import { makeResource } from '../../lib/resource.js';
import { ROLE_LABEL } from '../../lib/auth.jsx';

const { useList: useUsers, useSave: useSaveUser } = makeResource('users');
const { useList: useEmployees } = makeResource('employees');
const ROLES = ['employee', 'hr_manager', 'hr_payroll_user', 'hr_payroll_manager', 'admin'];

function UserForm({ open, record, onClose }) {
  const EMPTY = { name: '', email: '', role: 'employee', employee: '', active: true };
  const [form, setForm] = useState(EMPTY);
  const save = useSaveUser();
  const { data: employees = [] } = useEmployees();
  useEffect(() => { setForm(record ? { ...EMPTY, ...record } : EMPTY); }, [record, open]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = async () => { await save.mutateAsync(form); onClose(); };

  return (
    <FormDrawer open={open} title={record?._id ? form.name || 'User' : 'New User'} subtitle="Assign a role to control access" onClose={onClose}
      footer={<>
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={submit} disabled={!form.name || !form.email || save.isPending}>{save.isPending ? 'Saving…' : 'Save'}</button>
      </>}>
      <FormGrid>
        <Field label="Name" required><TextInput value={form.name} onChange={set('name')} /></Field>
        <Field label="Email" required><TextInput type="email" value={form.email} onChange={set('email')} /></Field>
        <Field label="Role" required>
          <Select value={form.role} onChange={set('role')}>
            {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
          </Select>
        </Field>
        <Field label="Linked Employee">
          <Select value={form.employee} onChange={set('employee')}>
            <option value="">— None —</option>
            {employees.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
          </Select>
        </Field>
      </FormGrid>
    </FormDrawer>
  );
}

export default function UsersPage() {
  const { data: users = [], isLoading } = useUsers();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  const rows = useMemo(
    () => users.filter((u) => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())),
    [users, search]
  );

  const columns = [
    { key: 'name', label: 'Name', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'email', label: 'Email', render: (r) => <span className="text-muted">{r.email}</span> },
    { key: 'role', label: 'Role', render: (r) => <span className="badge bg-brand-light text-brand">{ROLE_LABEL[r.role]}</span> },
    { key: 'active', label: 'Status', render: (r) => <StatusBadge status={r.active ? 'active' : 'inactive'} /> },
  ];

  return (
    <div>
      <PageToolbar search={search} onSearch={setSearch} searchPlaceholder="Search users…"
        onNew={() => { setSelected(null); setOpen(true); }} newLabel="New User" />
      <DataTable columns={columns} rows={rows} loading={isLoading} onRowClick={(r) => { setSelected(r); setOpen(true); }} empty="No users yet." />
      <UserForm open={open} record={selected} onClose={() => setOpen(false)} />
    </div>
  );
}
