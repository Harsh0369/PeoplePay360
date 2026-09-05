import React from 'react';
import { Employee } from '../types';
import { Mail, Phone, Building2, Briefcase } from 'lucide-react';

interface EmployeeKanbanProps {
  employees: Employee[];
  onSelectEmployee: (emp: Employee) => void;
}

export const EmployeeKanban: React.FC<EmployeeKanbanProps> = ({ employees, onSelectEmployee }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {employees.map((emp) => (
        <div
          key={emp.id}
          onClick={() => onSelectEmployee(emp)}
          className="bg-brand-offWhite rounded-xl border border-brand-sandBorder shadow-sm hover:shadow-md hover:border-brand-teal transition-all cursor-pointer p-4 flex flex-col justify-between group"
        >
          {/* Card Header & Status Badge */}
          <div className="flex items-start justify-between space-x-3 mb-3">
            <img
              src={emp.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={emp.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-brand-softSand shadow-sm"
            />
            <div className="flex flex-col items-end">
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  emp.status === 'ACTIVE'
                    ? 'bg-brand-activeBg text-brand-activeText border border-brand-teal/30'
                    : emp.status === 'ON_LEAVE'
                    ? 'bg-brand-leaveBg text-brand-leaveText border border-amber-300'
                    : 'bg-brand-draftBg text-brand-draftText border border-brand-sandBorder'
                }`}
              >
                {emp.status.replace('_', ' ')}
              </span>
              <span className="text-[10px] text-brand-mutedSlate font-mono mt-1">
                {emp.empCode}
              </span>
            </div>
          </div>

          {/* Employee Name & Job Position */}
          <div className="mb-3">
            <h3 className="font-bold text-brand-darkCharcoal text-sm group-hover:text-brand-darkTeal transition-colors">
              {emp.name}
            </h3>
            <p className="text-xs text-brand-mutedSlate font-medium flex items-center mt-0.5">
              <Briefcase className="w-3 h-3 mr-1 text-brand-teal" />
              {emp.jobPosition}
            </p>
          </div>

          {/* Details / Department */}
          <div className="border-t border-brand-softSand pt-3 space-y-1.5 text-xs text-brand-mutedSlate">
            <div className="flex items-center text-brand-darkCharcoal">
              <Building2 className="w-3.5 h-3.5 mr-1.5 text-brand-mutedSlate" />
              <span className="font-semibold">{emp.department}</span>
            </div>
            <div className="flex items-center text-brand-mutedSlate truncate">
              <Mail className="w-3.5 h-3.5 mr-1.5 text-brand-mutedSlate flex-shrink-0" />
              <span className="truncate">{emp.workEmail}</span>
            </div>
            <div className="flex items-center text-brand-mutedSlate">
              <Phone className="w-3.5 h-3.5 mr-1.5 text-brand-mutedSlate" />
              <span>{emp.workPhone}</span>
            </div>
          </div>

          {/* Footer Smart Summary Badges */}
          <div className="mt-3 pt-2 border-t border-brand-softSand flex items-center justify-between text-[11px] text-brand-mutedSlate">
            <span>Contracts: <strong className="text-brand-darkTeal">{emp.contractCount}</strong></span>
            <span>Attendance: <strong className="text-brand-darkCharcoal">{emp.attendanceCount}d</strong></span>
          </div>
        </div>
      ))}
    </div>
  );
};
