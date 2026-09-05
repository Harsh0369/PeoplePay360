import { useMemo, useState } from 'react';
import PageToolbar from '../../components/ui/PageToolbar.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import ContractForm from './ContractForm.jsx';
import { useContracts, useEmployees } from './api.js';
import { inr } from '../../lib/format.js';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

export default function ContractsPage() {
  const { data: contracts = [], isLoading } = useContracts();
  const { data: employees = [] } = useEmployees();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  const empName = (id) => employees.find((e) => e._id === id)?.name || '—';

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return contracts
      .map((c) => ({ ...c, _emp: empName(c.employee) }))
      .filter((c) => c._emp.toLowerCase().includes(q) || c.name?.toLowerCase().includes(q));
  }, [contracts, employees, search]);

  const columns = [
    { key: 'name', label: 'Reference', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'emp', label: 'Employee', render: (r) => r._emp },
    { key: 'startDate', label: 'Start', render: (r) => fmtDate(r.startDate) },
    { key: 'endDate', label: 'End', render: (r) => fmtDate(r.endDate) },
    { key: 'wage', label: 'Wage', className: 'text-right', render: (r) => <span className="font-medium">{inr(r.wage)}</span> },
    {
      key: 'state',
      label: 'Status',
      render: (r) => (
        <span className="flex items-center gap-2">
          <StatusBadge status={r.state} />
          {r.state === 'running' && <span className="text-[11px] font-medium text-emerald-600">● active</span>}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageToolbar
        search={search} onSearch={setSearch} searchPlaceholder="Search contracts…"
        onNew={() => { setSelected(null); setOpen(true); }} newLabel="New Contract"
      />
      <DataTable
        columns={columns} rows={rows} loading={isLoading}
        onRowClick={(r) => { setSelected(r); setOpen(true); }}
        empty="No contracts yet."
      />
      <ContractForm open={open} contract={selected} onClose={() => setOpen(false)} />
    </div>
  );
}
