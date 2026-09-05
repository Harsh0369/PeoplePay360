import { useMemo, useState } from 'react';
import PageToolbar from '../../components/ui/PageToolbar.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import CheckInWidget from './CheckInWidget.jsx';
import AttendanceForm from './AttendanceForm.jsx';
import { useAttendance, useEmployees } from './api.js';

const fmt = (iso) => (iso ? new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');

export default function AttendancePage() {
  const { data: records = [], isLoading } = useAttendance();
  const { data: employees = [] } = useEmployees();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  const empName = (id) => employees.find((e) => e._id === id)?.name || '—';

  const rows = useMemo(
    () => records
      .map((r) => ({ ...r, _emp: empName(r.employee) }))
      .filter((r) => r._emp.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.checkIn) - new Date(a.checkIn)),
    [records, employees, search]
  );

  const columns = [
    { key: 'emp', label: 'Employee', render: (r) => <span className="font-medium">{r._emp}</span> },
    { key: 'checkIn', label: 'Check In', render: (r) => fmt(r.checkIn) },
    {
      key: 'checkOut', label: 'Check Out',
      render: (r) => r.checkOut ? fmt(r.checkOut) : <span className="text-amber-600">missing</span>,
    },
    { key: 'workedHours', label: 'Worked Hours', render: (r) => `${r.workedHours ?? 0} h` },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <CheckInWidget />
      <PageToolbar
        search={search} onSearch={setSearch} searchPlaceholder="Search by employee…"
        onNew={() => { setSelected(null); setOpen(true); }} newLabel="Add / Correct"
      />
      <DataTable
        columns={columns} rows={rows} loading={isLoading}
        onRowClick={(r) => { setSelected(r); setOpen(true); }}
        empty="No attendance records yet."
      />
      <AttendanceForm open={open} record={selected} onClose={() => setOpen(false)} />
    </div>
  );
}
