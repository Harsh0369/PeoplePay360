import React from 'react';
import { Loader2 } from 'lucide-react';
import { Contract } from '../types';
import { ContractList } from './ContractList';
import { SearchBar } from './ui/SearchBar';
import { Paginator } from './ui/Paginator';
import { useServerList } from '../hooks/usePagedList';

const STATUS: Record<string, string> = { RUNNING: 'ACTIVE', DRAFT: 'DRAFT', EXPIRED: 'EXPIRED', CANCELLED: 'CANCELLED' };
const mapStatus = (s: any) => STATUS[String(s || 'DRAFT').toUpperCase()] || String(s || 'DRAFT').toUpperCase();
const fmt = (d?: string) => (d ? new Date(d).toISOString().split('T')[0] : '');

// Maps a raw backend contract to the flat shape ContractList renders.
const mapContract = (c: any) => ({
  id: c._id,
  contractRef: c.contractRef || `CNT-${String(c._id || '').slice(-4).toUpperCase()}`,
  employeeId: c.employeeId?._id || c.employeeId || '',
  employeeName: c.employeeId?.name || '—',
  department: c.departmentId?.name || c.employeeId?.departmentId?.name || '—',
  jobPosition: c.jobPositionId?.title || '—',
  startDate: fmt(c.startDate),
  endDate: c.endDate ? fmt(c.endDate) : null,
  wage: c.wage ?? 0,
  salaryStructure: c.salaryStructureId?.name || '—',
  status: mapStatus(c.status),
  terms: c.terms || '',
});

interface Props {
  canWrite: boolean;
  onSelectContract: (c: any) => void;
  onNewContract: () => void;
}

export const ContractsModule: React.FC<Props> = ({ canWrite, onSelectContract, onNewContract }) => {
  const { items, pagination, page, setPage, search, setSearch, loading, error } = useServerList('/contracts', { limit: 15 });
  const rows = items.map(mapContract) as unknown as Contract[];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-end">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by employee name…" className="w-72" />
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-brand-600" /></div>
      ) : error ? (
        <div className="bg-white rounded-xl border border-rose-200 p-8 text-center text-rose-600 text-sm">{error}</div>
      ) : (
        <>
          <ContractList contracts={rows} canWrite={canWrite} onSelectContract={onSelectContract} onNewContract={onNewContract} />
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm">
            <Paginator page={page} totalPages={pagination.totalPages} totalItems={pagination.totalItems} pageSize={pagination.pageSize} onPage={setPage} />
          </div>
        </>
      )}
    </div>
  );
};
