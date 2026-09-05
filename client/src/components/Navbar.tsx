import React from 'react';
import { Users, FileText, CalendarCheck, Clock, DollarSign, BarChart3, Server, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { roleLabel } from '../services/auth';

interface NavbarProps {
  activeTab: 'EMPLOYEES' | 'CONTRACTS';
  onTabChange: (tab: 'EMPLOYEES' | 'CONTRACTS') => void;
  isBackendConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, isBackendConnected = false }) => {
  const { user, logout } = useAuth();
  const initials = (user?.name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="bg-brand-deepTeal text-brand-offWhite shadow-md sticky top-0 z-50 border-b border-brand-darkTeal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        
        {/* Proper Professional SVG Logo & Brand Title */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange('EMPLOYEES')}>
          <div className="w-10 h-10 rounded-xl bg-brand-darkTeal border border-brand-teal/40 flex items-center justify-center shadow-inner group transition-transform hover:scale-105">
            <svg
              className="w-6 h-6 text-brand-offWhite"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Outer 360 Orbit Ring */}
              <circle cx="12" cy="12" r="9" className="text-brand-teal opacity-60" strokeDasharray="4 2" />
              {/* Inner Workforce / Shield Core */}
              <path d="M12 3a9 9 0 0 1 9 9 9 9 0 0 1-9 9 9 9 0 0 1-9-9 9 9 0 0 1 9-9z" fill="none" />
              <path d="M16 11V7a4 4 0 0 0-8 0v4" stroke="currentColor" strokeWidth="2" />
              <rect x="6" y="11" width="12" height="9" rx="2" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="15.5" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-1 leading-none">
              <span className="font-extrabold text-lg tracking-tight text-brand-offWhite">
                PeoplePay
              </span>
              <span className="font-black text-lg tracking-tight text-brand-teal">
                360
              </span>
            </div>
            <span className="text-[10px] text-[#A7C8C2] font-semibold tracking-wider uppercase block mt-0.5">
              Integrated HR & Payroll
            </span>
          </div>
        </div>

        {/* Center Navigation Menus */}
        <nav className="flex items-center space-x-2 h-full">
          <button
            onClick={() => onTabChange('EMPLOYEES')}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'EMPLOYEES'
                ? 'bg-brand-teal text-white shadow-sm ring-1 ring-white/20'
                : 'text-[#E5F0ED] hover:bg-brand-darkTeal hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-[#B8D8D2]" />
            <span>Employees</span>
          </button>

          <button
            onClick={() => onTabChange('CONTRACTS')}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'CONTRACTS'
                ? 'bg-brand-teal text-white shadow-sm ring-1 ring-white/20'
                : 'text-[#E5F0ED] hover:bg-brand-darkTeal hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-[#B8D8D2]" />
            <span>Contracts</span>
          </button>

          {/* Module Placeholders */}
          <div className="opacity-40 flex items-center space-x-1 cursor-not-allowed text-[#E5F0ED] text-xs px-2.5 py-2" title="Module coming soon">
            <Clock className="w-3.5 h-3.5 mr-1" />
            <span>Attendance</span>
          </div>

          <div className="opacity-40 flex items-center space-x-1 cursor-not-allowed text-[#E5F0ED] text-xs px-2.5 py-2" title="Module coming soon">
            <CalendarCheck className="w-3.5 h-3.5 mr-1" />
            <span>Time Off</span>
          </div>

          <div className="opacity-40 flex items-center space-x-1 cursor-not-allowed text-[#E5F0ED] text-xs px-2.5 py-2" title="Module coming soon">
            <DollarSign className="w-3.5 h-3.5 mr-1" />
            <span>Payroll</span>
          </div>

          <div className="opacity-40 flex items-center space-x-1 cursor-not-allowed text-[#E5F0ED] text-xs px-2.5 py-2" title="Module coming soon">
            <BarChart3 className="w-3.5 h-3.5 mr-1" />
            <span>Reports</span>
          </div>
        </nav>

        {/* Right User & Server Status */}
        <div className="flex items-center space-x-3">
          <div
            className={`flex items-center space-x-1.5 text-[11px] px-3 py-1 rounded-full font-bold border transition-colors ${
              isBackendConnected
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                : 'bg-brand-darkTeal text-brand-offWhite border-brand-teal/40'
            }`}
            title={isBackendConnected ? 'Connected to live Express API' : 'Running in local reactive mode'}
          >
            <Server className={`w-3 h-3 ${isBackendConnected ? 'text-emerald-400' : 'text-[#B8D8D2]'}`} />
            <span>{isBackendConnected ? 'API Connected' : 'Local Mode'}</span>
          </div>

          <span className="text-xs bg-brand-darkTeal text-brand-offWhite px-3 py-1 rounded-full border border-[#B8D8D2]/30 font-medium hidden sm:inline-block">
            {roleLabel(user)}
          </span>

          <div
            className="w-9 h-9 rounded-full bg-brand-darkTeal text-brand-offWhite flex items-center justify-center font-bold text-xs shadow border border-brand-teal"
            title={user?.name || ''}
          >
            {initials}
          </div>

          <button
            onClick={logout}
            title="Log out"
            className="p-2 rounded-lg text-[#B8D8D2] hover:text-white hover:bg-brand-darkTeal transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
