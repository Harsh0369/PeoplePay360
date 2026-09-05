import React from 'react';
import { Users, FileText, CalendarCheck, Clock, DollarSign, BarChart3, Server } from 'lucide-react';

interface NavbarProps {
  activeTab: 'EMPLOYEES' | 'CONTRACTS';
  onTabChange: (tab: 'EMPLOYEES' | 'CONTRACTS') => void;
  isBackendConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, isBackendConnected = false }) => {
  return (
    <header className="bg-brand-deepTeal text-brand-offWhite shadow-md sticky top-0 z-50 border-b border-brand-darkTeal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
        {/* Logo & App Title */}
        <div className="flex items-center space-x-3">
          <div className="bg-brand-darkTeal px-2.5 py-1 rounded-md text-brand-offWhite font-black text-sm tracking-wider flex items-center justify-center shadow">
            360
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-brand-offWhite block leading-none">
              PeoplePay360
            </span>
            <span className="text-[10px] text-[#A7C8C2] font-medium tracking-wide">
              HR & Payroll Platform
            </span>
          </div>
        </div>

        {/* Navigation Menus */}
        <nav className="flex items-center space-x-1.5 h-full">
          <button
            onClick={() => onTabChange('EMPLOYEES')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-md transition-all ${
              activeTab === 'EMPLOYEES'
                ? 'bg-brand-teal text-white shadow-sm'
                : 'text-[#E5F0ED] hover:bg-brand-darkTeal hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-[#B8D8D2]" />
            <span>Employees</span>
          </button>

          <button
            onClick={() => onTabChange('CONTRACTS')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-md transition-all ${
              activeTab === 'CONTRACTS'
                ? 'bg-brand-teal text-white shadow-sm'
                : 'text-[#E5F0ED] hover:bg-brand-darkTeal hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-[#B8D8D2]" />
            <span>Contracts</span>
          </button>

          {/* Inactive HR Navigation Options */}
          <div className="opacity-40 flex items-center space-x-1 cursor-not-allowed text-[#E5F0ED] text-xs px-2 py-1.5" title="Module coming soon">
            <Clock className="w-3.5 h-3.5 mr-1" />
            <span>Attendance</span>
          </div>

          <div className="opacity-40 flex items-center space-x-1 cursor-not-allowed text-[#E5F0ED] text-xs px-2 py-1.5" title="Module coming soon">
            <CalendarCheck className="w-3.5 h-3.5 mr-1" />
            <span>Time Off</span>
          </div>

          <div className="opacity-40 flex items-center space-x-1 cursor-not-allowed text-[#E5F0ED] text-xs px-2 py-1.5" title="Module coming soon">
            <DollarSign className="w-3.5 h-3.5 mr-1" />
            <span>Payroll</span>
          </div>

          <div className="opacity-40 flex items-center space-x-1 cursor-not-allowed text-[#E5F0ED] text-xs px-2 py-1.5" title="Module coming soon">
            <BarChart3 className="w-3.5 h-3.5 mr-1" />
            <span>Reports</span>
          </div>
        </nav>

        {/* Connection Status & User Badge */}
        <div className="flex items-center space-x-3">
          <div
            className={`flex items-center space-x-1.5 text-[11px] px-2.5 py-1 rounded-full font-bold border transition-colors ${
              isBackendConnected
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                : 'bg-brand-darkTeal text-brand-offWhite border-brand-teal/40'
            }`}
            title={isBackendConnected ? 'Connected to live Express/MongoDB API' : 'Running in local reactive mode'}
          >
            <Server className={`w-3 h-3 ${isBackendConnected ? 'text-emerald-400' : 'text-[#B8D8D2]'}`} />
            <span>{isBackendConnected ? 'API Connected' : 'Local Mode'}</span>
          </div>

          <span className="text-xs bg-brand-darkTeal text-brand-offWhite px-3 py-1 rounded-full border border-[#B8D8D2]/30 font-medium hidden sm:inline-block">
            HR Manager
          </span>

          <div className="w-8 h-8 rounded-full bg-brand-darkTeal text-brand-offWhite flex items-center justify-center font-bold text-xs shadow border border-brand-teal">
            VK
          </div>
        </div>
      </div>
    </header>
  );
};
