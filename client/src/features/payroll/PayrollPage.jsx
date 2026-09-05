import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageToolbar from '../../components/ui/PageToolbar.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import PayrunWizard from './PayrunWizard.jsx';
import { usePayruns, useStructures } from './api.js';

const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

export default function PayrollPage() {
  const nav = useNavigate();
  const { data: payruns = [], isLoading } = usePayruns();
  const { data: structures = [] } = useStructures();
  const [search, setSearch] = useState('');
  const [wizard, setWizard] = useState(false);

  const structName = (id) => structures.find((s) => s._id === id)?.name || '—';
  const rows = useMemo(
    () => [...payruns]
      .filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.periodStart) - new Date(a.periodStart)),
    [payruns, search]
  );

  const columns = [
    { key: 'name', label: 'Payrun', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'structure', label: 'Structure', render: (r) => structName(r.salaryStructure) },
    { key: 'period', label: 'Period', render: (r) => `${fmt(r.periodStart)} – ${fmt(r.periodEnd)}` },
    { key: 'employees', label: 'Employees', render: (r) => r.employees?.length || 0 },
    { key: 'state', label: 'Status', render: (r) => <StatusBadge status={r.state} /> },
  ];

  return (
    <div>
      <PageToolbar
        search={search} onSearch={setSearch} searchPlaceholder="Search payruns…"
        onNew={() => setWizard(true)} newLabel="New Payrun"
      />
      <DataTable
        columns={columns} rows={rows} loading={isLoading}
        onRowClick={(r) => nav(`/payroll/${r._id}`)}
        empty="No payruns yet. Create one to generate payslips."
      />
      <PayrunWizard open={wizard} onClose={() => setWizard(false)} onCreated={(id) => { setWizard(false); nav(`/payroll/${id}`); }} />
    </div>
  );
}
