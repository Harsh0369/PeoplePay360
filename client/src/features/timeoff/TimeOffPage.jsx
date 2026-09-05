import { useMemo, useState } from 'react';
import Tabs from '../../components/ui/Tabs.jsx';
import PageToolbar from '../../components/ui/PageToolbar.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { RequestForm, AllocationForm, TypeForm } from './forms.jsx';
import { useRequests, useAllocations, useTypes, useEmployees } from './api.js';

const TABS = [
  { key: 'requests', label: 'Requests' },
  { key: 'allocations', label: 'Allocations' },
  { key: 'types', label: 'Types' },
];
const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—');

export default function TimeOffPage() {
  const [tab, setTab] = useState('requests');
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  const { data: requests = [], isLoading: lReq } = useRequests();
  const { data: allocations = [], isLoading: lAll } = useAllocations();
  const { data: types = [], isLoading: lTyp } = useTypes();
  const { data: employees = [] } = useEmployees();

  const empName = (id) => employees.find((e) => e._id === id)?.name || '—';
  const typeName = (id) => types.find((t) => t._id === id)?.name || '—';

  // Balance consumed = approved requests of the same employee + type.
  const takenFor = (empId, typeId) =>
    requests
      .filter((r) => r.employee === empId && r.timeOffType === typeId && r.state === 'approved')
      .reduce((s, r) => s + (r.duration || 0), 0);

  const openNew = () => { setSelected(null); setOpen(true); };
  const openRow = (r) => { setSelected(r); setOpen(true); };

  const reqRows = useMemo(() => requests.map((r) => ({ ...r, _emp: empName(r.employee), _type: typeName(r.timeOffType) })), [requests, employees, types]);
  const allocRows = useMemo(
    () => allocations.map((a) => {
      const taken = takenFor(a.employee, a.timeOffType);
      return { ...a, _emp: empName(a.employee), _type: typeName(a.timeOffType), _taken: taken, _remaining: (a.allocated || 0) - taken };
    }),
    [allocations, requests, employees, types]
  );

  const reqCols = [
    { key: 'emp', label: 'Employee', render: (r) => <span className="font-medium">{r._emp}</span> },
    { key: 'type', label: 'Type', render: (r) => r._type },
    { key: 'dates', label: 'Dates', render: (r) => `${fmt(r.dateFrom)} → ${fmt(r.dateTo)}` },
    { key: 'duration', label: 'Days', render: (r) => r.duration },
    { key: 'state', label: 'Status', render: (r) => <StatusBadge status={r.state} /> },
  ];
  const allocCols = [
    { key: 'emp', label: 'Employee', render: (r) => <span className="font-medium">{r._emp}</span> },
    { key: 'type', label: 'Type', render: (r) => r._type },
    { key: 'allocated', label: 'Allocated', render: (r) => `${r.allocated} d` },
    { key: 'taken', label: 'Taken', render: (r) => `${r._taken} d` },
    { key: 'remaining', label: 'Remaining', render: (r) => <span className="font-medium text-emerald-600">{r._remaining} d</span> },
    { key: 'state', label: 'Status', render: (r) => <StatusBadge status={r.state} /> },
  ];
  const typeCols = [
    { key: 'name', label: 'Name', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'code', label: 'Code', render: (r) => <span className="font-mono text-xs text-muted">{r.code}</span> },
    { key: 'unit', label: 'Unit' },
    { key: 'requiresAllocation', label: 'Allocation', render: (r) => (r.requiresAllocation ? 'Required' : 'No') },
    { key: 'paid', label: 'Payroll', render: (r) => (r.paid ? <span className="badge bg-emerald-50 text-emerald-700">Paid</span> : <span className="badge bg-rose-50 text-rose-600">Unpaid</span>) },
  ];

  const cfg = {
    requests: { rows: reqRows, cols: reqCols, loading: lReq, label: 'New Request', empty: 'No requests yet.' },
    allocations: { rows: allocRows, cols: allocCols, loading: lAll, label: 'New Allocation', empty: 'No allocations yet.' },
    types: { rows: types, cols: typeCols, loading: lTyp, label: 'New Type', empty: 'No leave types yet.' },
  }[tab];

  return (
    <div>
      <Tabs tabs={TABS} active={tab} onChange={(t) => setTab(t)} />
      <PageToolbar onNew={openNew} newLabel={cfg.label} />
      <DataTable columns={cfg.cols} rows={cfg.rows} loading={cfg.loading} onRowClick={openRow} empty={cfg.empty} />

      {tab === 'requests' && <RequestForm open={open} record={selected} onClose={() => setOpen(false)} />}
      {tab === 'allocations' && <AllocationForm open={open} record={selected} onClose={() => setOpen(false)} />}
      {tab === 'types' && <TypeForm open={open} record={selected} onClose={() => setOpen(false)} />}
    </div>
  );
}
