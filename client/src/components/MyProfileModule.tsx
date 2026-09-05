import React, { useEffect, useState } from 'react';
import { Loader2, Mail, Phone, Building2, Briefcase, User, CalendarClock, Wallet, Clock } from 'lucide-react';
import { masterApi, timeOffApi } from '../services/hrApi';
import { inr, fmtDate } from '../lib/format';

const nameOf = (v: any) => (v && typeof v === 'object' ? v.name || v.title : v) || '—';

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header card */}
      <div className="bg-brand-offWhite rounded-xl border border-brand-sandBorder shadow-sm p-6 mb-5 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-brand-teal text-white grid place-items-center text-xl font-bold shadow">{initials}</div>
        <div>
          <h2 className="text-xl font-bold text-brand-darkCharcoal">{emp.name}</h2>
          <p className="text-brand-mutedSlate">{nameOf(emp.jobPositionId)} · {nameOf(emp.departmentId)}</p>
          <span className="badge bg-brand-activeBg text-brand-activeText mt-1">{emp.status || 'Active'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
      </div>

      {/* Leave balances */}
      {allocations.length > 0 && (
        <div className="mt-5">
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
        </div>
      )}
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
