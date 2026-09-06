import React, { useEffect, useState } from 'react';
import { Loader2, Mail, Phone, Building2, Briefcase, User, CalendarClock, Wallet, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { masterApi, timeOffApi, attendanceApi } from '../services/hrApi';
import { inr, fmtDate } from '../lib/format';

const nameOf = (v: any) => (v && typeof v === 'object' ? v.name || v.title : v) || '—';

const CalendarWidget: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendance, setAttendance] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const loadData = async () => {
      setLoading(true);
      try {
        const attRes = await attendanceApi.getMyAttendance(`?startDate=${start.toISOString()}&endDate=${end.toISOString()}&limit=100`);
        const reqRes = await timeOffApi.getMyRequests();
        if (mounted) {
          setAttendance(Array.isArray(attRes) ? attRes : []);
          setLeaves((Array.isArray(reqRes) ? reqRes : []).filter(r => r.status === 'APPROVED'));
        }
      } catch (e) {
        console.error("Failed to load calendar data", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadData();
    return () => { mounted = false; };
  }, [currentDate]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 is Sunday
  
  const getDayStatus = (dayNum: number) => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (d > today) return null; // Future

    // Check Leaves
    const leave = leaves.find(l => {
      const s = new Date(l.startDate);
      const e = new Date(l.endDate);
      s.setHours(0,0,0,0); e.setHours(23,59,59,999);
      return d >= s && d <= e;
    });
    if (leave) return { type: 'leave', label: 'On Leave' };

    // Check Attendance
    const att = attendance.find(a => {
      const ad = new Date(a.date || (a.checkIn?.time));
      return ad.getDate() === dayNum && ad.getMonth() === d.getMonth();
    });

    if (att) {
      if (att.status === 'Present') return { type: 'present', label: 'Present' };
      if (att.status === 'Late') return { type: 'late', label: 'Late' };
      if (att.status === 'Half-Day') return { type: 'half', label: 'Half-Day' };
      if (att.status === 'Absent') return { type: 'absent', label: 'Absent' };
      return { type: 'present', label: 'Present' }; // default to present if record exists but status unknown
    }

    // Past day with no record, check if weekend
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return { type: 'weekend', label: 'Weekend' };

    return { type: 'absent', label: 'Absent' };
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const statusColors: Record<string, string> = {
    present: 'bg-emerald-500',
    absent: 'bg-rose-500',
    late: 'bg-orange-500',
    half: 'bg-amber-400',
    leave: 'bg-purple-500',
    weekend: 'bg-slate-300',
  };

  return (
    <Section title="Attendance Calendar">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-brand-darkCharcoal">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h4>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="p-1 hover:bg-brand-hoverRow rounded"><ChevronLeft className="w-5 h-5 text-brand-mutedSlate" /></button>
          <button onClick={nextMonth} className="p-1 hover:bg-brand-hoverRow rounded"><ChevronRight className="w-5 h-5 text-brand-mutedSlate" /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-brand-mutedSlate mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-brand-teal" /></div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const status = getDayStatus(day);
            return (
              <div key={day} title={status?.label || ''} className="aspect-square relative flex items-center justify-center border border-brand-sandBorder/50 rounded hover:bg-brand-hoverRow transition-colors cursor-default">
                <span className="text-sm text-brand-darkCharcoal z-10">{day}</span>
                {status && (
                  <div className={`absolute bottom-1 right-1 w-2 h-2 rounded-full ${statusColors[status.type]} shadow-sm`} />
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-brand-sandBorder/50 text-xs text-brand-mutedSlate">
        <div className="flex items-center gap-1.5"><div className={`w-2 h-2 rounded-full ${statusColors.present}`} /> Present</div>
        <div className="flex items-center gap-1.5"><div className={`w-2 h-2 rounded-full ${statusColors.absent}`} /> Absent</div>
        <div className="flex items-center gap-1.5"><div className={`w-2 h-2 rounded-full ${statusColors.late}`} /> Late</div>
        <div className="flex items-center gap-1.5"><div className={`w-2 h-2 rounded-full ${statusColors.leave}`} /> Leave</div>
      </div>
    </Section>
  );
};

export const MyProfileModule: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true); setError('');
      try {
        const me = await masterApi.getMyProfile();
        setData(me);
        // Best-effort: my leave balances (may be forbidden for some roles).
        try {
          const all = await timeOffApi.getAllocations();
          const myId = me?.employee?._id;
          setAllocations((Array.isArray(all) ? all : []).filter((a: any) => (a.employeeId?._id || a.employeeId) === myId));
        } catch { /* ignore */ }
      } catch (e: any) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-brand-teal" /></div>;
  if (error) return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="rounded-lg bg-brand-warningBg text-brand-warningText px-4 py-3 text-sm">
        {error}. {/No employee profile/i.test(error) && 'Your user account is not linked to an employee record.'}
      </div>
    </div>
  );

  const emp = data?.employee || {};
  const c = data?.activeContract;
  const initials = (emp.name || '?').split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header card */}
      <div className="bg-brand-offWhite rounded-xl border border-brand-sandBorder shadow-sm p-6 mb-5 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-brand-teal text-white grid place-items-center text-xl font-bold shadow">{initials}</div>
        <div>
          <h2 className="text-xl font-bold text-brand-darkCharcoal">{emp.name}</h2>
          <p className="text-brand-mutedSlate">{nameOf(emp.jobPositionId)} · {nameOf(emp.departmentId)}</p>
          <span className="badge bg-brand-activeBg text-brand-activeText mt-1">{emp.status || 'Active'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Contact & role */}
          <Section title="My Details">
            <Row icon={Mail} label="Work Email" value={emp.workEmail} />
            <Row icon={Phone} label="Work Phone" value={emp.workPhone || '—'} />
            <Row icon={Building2} label="Department" value={nameOf(emp.departmentId)} />
            <Row icon={Briefcase} label="Position" value={nameOf(emp.jobPositionId)} />
            <Row icon={User} label="Manager" value={nameOf(emp.managerId)} />
            <Row icon={CalendarClock} label="Joined" value={fmtDate(emp.joinDate)} />
          </Section>

          {/* Active contract */}
          <Section title="My Contract">
            {c ? (
              <>
                <Row icon={Wallet} label="Monthly Wage" value={inr(c.wage)} strong />
                <Row icon={CalendarClock} label="Start" value={fmtDate(c.startDate)} />
                <Row icon={CalendarClock} label="End" value={c.endDate ? fmtDate(c.endDate) : 'Open-ended'} />
                <Row icon={Clock} label="Schedule" value={`${nameOf(c.workingScheduleId)} (${c.workingScheduleId?.totalWeeklyHours ?? '—'} h/wk)`} />
                <Row icon={Briefcase} label="Status" value={c.status} />
              </>
            ) : <p className="text-sm text-brand-mutedSlate">No active contract found.</p>}
          </Section>
          
          {/* Leave balances */}
          {allocations.length > 0 && (
            <Section title="My Leave Balances">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {allocations.map((a) => (
                  <div key={a._id} className="rounded-lg border border-brand-sandBorder p-3">
                    <div className="text-xs text-brand-mutedSlate">{nameOf(a.timeOffTypeId)} · {a.validityYear}</div>
                    <div className="text-lg font-bold text-brand-darkTeal">{a.grantedDays - a.usedDays} <span className="text-xs font-medium text-brand-mutedSlate">/ {a.grantedDays} days left</span></div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        <div className="lg:col-span-1 space-y-5">
          {/* Calendar Widget */}
          <CalendarWidget />
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-brand-offWhite rounded-xl border border-brand-sandBorder shadow-sm p-5">
    <h3 className="font-semibold text-brand-darkCharcoal mb-3">{title}</h3>
    <div className="space-y-2.5">{children}</div>
  </div>
);
const Row: React.FC<{ icon: any; label: string; value: any; strong?: boolean }> = ({ icon: Icon, label, value, strong }) => (
  <div className="flex items-center gap-3 text-sm">
    <Icon className="w-4 h-4 text-brand-mutedSlate shrink-0" />
    <span className="text-brand-mutedSlate w-28 shrink-0">{label}</span>
    <span className={strong ? 'font-bold text-brand-darkTeal' : 'font-medium text-brand-darkCharcoal'}>{value}</span>
  </div>
);
