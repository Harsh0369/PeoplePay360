import React, { useState } from 'react';
import { Contract, ContractStatus, Employee } from '../types';
import { ArrowLeft, Save, X, FileText, AlertTriangle } from 'lucide-react';

interface ContractFormProps {
  contract: Contract | null;
  employees: Employee[];
  allContracts: Contract[];
  onSave: (cnt: Contract) => void;
  onCancel: () => void;
}

export const ContractForm: React.FC<ContractFormProps> = ({
  contract,
  employees,
  allContracts,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<Contract>(
    contract || {
      id: `cnt-${Date.now()}`,
      contractRef: `CNT/2026/${Math.floor(100 + Math.random() * 900)}`,
      employeeId: employees[0]?.id || '',
      employeeName: employees[0]?.name || '',
      department: employees[0]?.department || 'Engineering',
      jobPosition: employees[0]?.jobPosition || 'Software Engineer',
      startDate: new Date().toISOString().split('T')[0],
      endDate: null,
      wage: 6500,
      salaryStructure: 'Regular Salary Structure',
      status: 'ACTIVE',
      terms: 'Standard employment agreement terms and conditions.'
    }
  );

  const handleChange = (field: keyof Contract, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'employeeId') {
        const emp = employees.find((e) => e.id === value);
        if (emp) {
          updated.employeeName = emp.name;
          updated.department = emp.department;
          updated.jobPosition = emp.jobPosition;
        }
      }
      return updated;
    });
  };

  // Business Logic Warning check: Check if employee already has another active contract
  const hasConcurrentActiveContract =
    formData.status === 'ACTIVE' &&
    allContracts.some(
      (c) =>
        c.employeeId === formData.employeeId &&
        c.id !== formData.id &&
        c.status === 'ACTIVE'
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId) {
      alert('Please select an employee');
      return;
    }
    if (formData.wage <= 0) {
      alert('Wage must be a positive number');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      {/* Top Breadcrumb & Header Bar */}
      <div className="flex items-center justify-between mb-4 bg-brand-offWhite p-4 rounded-xl border border-brand-sandBorder shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-brand-softSand text-brand-deepTeal transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-brand-darkTeal" />
          </button>
          <div>
            <span className="text-xs text-brand-darkTeal font-bold uppercase tracking-wider block">
              Contracts / {formData.contractRef}
            </span>
            <h2 className="text-lg font-bold text-brand-darkCharcoal leading-tight">
              {formData.employeeName || 'New Contract Form'}
            </h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSubmit}
            className="bg-brand-darkTeal hover:bg-brand-teal text-brand-offWhite px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Contract</span>
          </button>
          <button
            onClick={onCancel}
            className="bg-brand-softSand text-brand-deepTeal hover:bg-brand-sandBorder px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors border border-brand-sandBorder"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        </div>
      </div>

      {/* Main Odoo Sheet Container */}
      <div className="bg-brand-offWhite rounded-xl border border-brand-sandBorder shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Stage Progress Stepper Bar (Draft -> Active -> Expired -> Cancelled) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-sandBorder pb-5">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-brand-darkTeal" />
            <span className="font-extrabold text-brand-darkCharcoal text-sm font-mono">{formData.contractRef}</span>
          </div>

          <div className="flex items-center border border-brand-sandBorder rounded-lg overflow-hidden divide-x divide-brand-sandBorder shadow-sm">
            {(['DRAFT', 'ACTIVE', 'EXPIRED', 'CANCELLED'] as ContractStatus[]).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => handleChange('status', st)}
                className={`px-4 py-2 text-xs font-bold uppercase transition-all ${
                  formData.status === st
                    ? 'bg-brand-darkTeal text-brand-offWhite shadow-inner'
                    : 'bg-brand-softSand text-brand-mutedSlate hover:bg-brand-sandBorder'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Overlapping Active Contract Business Warning Banner */}
        {hasConcurrentActiveContract && (
          <div className="bg-brand-warningBg border border-brand-coral/40 text-brand-warningText rounded-xl p-3.5 text-xs flex items-start space-x-2.5 shadow-sm">
            <AlertTriangle className="w-4 h-4 text-brand-coral flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Payroll Rule Warning:</strong> {formData.employeeName} currently has another active contract. The system will automatically select the single applicable contract matching the payroll period date range.
            </div>
          </div>
        )}

        {/* Primary Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-darkCharcoal mb-1">
                Contract Reference *
              </label>
              <input
                type="text"
                value={formData.contractRef}
                onChange={(e) => handleChange('contractRef', e.target.value)}
                className="w-full px-3.5 py-2 border border-brand-sandBorder bg-white rounded-lg text-xs font-mono font-bold text-brand-darkCharcoal focus:outline-none focus:ring-1 focus:ring-brand-darkTeal"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-darkCharcoal mb-1">
                Employee *
              </label>
              <select
                value={formData.employeeId}
                onChange={(e) => handleChange('employeeId', e.target.value)}
                className="w-full px-3.5 py-2 border border-brand-sandBorder rounded-lg text-xs font-bold text-brand-darkCharcoal focus:outline-none focus:ring-1 focus:ring-brand-darkTeal bg-white"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.empCode}) — {emp.department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-darkCharcoal mb-1">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                readOnly
                className="w-full px-3.5 py-2 border border-brand-sandBorder bg-brand-softSand/60 text-brand-mutedSlate rounded-lg text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-darkCharcoal mb-1">
                Job Position
              </label>
              <input
                type="text"
                value={formData.jobPosition}
                readOnly
                className="w-full px-3.5 py-2 border border-brand-sandBorder bg-brand-softSand/60 text-brand-mutedSlate rounded-lg text-xs font-medium"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-darkCharcoal mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className="w-full px-3.5 py-2 border border-brand-sandBorder bg-white rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-darkTeal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-darkCharcoal mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => handleChange('endDate', e.target.value || null)}
                  placeholder="Leave empty for indefinite"
                  className="w-full px-3.5 py-2 border border-brand-sandBorder bg-white rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-darkTeal"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-darkCharcoal mb-1">
                Monthly Wage (Base Salary) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-brand-mutedSlate">$</span>
                <input
                  type="number"
                  value={formData.wage}
                  onChange={(e) => handleChange('wage', Number(e.target.value))}
                  placeholder="6500"
                  className="w-full pl-8 pr-3.5 py-2 border border-brand-sandBorder bg-white rounded-lg text-xs font-bold text-brand-darkCharcoal focus:outline-none focus:ring-1 focus:ring-brand-darkTeal"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-darkCharcoal mb-1">
                Salary Structure *
              </label>
              <select
                value={formData.salaryStructure}
                onChange={(e) => handleChange('salaryStructure', e.target.value)}
                className="w-full px-3.5 py-2 border border-brand-sandBorder rounded-lg text-xs font-semibold text-brand-darkCharcoal focus:outline-none focus:ring-1 focus:ring-brand-darkTeal bg-white"
              >
                <option value="Regular Salary Structure">Regular Salary Structure (Basic + HRA + TA - Deductions)</option>
                <option value="Executive Structure">Executive Structure (High Base + Allowances)</option>
                <option value="Contractor Fixed Structure">Contractor Fixed Structure</option>
              </select>
            </div>
          </div>
        </div>

        {/* Terms & Details Box */}
        <div>
          <label className="block text-xs font-semibold text-brand-darkCharcoal mb-1">
            Employment Terms & Notes
          </label>
          <textarea
            rows={3}
            value={formData.terms || ''}
            onChange={(e) => handleChange('terms', e.target.value)}
            placeholder="Add employment contract terms or notes..."
            className="w-full px-3.5 py-2 border border-brand-sandBorder bg-white rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-darkTeal"
          />
        </div>

      </div>
    </div>
  );
};
