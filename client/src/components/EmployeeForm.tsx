import React, { useState } from 'react';
import { Employee, EmployeeStatus, EmployeeType } from '../types';
import { FileText, Clock, CalendarCheck, CheckCircle2, ArrowLeft, Save, X, Building, Mail, Phone, User, Landmark, AlertCircle } from 'lucide-react';

interface EmployeeFormProps {
  employee: Employee | null;
  onSave: (emp: Employee) => void;
  onCancel: () => void;
  onViewRelatedContracts: (employeeId: string) => void;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  employee,
  onSave,
  onCancel,
  onViewRelatedContracts
}) => {
  const [formData, setFormData] = useState<Employee>(
    employee || {
      id: `emp-${Date.now()}`,
      empCode: `EMP${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      workEmail: '',
      workPhone: '',
      jobPosition: '',
      department: 'Engineering',
      manager: 'Michael Scott',
      workingSchedule: 'Standard 40h/week',
      status: 'ACTIVE',
      employeeType: 'FULL_TIME',
      bankAccountNo: '',
      bankName: '',
      ifscCode: '',
      joinDate: new Date().toISOString().split('T')[0],
      contractCount: 1,
      attendanceCount: 0,
      timeOffCount: 0,
      allocationCount: 20
    }
  );

  const [activeTab, setActiveTab] = useState<'WORK' | 'PRIVATE' | 'HR' | 'BANK'>('WORK');

  const handleChange = (field: keyof Employee, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Employee Name is required');
      return;
    }
    onSave(formData);
  };

  const isBankMissing = !formData.bankAccountNo.trim();

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Top Header & Breadcrumb Bar */}
      <div className="flex items-center justify-between mb-4 bg-brand-offWhite p-3.5 rounded-xl border border-brand-sandBorder shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-brand-softSand text-brand-deepTeal transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-brand-darkTeal" />
          </button>
          <div>
            <span className="text-xs text-brand-darkTeal font-bold uppercase tracking-wider block">
              Employees / {formData.empCode || 'New'}
            </span>
            <h2 className="text-lg font-bold text-brand-darkCharcoal leading-tight">
              {formData.name || 'New Employee Form'}
            </h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSubmit}
            className="bg-brand-darkTeal hover:bg-brand-teal text-brand-offWhite px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Record</span>
          </button>
          <button
            onClick={onCancel}
            className="bg-brand-softSand text-brand-deepTeal hover:bg-brand-sandBorder px-3.5 py-2 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors border border-brand-sandBorder"
          >
            <X className="w-4 h-4" />
            <span>Discard</span>
          </button>
        </div>
      </div>

      {/* Main Odoo Sheet Container */}
      <div className="bg-brand-offWhite rounded-xl border border-brand-sandBorder shadow-sm p-6">
        {/* Header Smart Buttons & Stage Ribbon Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-brand-sandBorder">
          {/* Smart Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => onViewRelatedContracts(formData.id)}
              className="smart-button group hover:border-brand-darkTeal hover:bg-brand-softSand transition-all"
              title="Click to view and filter contracts for this employee"
            >
              <div className="flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-brand-darkTeal" />
                <span className="font-bold text-sm text-brand-darkCharcoal group-hover:text-brand-darkTeal">
                  {formData.contractCount}
                </span>
              </div>
              <span className="text-[10px] text-brand-mutedSlate font-medium mt-0.5">Contracts</span>
            </button>

            <button
              type="button"
              className="smart-button group opacity-90 cursor-default"
            >
              <div className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-brand-teal" />
                <span className="font-bold text-sm text-brand-darkCharcoal">
                  {formData.attendanceCount}d
                </span>
              </div>
              <span className="text-[10px] text-brand-mutedSlate font-medium mt-0.5">Attendance</span>
            </button>

            <button
              type="button"
              className="smart-button group opacity-90 cursor-default"
            >
              <div className="flex items-center space-x-1.5">
                <CalendarCheck className="w-4 h-4 text-brand-goldenAmber" />
                <span className="font-bold text-sm text-brand-darkCharcoal">
                  {formData.timeOffCount}
                </span>
              </div>
              <span className="text-[10px] text-brand-mutedSlate font-medium mt-0.5">Time Off</span>
            </button>

            <button
              type="button"
              className="smart-button group opacity-90 cursor-default"
            >
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-sageGreen" />
                <span className="font-bold text-sm text-brand-darkCharcoal">
                  {formData.allocationCount}d
                </span>
              </div>
              <span className="text-[10px] text-brand-mutedSlate font-medium mt-0.5">Allocations</span>
            </button>
          </div>

          {/* Stage Ribbon */}
          <div className="flex items-center border border-brand-sandBorder rounded-lg overflow-hidden divide-x divide-brand-sandBorder shadow-sm">
            {(['ACTIVE', 'ON_LEAVE', 'INACTIVE'] as EmployeeStatus[]).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => handleChange('status', st)}
                className={`px-3.5 py-1.5 text-xs font-bold uppercase transition-all ${
                  formData.status === st
                    ? 'bg-brand-darkTeal text-brand-offWhite shadow-inner'
                    : 'bg-brand-softSand text-brand-mutedSlate hover:bg-brand-sandBorder'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Missing Bank Info Alert Banner */}
        {isBankMissing && (
          <div className="mt-4 p-3 bg-brand-warningBg border border-brand-coral/40 rounded-lg flex items-center space-x-2 text-xs text-brand-warningText font-medium">
            <AlertCircle className="w-4 h-4 text-brand-coral flex-shrink-0" />
            <span>
              <strong>Payroll Warning:</strong> Bank Account details are missing. Payroll processing requires valid bank details for payslip generation.
            </span>
          </div>
        )}

        {/* Primary Employee Identity Block */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-brand-sandBorder/60">
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-deepTeal mb-1">
                Employee Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-3.5 py-2 border border-brand-sandBorder bg-white rounded-lg text-sm font-bold text-brand-darkCharcoal focus:outline-none focus:ring-2 focus:ring-brand-darkTeal"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-darkCharcoal mb-1">
                  Job Position
                </label>
                <input
                  type="text"
                  value={formData.jobPosition}
                  onChange={(e) => handleChange('jobPosition', e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full px-3 py-1.5 border border-brand-sandBorder bg-white rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-darkTeal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-darkCharcoal mb-1">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  className="w-full px-3 py-1.5 border border-brand-sandBorder rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-darkTeal bg-white"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Finance & Payroll">Finance & Payroll</option>
                  <option value="Product & Design">Product & Design</option>
                  <option value="Sales & Marketing">Sales & Marketing</option>
                </select>
              </div>
            </div>
          </div>

          {/* Avatar Box */}
          <div className="flex flex-col items-center justify-center p-4 border border-dashed border-brand-sandBorder rounded-xl bg-brand-softSand/60">
            <img
              src={formData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt="Avatar preview"
              className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md mb-2"
            />
            <span className="text-[11px] text-brand-deepTeal font-bold">Employee Avatar</span>
          </div>
        </div>

        {/* Tabbed Form Notebook Navigation */}
        <div className="mt-4">
          <div className="flex border-b border-brand-sandBorder space-x-4">
            <button
              type="button"
              onClick={() => setActiveTab('WORK')}
              className={`py-2.5 px-3.5 text-xs font-bold border-b-2 transition-colors flex items-center space-x-1.5 ${
                activeTab === 'WORK'
                  ? 'border-brand-darkTeal text-brand-darkTeal'
                  : 'border-transparent text-brand-mutedSlate hover:text-brand-darkCharcoal'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Work Information</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('BANK')}
              className={`py-2.5 px-3.5 text-xs font-bold border-b-2 transition-colors flex items-center space-x-1.5 ${
                activeTab === 'BANK'
                  ? 'border-brand-darkTeal text-brand-darkTeal'
                  : 'border-transparent text-brand-mutedSlate hover:text-brand-darkCharcoal'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Bank Account Details</span>
              {isBankMissing && <span className="w-2 h-2 rounded-full bg-brand-coral inline-block ml-1"></span>}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('HR')}
              className={`py-2.5 px-3.5 text-xs font-bold border-b-2 transition-colors flex items-center space-x-1.5 ${
                activeTab === 'HR'
                  ? 'border-brand-darkTeal text-brand-darkTeal'
                  : 'border-transparent text-brand-mutedSlate hover:text-brand-darkCharcoal'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>HR Settings & Schedule</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="py-6">
            {activeTab === 'WORK' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-mutedSlate border-b border-brand-sandBorder pb-1">
                    Contact Details
                  </h4>

                  <div>
                    <label className="block text-xs font-semibold text-brand-darkCharcoal mb-1">
                      Work Email
                    </label>
                    <div className="flex items-center border border-brand-sandBorder rounded-lg px-3 bg-white focus-within:ring-1 focus-within:ring-brand-darkTeal">
                      <Mail className="w-3.5 h-3.5 text-brand-mutedSlate mr-2" />
                      <input
                        type="email"
                        value={formData.workEmail}
                        onChange={(e) => handleChange('workEmail', e.target.value)}
                        placeholder="sarah.jenkins@company.com"
                        className="w-full py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-darkCharcoal mb-1">
                      Work Phone
                    </label>
                    <div className="flex items-center border border-brand-sandBorder rounded-lg px-3 bg-white focus-within:ring-1 focus-within:ring-brand-darkTeal">
                      <Phone className="w-3.5 h-3.5 text-brand-mutedSlate mr-2" />
                      <input
                        type="text"
                        value={formData.workPhone}
                        onChange={(e) => handleChange('workPhone', e.target.value)}
                        placeholder="+1 (555) 019-2834"
                        className="w-full py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-mutedSlate border-b border-brand-sandBorder pb-1">
                    Position & Hierarchy
                  </h4>

                  <div>
                    <label className="block text-xs font-semibold text-brand-darkCharcoal mb-1">
                      Manager
                    </label>
                    <input
                      type="text"
                      value={formData.manager}
                      onChange={(e) => handleChange('manager', e.target.value)}
                      className="w-full px-3 py-1.5 border border-brand-sandBorder bg-white rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-darkTeal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-darkCharcoal mb-1">
                      Working Schedule
                    </label>
                    <select
                      value={formData.workingSchedule}
                      onChange={(e) => handleChange('workingSchedule', e.target.value)}
                      className="w-full px-3 py-1.5 border border-brand-sandBorder rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-darkTeal bg-white"
                    >
                      <option value="Standard 40h/week">Standard 40h/week (Mon-Fri 9-5)</option>
                      <option value="Flexible Shift 35h">Flexible Shift 35h</option>
                      <option value="Part-Time 20h">Part-Time 20h/week</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'BANK' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-brand-darkCharcoal mb-1">
                    Bank Account Number *
                  </label>
                  <input
                    type="text"
                    value={formData.bankAccountNo}
                    onChange={(e) => handleChange('bankAccountNo', e.target.value)}
                    placeholder="987654321045"
                    className="w-full px-3 py-1.5 border border-brand-sandBorder bg-white rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-brand-darkTeal"
                  />
                  <p className="text-[10px] text-brand-mutedSlate mt-1">Required for payrun payslip validation.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-darkCharcoal mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => handleChange('bankName', e.target.value)}
                    placeholder="JPMorgan Chase Bank"
                    className="w-full px-3 py-1.5 border border-brand-sandBorder bg-white rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-darkTeal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-darkCharcoal mb-1">
                    IFSC / Routing Code
                  </label>
                  <input
                    type="text"
                    value={formData.ifscCode}
                    onChange={(e) => handleChange('ifscCode', e.target.value)}
                    placeholder="CHASUS33XXX"
                    className="w-full px-3 py-1.5 border border-brand-sandBorder bg-white rounded-lg text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-brand-darkTeal"
                  />
                </div>
              </div>
            )}

            {activeTab === 'HR' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-brand-darkCharcoal mb-1">
                    Employment Type
                  </label>
                  <select
                    value={formData.employeeType}
                    onChange={(e) => handleChange('employeeType', e.target.value as EmployeeType)}
                    className="w-full px-3 py-1.5 border border-brand-sandBorder rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-darkTeal bg-white"
                  >
                    <option value="FULL_TIME">Full-Time Staff</option>
                    <option value="PART_TIME">Part-Time Staff</option>
                    <option value="CONTRACT">Contractor</option>
                    <option value="INTERN">Intern</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-darkCharcoal mb-1">
                    Join Date
                  </label>
                  <input
                    type="date"
                    value={formData.joinDate}
                    onChange={(e) => handleChange('joinDate', e.target.value)}
                    className="w-full px-3 py-1.5 border border-brand-sandBorder bg-white rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-darkTeal"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
