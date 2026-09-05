import { useMemo, useState } from 'react';
import { Mail, Phone } from 'lucide-react';
import PageToolbar from '../../components/ui/PageToolbar.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import EmployeeForm from './EmployeeForm.jsx';
import { useEmployees } from './api.js';

const TYPE_LABEL = { full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract', intern: 'Intern' };

function Avatar({ name }) {
  const initials = (name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-light text-xs font-semibold text-brand">
      {initials}
    </span>
  );
}

export default function EmployeesPage() {
  const { data: employees = [], isLoading } = useEmployees();
  const [view, setView] = useState('list');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return employees.filter(
      (e) =>
        e.name?.toLowerCase().includes(q) ||
        e.department?.toLowerCase().includes(q) ||
        e.jobPosition?.toLowerCase().includes(q)
    );
  }, [employees, search]);

  const openNew = () => { setSelected(null); setFormOpen(true); };
  const openRow = (row) => { setSelected(row); setFormOpen(true); };

  const columns = [
    {
      key: 'name',
      label: 'Employee',
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.name} />
          <div>
            <div className="font-medium text-ink">{r.name}</div>
            <div className="text-xs text-muted">{r.workEmail}</div>
          </div>
        </div>
      ),
    },
    { key: 'department', label: 'Department' },
    { key: 'jobPosition', label: 'Position' },
    { key: 'employeeType', label: 'Type', render: (r) => TYPE_LABEL[r.employeeType] || r.employeeType },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageToolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search employees…"
        view={view}
        onView={setView}
        onNew={openNew}
        newLabel="New Employee"
      />

      {view === 'list' ? (
        <DataTable
          columns={columns}
          rows={rows}
          loading={isLoading}
          onRowClick={openRow}
          empty="No employees match your search."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((e) => (
            <button
              key={e._id}
              onClick={() => openRow(e)}
              className="card p-4 text-left transition hover:-translate-y-0.5 hover:shadow-pop"
            >
              <div className="mb-3 flex items-center gap-3">
                <Avatar name={e.name} />
                <div className="min-w-0">
                  <div className="truncate font-medium text-ink">{e.name}</div>
                  <div className="truncate text-xs text-muted">{e.jobPosition}</div>
                </div>
              </div>
              <div className="mb-3 flex items-center justify-between">
                <span className="badge bg-brand-light text-brand">{e.department}</span>
                <StatusBadge status={e.status} />
              </div>
              <div className="space-y-1 text-xs text-muted">
                <div className="flex items-center gap-2 truncate"><Mail size={13} /> {e.workEmail}</div>
                <div className="flex items-center gap-2"><Phone size={13} /> {e.mobile}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      <EmployeeForm open={formOpen} employee={selected} onClose={() => setFormOpen(false)} />
    </div>
  );
}
