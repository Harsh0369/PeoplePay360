import React from 'react';
import { Users, FileText, CalendarCheck, Clock, DollarSign, BarChart3, Server, LogOut, Briefcase, Building2, ShieldCheck, UserCircle, LucideIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { roleLabel } from '../services/auth';
import { ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isBackendConnected?: boolean;
}

const TabBtn: React.FC<{
  tab: ActiveTab; label: string; icon: LucideIcon;
  activeTab: ActiveTab; onTabChange: (t: ActiveTab) => void;
}> = ({ tab, label, icon: Icon, activeTab, onTabChange }) => (
  <button
    onClick={() => onTabChange(tab)}
    className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
      activeTab === tab
        ? 'bg-brand-teal text-white shadow-sm'
        : 'text-[#CFE3DF] hover:bg-brand-darkTeal hover:text-white'
    }`}
  >
    <Icon className={`w-4 h-4 ${activeTab === tab ? 'text-white' : 'text-[#8FBDB5]'}`} />
    <span>{label}</span>
  </button>
);

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, isBackendConnected = false }) => {
  const { user, logout, can } = useAuth();

  // Every tab with the permission that unlocks it (undefined = always visible).
  const TABS: { tab: ActiveTab; label: string; icon: LucideIcon; perms?: string[] }[] = [
    { tab: 'EMPLOYEES', label: 'Employees', icon: Users },
    { tab: 'CONTRACTS', label: 'Contracts', icon: FileText },
    { tab: 'JOB_POSITIONS', label: 'Job Positions', icon: Briefcase },
    { tab: 'ATTENDANCE', label: 'Attendance', icon: Clock, perms: ['admin', 'Attendance.Read'] },
    { tab: 'TIMEOFF', label: 'Time Off', icon: CalendarCheck, perms: ['admin', 'TimeOff.Read'] },
    { tab: 'PAYROLL', label: 'Payroll', icon: DollarSign, perms: ['admin', 'Payroll.Read', 'Payroll.Write', 'payroll.manage'] },
    { tab: 'CONFIG', label: 'Config', icon: BarChart3, perms: ['admin', 'payroll.manage'] },
    { tab: 'ORG', label: 'Organization', icon: Building2, perms: ['admin', 'Organization.Read'] },
    { tab: 'SETTINGS', label: 'Roles', icon: ShieldCheck, perms: ['admin', 'Settings.Read'] },
    { tab: 'MY_PROFILE', label: 'My Profile', icon: UserCircle },
  ];
  const visibleTabs = TABS.filter((t) => !t.perms || can(...t.perms));

  const initials = (user?.name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <header className="bg-brand-deepTeal text-brand-offWhite shadow-md sticky top-0 z-50">
      {/* Row 1: brand + user */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('EMPLOYEES')}>
            <div className="w-9 h-9 rounded-xl bg-brand-darkTeal border border-brand-teal/40 flex items-center justify-center shadow-inner">
              <svg className="w-5 h-5 text-brand-offWhite" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" className="text-brand-teal opacity-60" strokeDasharray="4 2" />
                <path d="M16 11V7a4 4 0 0 0-8 0v4" />
                <rect x="6" y="11" width="12" height="9" rx="2" fill="currentColor" fillOpacity="0.2" />
                <circle cx="12" cy="15.5" r="1.5" fill="currentColor" />
              </svg>
            </div>
            <div className="leading-none">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-lg tracking-tight text-brand-offWhite">PeoplePay</span>
                <span className="font-black text-lg tracking-tight text-brand-teal">360</span>
              </div>
              <span className="text-[10px] text-[#A7C8C2] font-semibold tracking-wider uppercase block mt-1">
                Integrated HR &amp; Payroll
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`hidden sm:flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full font-bold border ${
              isBackendConnected ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40' : 'bg-brand-darkTeal text-[#CFE3DF] border-brand-teal/40'
            }`}>
              <Server className={`w-3 h-3 ${isBackendConnected ? 'text-emerald-400' : 'text-[#8FBDB5]'}`} />
              <span>{isBackendConnected ? 'API Connected' : 'Offline'}</span>
            </div>

            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-9 h-9 rounded-full bg-brand-teal text-white flex items-center justify-center font-bold text-xs shadow" title={user?.name || ''}>
                {initials}
              </div>
              <div className="hidden md:block leading-tight">
                <div className="text-sm font-semibold text-brand-offWhite">{user?.name}</div>
                <div className="text-[11px] text-[#A7C8C2]">{roleLabel(user)}</div>
              </div>
              <button onClick={logout} title="Log out" className="ml-1 p-2 rounded-lg text-[#8FBDB5] hover:text-white hover:bg-brand-darkTeal transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: tabs, full width */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <nav className="flex items-center gap-1 h-12 overflow-x-auto no-scrollbar">
          {visibleTabs.map((t) => (
            <TabBtn key={t.tab} tab={t.tab} label={t.label} icon={t.icon} activeTab={activeTab} onTabChange={onTabChange} />
          ))}
        </nav>
      </div>
    </header>
  );
};
