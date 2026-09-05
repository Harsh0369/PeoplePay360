import React from 'react';
import { Contract } from '../types';
import { FileText, Calendar, Plus } from 'lucide-react';

interface ContractListProps {
  contracts: Contract[];
  onSelectContract: (cnt: Contract) => void;
  onNewContract: () => void;
}

export const ContractList: React.FC<ContractListProps> = ({
  contracts,
  onSelectContract,
  onNewContract
}) => {
  return (
    <div className="p-4 max-w-7xl mx-auto space-y-4">
      {/* Header Bar */}
      <div className="bg-brand-offWhite p-4 rounded-xl border border-brand-sandBorder shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-brand-darkCharcoal flex items-center">
            <FileText className="w-5 h-5 mr-2 text-brand-darkTeal" />
            Contracts Directory
          </h2>
          <p className="text-xs text-brand-mutedSlate mt-0.5">
            Manage employee employment agreements, wages, structures, and duration terms.
          </p>
        </div>

        <button
          onClick={onNewContract}
          className="bg-brand-darkTeal hover:bg-brand-teal text-brand-offWhite px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center space-x-1"
        >
          <Plus className="w-4 h-4 mr-1" />
          <span>Create Contract</span>
        </button>
      </div>

      {/* Contracts Table */}
      <div className="bg-brand-offWhite rounded-xl border border-brand-sandBorder shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-brand-softSand border-b border-brand-sandBorder text-brand-deepTeal uppercase font-bold text-[11px] tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Contract Ref</th>
              <th className="py-3.5 px-4">Employee</th>
              <th className="py-3.5 px-4">Department</th>
              <th className="py-3.5 px-4">Job Position</th>
              <th className="py-3.5 px-4">Duration</th>
              <th className="py-3.5 px-4">Monthly Wage</th>
              <th className="py-3.5 px-4">Salary Structure</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-sandBorder/60 text-brand-darkCharcoal">
            {contracts.map((cnt) => {
              const isActive = cnt.status === 'ACTIVE';
              return (
                <tr
                  key={cnt.id}
                  onClick={() => onSelectContract(cnt)}
                  className={`hover:bg-brand-hoverRow transition-colors cursor-pointer ${
                    isActive ? 'bg-brand-activeBg/30' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-mono font-bold text-brand-darkCharcoal">
                    <span className="flex items-center text-brand-darkTeal">
                      <FileText className="w-3.5 h-3.5 mr-1.5 text-brand-mutedSlate" />
                      {cnt.contractRef}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-brand-darkCharcoal">
                    {cnt.employeeName}
                  </td>
                  <td className="py-3 px-4 text-brand-mutedSlate">
                    {cnt.department}
                  </td>
                  <td className="py-3 px-4 text-brand-mutedSlate">
                    {cnt.jobPosition}
                  </td>
                  <td className="py-3 px-4 text-brand-mutedSlate font-mono text-[11px]">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1 text-brand-mutedSlate" />
                      {cnt.startDate} → {cnt.endDate || 'Indefinite'}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-brand-darkCharcoal">
                    ${cnt.wage.toLocaleString()} / mo
                  </td>
                  <td className="py-3 px-4 text-brand-mutedSlate text-[11px]">
                    {cnt.salaryStructure}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isActive
                          ? 'bg-brand-activeBg text-brand-activeText border border-brand-teal/30 shadow-sm'
                          : cnt.status === 'DRAFT'
                          ? 'bg-brand-draftBg text-brand-draftText border border-brand-sandBorder'
                          : cnt.status === 'EXPIRED'
                          ? 'bg-slate-200 text-slate-600'
                          : 'bg-brand-warningBg text-brand-warningText border border-brand-coral/30'
                      }`}
                    >
                      {cnt.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectContract(cnt);
                      }}
                      className="text-brand-darkTeal hover:text-brand-teal hover:underline font-bold text-xs"
                    >
                      Edit Contract
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
