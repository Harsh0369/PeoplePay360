import { useMemo, useState } from 'react';
import PageToolbar from '../../components/ui/PageToolbar.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import ScheduleForm from './ScheduleForm.jsx';
import { useSchedules } from './api.js';

const TYPE_LABEL = { full_time: 'Full-time', part_time: 'Part-time', flexible: 'Flexible' };

export default function SchedulesPage() {
  const { data: schedules = [], isLoading } = useSchedules();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  const rows = useMemo(
    () => schedules.filter((s) => s.name?.toLowerCase().includes(search.toLowerCase())),
    [schedules, search]
  );

  const columns = [
    { key: 'name', label: 'Name', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'calendarType', label: 'Type', render: (r) => TYPE_LABEL[r.calendarType] || r.calendarType },
    { key: 'daysPerWeek', label: 'Days/Week', render: (r) => r.daysPerWeek ?? '—' },
    { key: 'hoursPerWeek', label: 'Hours/Week', render: (r) => <span className="font-medium">{r.hoursPerWeek ?? 0} h</span> },
    { key: 'company', label: 'Company' },
    { key: 'active', label: 'Status', render: (r) => <StatusBadge status={r.active ? 'active' : 'inactive'} /> },
  ];

  return (
    <div>
      <PageToolbar
        search={search} onSearch={setSearch} searchPlaceholder="Search schedules…"
        onNew={() => { setSelected(null); setOpen(true); }} newLabel="New Schedule"
      />
      <DataTable
        columns={columns} rows={rows} loading={isLoading}
        onRowClick={(r) => { setSelected(r); setOpen(true); }}
        empty="No working schedules yet."
      />
      <ScheduleForm open={open} schedule={selected} onClose={() => setOpen(false)} />
    </div>
  );
}
