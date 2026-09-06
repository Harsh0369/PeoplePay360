import React, { useState } from 'react';
import { Briefcase, Building2, Search, Plus, UserPlus, CheckCircle, Users, X, DollarSign } from 'lucide-react';
import { Paginator } from './ui/Paginator';
import { JobPosition, Department, Employee } from '../types';

interface JobPositionListProps {
  jobPositions: JobPosition[];
  departments: Department[];
  employees: Employee[];
  onOpenCreateForm: () => void;
  onEdit: (pos: JobPosition) => void;
  onDelete: (id: string) => void;
  onAssignEmployee: (employeeId: string, jobPositionId: string) => void;
  canWrite?: boolean;
}

export const JobPositionList: React.FC<JobPositionListProps> = ({
  jobPositions,
  departments,
  employees,
  onOpenCreateForm,
  onEdit,
  onDelete,
  onAssignEmployee,
  canWrite = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  
  // Assignment Modal State
  const [assigningPosition, setAssigningPosition] = useState<JobPosition | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [page, setPage] = useState(1);
  const PAGE = 12;

  // Filtered Job Positions
  const filteredPositions = jobPositions.filter((pos) => {
    const matchesSearch = pos.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    let deptName = 'General';
    if (typeof pos.departmentId === 'object' && pos.departmentId) {
      deptName = pos.departmentId.name;
    } else if (pos.departmentName) {
      deptName = pos.departmentName;
    } else if (pos.departmentId) {
      const match = departments.find((d) => d.id === pos.departmentId || d._id === pos.departmentId);
      if (match) deptName = match.name;
    }

    const matchesDept = selectedDepartment === 'ALL' || deptName === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  const getDepartmentName = (pos: JobPosition) => {
    if (typeof pos.departmentId === 'object' && pos.departmentId) {
      return pos.departmentId.name;
    }
    if (pos.departmentName) return pos.departmentName;
    const match = departments.find((d) => d.id === pos.departmentId || d._id === pos.departmentId);
    return match ? match.name : 'Engineering';
  };

  const getEmployeeCount = (posTitle: string) => {
    return employees.filter((e) => e.jobPosition?.toLowerCase() === posTitle.toLowerCase()).length;
  };

  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningPosition || !selectedEmployeeId) return;
    onAssignEmployee(selectedEmployeeId, assigningPosition.id || assigningPosition._id || '');
    setAssigningPosition(null);
    setSelectedEmployeeId('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action & Search Bar */}
      <div className="bg-brand-offWhite p-4 rounded-2xl border border-brand-teal/20 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-brand-teal/60 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search job position title..."
            className="w-full pl-9 pr-4 py-2 bg-white text-xs border border-brand-teal/30 rounded-xl focus:ring-2 focus:ring-brand-teal outline-none transition-all"
          />
        </div>

        {/* Department Filter & Create Button */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <div className="relative">
            <Building2 className="w-4 h-4 text-brand-teal/60 absolute left-3 top-2.5" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="pl-9 pr-3 py-2 bg-white text-xs font-semibold border border-brand-teal/30 rounded-xl focus:ring-2 focus:ring-brand-teal outline-none transition-all"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id || dept._id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {canWrite && (
            <button
              onClick={onOpenCreateForm}
              className="flex items-center space-x-1.5 px-4 py-2 bg-brand-teal hover:bg-brand-darkTeal text-white text-xs font-bold rounded-xl shadow-md transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Job Position</span>
            </button>
          )}
        </div>
      </div>

      {/* Job Positions Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPositions.slice((page - 1) * PAGE, page * PAGE).map((pos) => {
          const deptName = getDepartmentName(pos);
          const activeStaffCount = getEmployeeCount(pos.title);

          return (
            <div
              key={pos.id || pos._id}
              className="bg-brand-offWhite rounded-2xl border border-brand-teal/20 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header Title & Status */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-softSand flex items-center justify-center border border-brand-teal/20 text-brand-deepTeal group-hover:bg-brand-teal group-hover:text-white transition-colors">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-brand-charcoal group-hover:text-brand-deepTeal transition-colors">
                        {pos.title}
                      </h3>
                      <span className="text-[11px] font-semibold text-brand-teal bg-brand-teal/10 px-2 py-0.5 rounded-md inline-block mt-0.5">
                        {deptName}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Active</span>
                  </span>
                </div>

                {/* Benchmark Salary & Active Staff Stats */}
                <div className="mt-4 pt-3 border-t border-brand-softSand grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/80 p-2.5 rounded-xl border border-brand-teal/10">
                    <span className="text-[10px] text-gray-500 font-semibold block uppercase">Target Salary</span>
                    <span className="font-extrabold text-brand-deepTeal text-sm flex items-center mt-0.5">
                      ₹{pos.expectedSalary ? pos.expectedSalary.toLocaleString('en-IN') : '0'}/mo
                    </span>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-xl border border-brand-teal/10">
                    <span className="text-[10px] text-gray-500 font-semibold block uppercase">Assigned Staff</span>
                    <span className="font-extrabold text-brand-charcoal text-sm flex items-center mt-0.5">
                      <Users className="w-3.5 h-3.5 text-brand-teal mr-1" />
                      {activeStaffCount} Employee{activeStaffCount === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-brand-softSand flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-medium">
                  Created {pos.createdAt || '—'}
                </span>

                {canWrite && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(pos)}
                      className="px-2 py-1.5 text-xs font-bold text-brand-charcoal hover:bg-brand-teal hover:text-white rounded-lg transition-all"
                      title="Edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(pos.id || pos._id || '')}
                      className="px-2 py-1.5 text-xs font-bold text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                      title="Delete"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => {
                        setAssigningPosition(pos);
                        setSelectedEmployeeId(employees[0]?.id || '');
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-brand-deepTeal bg-brand-softSand hover:bg-brand-teal hover:text-white rounded-lg transition-all flex items-center space-x-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Assign Employee</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredPositions.length > PAGE && (
        <div className="bg-brand-offWhite rounded-2xl border border-brand-sandBorder">
          <Paginator page={Math.min(page, Math.max(1, Math.ceil(filteredPositions.length / PAGE)))} totalPages={Math.max(1, Math.ceil(filteredPositions.length / PAGE))} totalItems={filteredPositions.length} pageSize={PAGE} onPage={setPage} />
        </div>
      )}

      {filteredPositions.length === 0 && (
        <div className="bg-brand-offWhite p-12 rounded-2xl border border-dashed border-brand-teal/30 text-center">
          <Briefcase className="w-10 h-10 text-brand-teal/40 mx-auto mb-2" />
          <h3 className="font-bold text-brand-charcoal text-sm">No Job Positions Found</h3>
          <p className="text-xs text-gray-500 mt-1">Try refining your search or add a new job position.</p>
        </div>
      )}

      {/* Assign Employee Modal */}
      {assigningPosition && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-offWhite w-full max-w-md rounded-2xl shadow-2xl border border-brand-teal/20 overflow-hidden animate-fadeIn">
            <div className="bg-brand-deepTeal text-brand-offWhite px-5 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-brand-teal" />
                <h3 className="font-bold text-sm">Assign Staff to {assigningPosition.title}</h3>
              </div>
              <button onClick={() => setAssigningPosition(null)} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAssignment} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">Select Employee</label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full p-2.5 bg-white text-xs border border-brand-teal/30 rounded-xl focus:ring-2 focus:ring-brand-teal outline-none font-medium"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.empCode}) — Current: {emp.jobPosition}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setAssigningPosition(null)}
                  className="px-3 py-1.5 text-xs font-bold bg-brand-softSand rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-brand-teal hover:bg-brand-darkTeal rounded-xl shadow"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
