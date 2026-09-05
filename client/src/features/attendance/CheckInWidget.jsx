import { useMemo, useState } from 'react';
import { LogIn, LogOut } from 'lucide-react';
import { useAttendance, useSaveAttendance, useEmployees } from './api.js';

// Kiosk-style check-in / check-out. Toggles based on whether the selected
// employee has an open (no check-out) attendance record.
export default function CheckInWidget() {
  const [emp, setEmp] = useState('');
  const { data: employees = [] } = useEmployees();
  const { data: records = [] } = useAttendance();
  const save = useSaveAttendance();

  const openRecord = useMemo(
    () => records.find((r) => r.employee === emp && !r.checkOut),
    [records, emp]
  );

  const checkIn = () =>
    save.mutate({ employee: emp, checkIn: new Date().toISOString(), checkOut: null, workedHours: 0, status: 'present' });

  const checkOut = () => {
    const out = new Date();
    const worked = Math.max(0, (out - new Date(openRecord.checkIn)) / 3.6e6);
    save.mutate({ ...openRecord, checkOut: out.toISOString(), workedHours: Math.round(worked * 100) / 100 });
  };

  return (
    <div className="card mb-5 flex flex-col items-center gap-4 p-6 sm:flex-row sm:justify-between">
      <div>
        <h3 className="font-semibold">Attendance Kiosk</h3>
        <p className="text-sm text-muted">Select an employee and check in or out.</p>
      </div>
      <div className="flex items-center gap-3">
        <select className="input w-56" value={emp} onChange={(e) => setEmp(e.target.value)}>
          <option value="">— Select employee —</option>
          {employees.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
        </select>
        {openRecord ? (
          <button className="btn bg-danger text-white hover:opacity-90" onClick={checkOut} disabled={!emp}>
            <LogOut size={16} /> Check Out
          </button>
        ) : (
          <button className="btn-primary" onClick={checkIn} disabled={!emp}>
            <LogIn size={16} /> Check In
          </button>
        )}
      </div>
    </div>
  );
}
