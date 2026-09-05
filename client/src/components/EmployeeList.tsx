import React from 'react';
import { Employee } from '../types';
import { Mail, FileText } from 'lucide-react';

interface EmployeeListProps {
  employees: Employee[];
  onSelectEmployee: (emp: Employee) => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({ employees, onSelectEmployee }) => {
  return (
    <div className="p-4">
      <div className="bg-brand-offWhite rounded-xl border border-brand-sandBorder shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-brand-softSand border-b border-brand-sandBorder text-brand-deepTeal uppercase font-bold text-[11px] tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Employee</th>
              <th className="py-3.5 px-4">Work Email</th>
              <th className="py-3.5 px-4">Department</th>
              <th className="py-3.5 px-4">Job Position</th>
              <th className="py-3.5 px-4">Manager</th>
              <th className="py-3.5 px-4">Schedule</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-sandBorder/60 text-brand-darkCharcoal">
            {employees.map((emp) => (
              <tr
                key={emp.id}
                onClick={() => onSelectEmployee(emp)}
                className="hover:bg-brand-hoverRow transition-colors cursor-pointer"
              >
                <td className="py-3 px-4 flex items-center space-x-3">
                  <img
                    src={emp.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={emp.name}
                    className="w-8 h-8 rounded-full object-cover border border-brand-sandBorder"
                  />
                  <div>
                    <span className="font-bold text-brand-darkCharcoal block text-xs">
                      {emp.name}
                    </span>
                    <span className="text-[10px] text-brand-mutedSlate font-mono">
                      {emp.empCode}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-brand-mutedSlate">
                  <div className="flex items-center">
                    <Mail className="w-3 h-3 mr-1 text-brand-mutedSlate" />
                    {emp.workEmail}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="font-semibold bg-brand-softSand text-brand-deepTeal border border-brand-sandBorder px-2.5 py-0.5 rounded text-[11px]">
                    {emp.department}
                  </span>
                </td>
                <td className="py-3 px-4 font-bold text-brand-darkCharcoal">
                  {emp.jobPosition}
                </td>
                <td className="py-3 px-4 text-brand-mutedSlate">
                  {emp.manager}
                </td>
                <td className="py-3 px-4 text-brand-mutedSlate text-[11px]">
                  {emp.workingSchedule}
                </td>
                <td className="py-3 px-4">
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
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEmployee(emp);
                    }}
                    className="text-brand-darkTeal hover:text-brand-teal hover:underline font-bold text-xs inline-flex items-center"
                  >
                    <FileText className="w-3.5 h-3.5 mr-1" /> View Form
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
