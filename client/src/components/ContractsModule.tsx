import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Contract } from '../types';
import { ContractList } from './ContractList';
import { SearchBar } from './ui/SearchBar';
import { Paginator } from './ui/Paginator';
import { useServerList } from '../hooks/usePagedList';
import { masterApi } from '../services/hrApi';

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
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [depts, setDepts] = useState<any[]>([]);

  useEffect(() => {
    masterApi.getDepartments().then(d => setDepts(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const extra = [
    filterStatus ? `status=${encodeURIComponent(filterStatus)}` : '',
    filterDept ? `departmentId=${encodeURIComponent(filterDept)}` : ''
  ].filter(Boolean).join('&');

  const { items, pagination, page, setPage, search, setSearch, loading, error } = useServerList('/contracts', { limit: 15, extra });
  const rows = items.map(mapContract) as unknown as Contract[];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="px-3 py-2 border border-slate-200 rounded-md text-sm text-brand-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value="">All Statuses</option>
            <option value="Running">Running</option>
            <option value="Draft">Draft</option>
            <option value="Expired">Expired</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <select value={filterDept} onChange={e => { setFilterDept(e.target.value); setPage(1); }} className="px-3 py-2 border border-slate-200 rounded-md text-sm text-brand-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value="">All Departments</option>
            {depts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by employee name…" className="w-full sm:w-72" />
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
