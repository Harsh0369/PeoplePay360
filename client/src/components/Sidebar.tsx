import React from 'react';
import {
  Users, FileText, Briefcase, Clock, CalendarCheck, Wallet,
  SlidersHorizontal, Building2, ShieldCheck, ShieldAlert, UserCircle, LogOut, ShieldCheck as Logo, LucideIcon, LayoutDashboard, X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { roleLabel } from '../services/auth';
import { ActiveTab } from '../types';
import { TAB_PERMS } from '../lib/permissions';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isBackendConnected?: boolean;
  counts?: Partial<Record<ActiveTab, number>>;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

type Item = { tab: ActiveTab; label: string; icon: LucideIcon; section: 'main' | 'admin' | 'me' };

// Visibility is driven centrally by TAB_PERMS so nav, page guards and the
// backend all agree on who sees what.
const ITEMS: Item[] = [
  { tab: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard, section: 'main' },
  { tab: 'EMPLOYEES', label: 'Employees', icon: Users, section: 'main' },
  { tab: 'CONTRACTS', label: 'Contracts', icon: FileText, section: 'main' },
  { tab: 'JOB_POSITIONS', label: 'Job Positions', icon: Briefcase, section: 'main' },
  { tab: 'ATTENDANCE', label: 'Attendance', icon: Clock, section: 'main' },
  { tab: 'TIMEOFF', label: 'Time Off', icon: CalendarCheck, section: 'main' },
  { tab: 'PAYROLL', label: 'Payroll', icon: Wallet, section: 'main' },
  { tab: 'CONFIG', label: 'Config', icon: SlidersHorizontal, section: 'admin' },
  { tab: 'ORG', label: 'Organization', icon: Building2, section: 'admin' },
  { tab: 'SETTINGS', label: 'Roles & Access', icon: ShieldCheck, section: 'admin' },
  { tab: 'AUDIT', label: 'Audit Trail', icon: ShieldAlert, section: 'admin' },
  { tab: 'MY_PROFILE', label: 'My Profile', icon: UserCircle, section: 'me' },
];

const NavLink: React.FC<{ item: Item; active: boolean; count?: number; onClick: () => void }> = ({ item, active, count, onClick }) => {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={`group w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-150 ${
        active ? 'bg-white/10 text-white font-medium shadow-sm border border-white/10' : 'text-emerald-100/75 hover:bg-white/5 hover:text-white'
      }`}
    >
      <span className="flex items-center gap-3">
        <Icon className={`w-4 h-4 ${active ? 'text-emerald-300' : 'text-emerald-300/60 group-hover:text-emerald-300'}`} />
        <span className="text-sm">{item.label}</span>
      </span>
      {count != null && count > 0 && (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${active ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30' : 'bg-white/5 text-emerald-200/80'}`}>
          {count}
        </span>
      )}
    </button>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isBackendConnected = false, counts = {}, mobileOpen = false, onMobileClose }) => {
  const { user, logout, can } = useAuth();
  const visible = ITEMS.filter((i) => {
    const perms = TAB_PERMS[i.tab];
    return !perms || can(...perms);
  });
  const main = visible.filter((i) => i.section === 'main');
  const admin = visible.filter((i) => i.section === 'admin');
  const me = visible.filter((i) => i.section === 'me');
  const initials = (user?.name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  const handleNav = (tab: ActiveTab) => {
    onTabChange(tab);
    onMobileClose?.();
  };

  const sidebarContent = (
    <>
      <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar">
        {/* Brand */}
        <div className="h-20 flex items-center px-6 gap-3 border-b border-white/10 bg-brand-900/30">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-black/20 ring-1 ring-white/20">
            <Logo className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-lg font-extrabold tracking-tight text-white">PeoplePay</span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-500/25 text-emerald-300 border border-emerald-400/30">360</span>
            </div>
            <p className="text-[11px] font-medium text-emerald-100/60 mt-1 uppercase tracking-wider">HR &amp; Payroll Suite</p>
          </div>
          {/* Close button visible only on mobile */}
          <button onClick={onMobileClose} className="lg:hidden p-1.5 rounded-lg text-emerald-200/50 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav aria-label="Primary" className="p-4 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold tracking-wider text-emerald-200/50 uppercase">Main Modules</div>
          {main.map((i) => <NavLink key={i.tab} item={i} active={activeTab === i.tab} count={counts[i.tab]} onClick={() => handleNav(i.tab)} />)}

          {admin.length > 0 && <div className="pt-4 px-3 py-2 text-[10px] font-bold tracking-wider text-emerald-200/50 uppercase">Administration</div>}
          {admin.map((i) => <NavLink key={i.tab} item={i} active={activeTab === i.tab} count={counts[i.tab]} onClick={() => handleNav(i.tab)} />)}

          {me.length > 0 && <div className="pt-4 px-3 py-2 text-[10px] font-bold tracking-wider text-emerald-200/50 uppercase">Personal</div>}
          {me.map((i) => <NavLink key={i.tab} item={i} active={activeTab === i.tab} count={counts[i.tab]} onClick={() => handleNav(i.tab)} />)}
        </nav>
      </div>

      {/* Bottom: status + profile */}
      <div className="p-4 border-t border-white/10 bg-brand-900/40 space-y-3">


        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-bold text-white text-xs shadow">{initials}</div>
            <div className="truncate">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-emerald-200/60 truncate">{roleLabel(user)}</p>
            </div>
          </div>
          <button onClick={logout} className="text-emerald-200/50 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar — always visible at lg+ */}
      <aside className="hidden lg:flex w-64 bg-brand-850 text-white flex-shrink-0 flex-col justify-between border-r border-brand-900/60 z-30 shadow-sidebar select-none">
        {sidebarContent}
      </aside>

      {/* Mobile overlay sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onMobileClose} />
          <aside className="relative w-72 max-w-[85vw] bg-brand-850 text-white flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
