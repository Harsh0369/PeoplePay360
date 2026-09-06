import React from 'react';
import { Employee } from '../types';
import { Mail, Phone, Building2, Briefcase } from 'lucide-react';

interface EmployeeKanbanProps {
  employees: Employee[];
  onSelectEmployee: (emp: Employee) => void;
  onDeleteEmployee: (id: string) => void;
}

export const EmployeeKanban: React.FC<EmployeeKanbanProps> = ({ employees, onSelectEmployee, onDeleteEmployee }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 p-4 sm:p-6">
      {employees.map((emp) => (
        <div
          key={emp.id}
          onClick={() => onSelectEmployee(emp)}
          className="bg-brand-offWhite rounded-xl border border-brand-sandBorder shadow-sm hover:shadow-md hover:border-brand-teal transition-all cursor-pointer p-5 flex flex-col justify-between group h-full"
        >
          <div>
            {/* Header: Avatar, Status Badge & Code */}
            <div className="flex items-start justify-between space-x-3 mb-4">
              <img
                src={emp.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={emp.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-brand-softSand shadow-sm flex-shrink-0"
              />
              <div className="flex flex-col items-end space-y-1">
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    emp.status === 'Active'
                      ? 'bg-brand-activeBg text-brand-activeText border border-brand-teal/30'
                      : emp.status === 'Inactive'
                      ? 'bg-brand-leaveBg text-brand-leaveText border border-amber-300'
                      : 'bg-brand-draftBg text-brand-draftText border border-brand-sandBorder'
                  }`}
                >
                  {emp.status}
                </span>
                <span className="text-[10px] text-brand-mutedSlate font-mono font-medium">
                  {emp.empCode}
                </span>
              </div>
            </div>

            {/* Name & Title */}
            <div className="mb-4">
              <h3 className="font-extrabold text-brand-darkCharcoal text-sm group-hover:text-brand-darkTeal transition-colors line-clamp-1">
                {emp.name}
              </h3>
              <p className="text-xs text-brand-mutedSlate font-medium flex items-center mt-1">
                <Briefcase className="w-3.5 h-3.5 mr-1.5 text-brand-teal flex-shrink-0" />
                <span className="truncate">{emp.jobPosition}</span>
              </p>
            </div>

            {/* Information List */}
            <div className="border-t border-brand-softSand pt-3 space-y-2 text-xs text-brand-mutedSlate">
              <div className="flex items-center text-brand-darkCharcoal font-semibold">
                <Building2 className="w-3.5 h-3.5 mr-2 text-brand-mutedSlate flex-shrink-0" />
                <span className="truncate">{emp.department}</span>
              </div>
              <div className="flex items-center text-brand-mutedSlate truncate">
                <Mail className="w-3.5 h-3.5 mr-2 text-brand-mutedSlate flex-shrink-0" />
                <span className="truncate">{emp.workEmail}</span>
              </div>
              <div className="flex items-center text-brand-mutedSlate">
                <Phone className="w-3.5 h-3.5 mr-2 text-brand-mutedSlate flex-shrink-0" />
                <span>{emp.workPhone}</span>
              </div>
            </div>
          </div>

          {/* Footer Summary Badges */}
          <div className="mt-4 pt-3 border-t border-brand-softSand flex items-center justify-between text-[11px] text-brand-mutedSlate font-medium">
            <div className="flex items-center space-x-3">
              <span>Contracts: <strong className="text-brand-darkTeal">{emp.contractCount}</strong></span>
              <span>Attendance: <strong className="text-brand-darkCharcoal">{emp.attendanceCount}d</strong></span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteEmployee(emp.id);
              }}
              className="text-brand-warningText hover:text-red-700 hover:underline font-bold text-xs"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
