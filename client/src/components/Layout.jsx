import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, CalendarClock, Clock, CalendarDays,
  Wallet, Settings2, ShieldCheck, Bell, Search, LogOut,
} from 'lucide-react';
import { useAuth, ROLE_LABEL } from '../lib/auth.jsx';

// Each item declares the minimum role that can see it (RBAC nav gating).
const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true, min: 'employee' },
  { to: '/employees', label: 'Employees', icon: Users, min: 'hr_manager' },
  { to: '/contracts', label: 'Contracts', icon: FileText, min: 'hr_manager' },
  { to: '/schedules', label: 'Schedules', icon: CalendarClock, min: 'hr_manager' },
  { to: '/attendance', label: 'Attendance', icon: Clock, min: 'employee' },
  { to: '/timeoff', label: 'Time Off', icon: CalendarDays, min: 'employee' },
  { to: '/payroll', label: 'Payroll', icon: Wallet, min: 'hr_payroll_user' },
  { to: '/config', label: 'Configuration', icon: Settings2, min: 'hr_payroll_manager' },
  { to: '/users', label: 'Users', icon: ShieldCheck, min: 'admin' },
];

export default function Layout() {
  const { pathname } = useLocation();
  const { user, logout, can } = useAuth();
  const nav = useNavigate();

  const items = NAV.filter((n) => can(n.min));
  const current = items.find((n) => (n.end ? pathname === n.to : pathname.startsWith(n.to)));
  const initials = (user?.name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  const doLogout = () => { logout(); nav('/login'); };

  return (
    <div className="flex min-h-screen bg-canvas text-ink">
      <aside className="fixed inset-y-0 left-0 z-20 flex w-60 flex-col bg-sidebar text-white/90">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand font-bold text-white">P</div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-white">PeoplePay360</div>
            <div className="text-[11px] text-white/50">HR &amp; Payroll</div>
          </div>
        </div>

        <nav className="mt-2 flex-1 space-y-0.5 overflow-y-auto px-3">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  isActive ? 'bg-brand text-white shadow-sm' : 'text-white/70 hover:bg-sidebar-hover hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-sm font-semibold">{initials}</div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-sm font-medium text-white">{user?.name}</div>
              <div className="text-[11px] text-white/50">{ROLE_LABEL[user?.role]}</div>
            </div>
            <button className="text-white/50 hover:text-white" onClick={doLogout} title="Log out"><LogOut size={16} /></button>
          </div>
        </div>
      </aside>

      <div className="ml-60 flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-line bg-white/80 px-6 backdrop-blur">
          <h1 className="text-lg font-semibold">{current?.label ?? 'PeoplePay360'}</h1>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search size={16} className="absolute left-3 top-2.5 text-muted" />
              <input className="input w-64 pl-9" placeholder="Search…" />
            </div>
            <button className="btn-ghost relative p-2">
              <Bell size={18} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6"><Outlet /></main>
      </div>
    </div>
  );
}
