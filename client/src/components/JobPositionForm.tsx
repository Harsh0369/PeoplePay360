import React, { useState } from 'react';
import { Briefcase, Building2, DollarSign, X, AlertCircle } from 'lucide-react';
import { Department, JobPosition } from '../types';

interface JobPositionFormProps {
  jobPosition?: JobPosition | null;
  departments: Department[];
  onSave: (data: any) => void;
  onCancel: () => void;
}

export const JobPositionForm: React.FC<JobPositionFormProps> = ({
  jobPosition,
  departments,
  onSave,
  onCancel
}) => {
  const [title, setTitle] = useState(jobPosition?.title || '');
  const initialDeptId = typeof jobPosition?.departmentId === 'object' 
    ? (jobPosition?.departmentId as any).id || (jobPosition?.departmentId as any)._id
    : jobPosition?.departmentId;
  const [departmentId, setDepartmentId] = useState<string>(initialDeptId || departments[0]?.id || departments[0]?._id || '');
  const [expectedSalary, setExpectedSalary] = useState<number>(jobPosition?.expectedSalary || 6500);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Job Position Title is required.');
      return;
    }

    onSave({
      title: title.trim(),
      departmentId,
      expectedSalary: Number(expectedSalary) || 0
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-brand-offWhite w-full max-w-lg rounded-2xl shadow-2xl border border-brand-teal/20 overflow-hidden animate-fadeIn">
        
        {/* Modal Header */}
        <div className="bg-brand-deepTeal text-brand-offWhite px-6 py-4 flex items-center justify-between border-b border-brand-darkTeal">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-brand-darkTeal flex items-center justify-center border border-brand-teal/30">
              <Briefcase className="w-5 h-5 text-brand-teal" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">{jobPosition ? 'Edit' : 'Create'} Job Position</h2>
              <p className="text-xs text-[#A7C8C2]">Define job role & salary benchmarks</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-brand-offWhite/70 hover:text-white hover:bg-brand-darkTeal transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-brand-charcoal uppercase tracking-wider mb-1.5">
              Job Position Title <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-brand-teal/60 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. Lead Frontend Architect, HR Operations Lead"
                className="w-full pl-9 pr-3 py-2.5 bg-white text-sm border border-brand-teal/30 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-brand-teal outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-charcoal uppercase tracking-wider mb-1.5">
              Parent Department
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-brand-teal/60 absolute left-3 top-3" />
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-white text-sm border border-brand-teal/30 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-brand-teal outline-none transition-all"
              >
                {departments.map((dept) => (
                  <option key={dept.id || dept._id} value={dept.id || dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-charcoal uppercase tracking-wider mb-1.5">
              Expected Base Monthly Target Salary (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-bold text-brand-teal/70">₹</span>
              <input
                type="number"
                min="0"
                step="100"
                value={expectedSalary}
                onChange={(e) => setExpectedSalary(Number(e.target.value))}
                placeholder="50000"
                className="w-full pl-9 pr-3 py-2.5 bg-white text-sm border border-brand-teal/30 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-brand-teal outline-none transition-all font-semibold"
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Used as a benchmark for wage recommendations when generating contracts.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-brand-softSand">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-bold text-brand-charcoal bg-brand-softSand hover:bg-brand-softSand/80 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-brand-teal hover:bg-brand-darkTeal rounded-xl shadow-md transition-all flex items-center space-x-1.5"
            >
              <Briefcase className="w-4 h-4" />
              <span>{jobPosition ? 'Save Changes' : 'Create Position'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
