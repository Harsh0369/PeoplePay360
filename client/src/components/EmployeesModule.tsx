import React, { useEffect, useState } from 'react';
import {
  Users, FileText, Briefcase, Building2, Mail, Phone,
  LayoutGrid, List as ListIcon, ChevronRight, Zap, X, Loader2, UserPlus, CheckCircle
} from 'lucide-react';
import { inr } from '../lib/format';
import { fetchPaged } from '../lib/paged';
import { useServerList } from '../hooks/usePagedList';
import { useAuth } from '../hooks/useAuth';
import { SearchBar } from './ui/SearchBar';
import { Paginator } from './ui/Paginator';
import { apiService } from '../services/api';

const PAGE_SIZE = 12;

const AVATAR_TONES = ['from-emerald-600 to-teal-400', 'from-teal-600 to-cyan-400', 'from-brand-700 to-emerald-500', 'from-emerald-700 to-lime-500'];
const tone = (s: string) => AVATAR_TONES[(s?.charCodeAt(0) || 0) % AVATAR_TONES.length];
const initials = (n: string) => (n || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
const STATUS_STYLE: Record<string, { badge: string; dot: string; ring: string }> = {
  Active: { badge: 'bg-emerald-100/70 text-emerald-800 border-emerald-300/40', dot: 'bg-emerald-500', ring: 'ring-emerald-500/20' },
  Inactive: { badge: 'bg-amber-100/70 text-amber-800 border-amber-300/40', dot: 'bg-amber-500', ring: 'ring-amber-500/20' },
  Terminated: { badge: 'bg-slate-100 text-slate-600 border-slate-300/40', dot: 'bg-slate-400', ring: 'ring-slate-400/20' },
};
const stStyle = (s: string) => STATUS_STYLE[s] || STATUS_STYLE.Terminated;

const mapRow = (e: any) => ({
  id: e._id || e.id,
  empCode: e.empCode || '—',
  name: e.name || 'Unknown',
  workEmail: e.workEmail || '—',
  workPhone: e.workPhone || '—',
  department: e.departmentId?.name || '—',
  jobPosition: e.jobPositionId?.title || '—',
  status: e.status || 'Active',
  contractCount: e.contractCount ?? 0, attendanceCount: e.attendanceCount ?? 0,
});

interface Props {
  onEditContract: (c: any) => void;
  onGoToContracts: () => void;
  onApproveJoinRequest: (user: any) => void;
  onEditEmployee: (e: any) => void;
  canWrite: boolean;
}

export const EmployeesModule: React.FC<Props> = ({ onEditContract, onGoToContracts, onApproveJoinRequest, onEditEmployee, canWrite }) => {
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterJob, setFilterJob] = useState('');
  const [depts, setDepts] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    import('../services/hrApi').then(({ masterApi }) => {
      masterApi.getDepartments().then(d => setDepts(Array.isArray(d) ? d : [])).catch(() => {});
      masterApi.getJobPositions().then(j => {
        // masterApi.getJobPositions returns paginated data: { data, offsetPagination } or array? 
        // Wait, req unwraps json.data. So it should be an array.
        setJobs(Array.isArray(j) ? j : (j as any)?.data || []);
      }).catch(() => {});
    });
  }, []);

  const extra = [
    filterStatus ? `status=${encodeURIComponent(filterStatus)}` : '',
    filterDept ? `departmentId=${encodeURIComponent(filterDept)}` : '',
    filterJob ? `jobPositionId=${encodeURIComponent(filterJob)}` : '',
  ].filter(Boolean).join('&');

  const emp = useServerList('/employees', { limit: PAGE_SIZE, extra });
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [detail, setDetail] = useState<any | null>(null);
  const [moduleTab, setModuleTab] = useState<'directory' | 'requests'>('directory');
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  const { can } = useAuth();

  // Lightweight aggregates + a small preview (no need to load full lists).
  const [contractsTotal, setContractsTotal] = useState(0);
  const [jobPosTotal, setJobPosTotal] = useState(0);
  const [preview, setPreview] = useState<any[]>([]);

  useEffect(() => {
    if (can('Contract.Read')) {
      fetchPaged('/contracts', { page: 1, limit: 6 })
        .then((r) => { setContractsTotal(r.pagination.totalItems); setPreview(r.items); })
        .catch(() => {});
    }
    if (can('Organization.Read')) {
      fetchPaged('/job-positions', { page: 1, limit: 1 }).then((r) => setJobPosTotal(r.pagination.totalItems)).catch(() => {});
    }
  }, [can]);

  useEffect(() => {
    if (moduleTab === 'requests') {
      setRequestsLoading(true);
      import('../services/hrApi').then(({ masterApi }) => {
        masterApi.getJoinRequests()
          .then((r: any) => setJoinRequests(r.items || []))
          .catch(() => {})
          .finally(() => setRequestsLoading(false));
      });
    }
  }, [moduleTab]);

  const handleDelete = async (e: any, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to fire/delete this employee? This action is permanent.')) {
      try {
        await apiService.deleteEmployee(id);
        emp.reload();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const rows = emp.items.map(mapRow);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* KPI summary bar */}
      <section className="bg-white/90 backdrop-blur rounded-2xl border border-slate-200/90 p-3.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-xs text-slate-700 font-medium">
          <Kpi icon={Users} label="Total Staff" value={`${emp.pagination.totalItems}`} />
          <Divider />
          {can('Contract.Read') && (
            <>
              <Kpi icon={FileText} label="Contracts" value={`${contractsTotal}`} />
              <Divider />
            </>
          )}
          {can('Organization.Read') && (
            <>
              <Kpi icon={Briefcase} label="Job Positions" value={`${jobPosTotal}`} />
            </>
          )}
          <div className="ml-auto flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50/80 px-2.5 py-1 rounded-full border border-amber-200/60 font-medium">
            <Zap className="w-3.5 h-3.5 text-amber-600" fill="currentColor" /><span>Live · server-paginated</span>
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col xl:flex-row xl:items-center justify-between">
        <div className="flex border-b xl:border-b-0 border-slate-200/90 overflow-x-auto">
          <button 
            onClick={() => setModuleTab('directory')}
            className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${moduleTab === 'directory' ? 'border-brand-darkTeal text-brand-darkTeal bg-slate-50/50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/30'}`}
          >
            <Users className="w-4 h-4" /> Directory
          </button>
          {canWrite && (
            <button 
              onClick={() => setModuleTab('requests')}
              className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${moduleTab === 'requests' ? 'border-brand-darkTeal text-brand-darkTeal bg-slate-50/50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/30'}`}
            >
              <UserPlus className="w-4 h-4" /> Join Requests
            </button>
          )}
        </div>
        
        {moduleTab === 'directory' && (
          <div className="p-4 flex items-center gap-3 flex-wrap justify-end">
            <div className="flex items-center gap-2 mr-2">
              <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); emp.setPage(1); }} className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-brand-700 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500">
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Terminated">Terminated</option>
              </select>
              <select value={filterDept} onChange={e => { setFilterDept(e.target.value); emp.setPage(1); }} className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-brand-700 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500">
                <option value="">All Departments</option>
                {depts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
              <select value={filterJob} onChange={e => { setFilterJob(e.target.value); emp.setPage(1); }} className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-brand-700 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 max-w-[150px] truncate">
                <option value="">All Positions</option>
                {jobs.map(j => <option key={j._id} value={j._id}>{j.title}</option>)}
              </select>
            </div>
            <SearchBar value={emp.search} onChange={emp.setSearch} placeholder="Search name or email…" className="w-64" />
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button onClick={() => setView('grid')} className={`p-1.5 rounded-lg transition-all ${view === 'grid' ? 'bg-brand-850 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`} title="Grid"><LayoutGrid className="w-4 h-4" /></button>
              <button onClick={() => setView('list')} className={`p-1.5 rounded-lg transition-all ${view === 'list' ? 'bg-brand-850 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`} title="List"><ListIcon className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </section>

      {/* Cards / list */}
      {moduleTab === 'directory' ? (
        <>
      {emp.loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-16 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-brand-600" /></div>
      ) : emp.error ? (
        <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center text-rose-600 text-sm">{emp.error}</div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-16 text-center text-slate-400">No employees match “{emp.search}”.</div>
      ) : view === 'grid' ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {rows.map((e) => {
            const s = stStyle(e.status);
            return (
              <article key={e.id} onClick={() => setDetail(e)}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-200 p-5 flex flex-col justify-between group cursor-pointer">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="relative">
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-tr ${tone(e.name)} flex items-center justify-center font-bold text-white ring-2 ${s.ring} border border-slate-100 shadow-sm group-hover:scale-105 transition-transform`}>{initials(e.name)}</div>
                      <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ${s.dot} ring-2 ring-white`} />
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${s.badge}`}>{e.status.replace('_', ' ')}</span>
                      <p className="text-[10px] font-mono text-slate-400 mt-1">{e.empCode}</p>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-850 transition-colors leading-snug">{e.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-brand-700 font-medium mt-1"><Briefcase className="w-3.5 h-3.5 flex-shrink-0" /><span className="truncate">{e.jobPosition}</span></div>
                  <hr className="border-slate-100 my-3.5" />
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2.5"><Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" /><span className="font-medium text-slate-700 truncate">{e.department}</span></div>
                    <div className="flex items-center gap-2.5"><Mail className="w-4 h-4 text-slate-400 flex-shrink-0" /><span className="text-slate-500 truncate">{e.workEmail}</span></div>
                    <div className="flex items-center gap-2.5"><Phone className="w-4 h-4 text-slate-400 flex-shrink-0" /><span className="text-slate-500 truncate">{e.workPhone}</span></div>
                  </div>
                  {canWrite && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                      <button onClick={(ev) => handleDelete(ev, e.id)} className="text-rose-600 hover:text-rose-800 text-xs font-bold transition-colors">Fire / Delete</button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200/70">
                <tr><th className="py-3 px-5">Employee</th><th className="py-3 px-5">Department</th><th className="py-3 px-5">Position</th><th className="py-3 px-5">Status</th>{canWrite && <th className="py-3 px-5 text-right">Action</th>}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((e) => {
                  const s = stStyle(e.status);
                  return (
                    <tr key={e.id} onClick={() => setDetail(e)} className="hover:bg-slate-50/60 cursor-pointer">
                      <td className="py-3 px-5"><div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${tone(e.name)} flex items-center justify-center font-bold text-white text-[10px]`}>{initials(e.name)}</div>
                        <div><div className="font-semibold text-slate-900">{e.name}</div><div className="text-slate-400">{e.workEmail}</div></div>
                      </div></td>
                      <td className="py-3 px-5">{e.department}</td>
                      <td className="py-3 px-5">{e.jobPosition}</td>
                      <td className="py-3 px-5"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${s.badge}`}>{e.status.replace('_', ' ')}</span></td>
                      {canWrite && (
                        <td className="py-3 px-5 text-right">
                          <button onClick={(ev) => handleDelete(ev, e.id)} className="text-rose-600 hover:text-rose-800 text-xs font-bold transition-colors">Fire / Delete</button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!emp.loading && rows.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm">
          <Paginator page={emp.page} totalPages={emp.pagination.totalPages} totalItems={emp.pagination.totalItems} pageSize={emp.pagination.pageSize} onPage={emp.setPage} />
        </div>
      )}
      </>
      ) : (
        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-800"><UserPlus className="w-5 h-5" /></div>
              <div><h2 className="text-sm font-bold text-slate-900">Pending Join Requests</h2><p className="text-xs text-slate-500">Approve users to onboard them as employees.</p></div>
            </div>
          </div>
          {requestsLoading ? (
            <div className="p-16 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-brand-600" /></div>
          ) : joinRequests.length === 0 ? (
            <div className="p-16 text-center text-slate-400">No pending join requests.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200/70">
                  <tr><th className="py-3 px-5">Name</th><th className="py-3 px-5">Email</th><th className="py-3 px-5">Date</th><th className="py-3 px-5 text-right">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {joinRequests.map((req) => (
                    <tr key={req._id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-5 font-bold text-slate-900">{req.name}</td>
                      <td className="py-3.5 px-5">{req.email}</td>
                      <td className="py-3.5 px-5">{new Date(req.createdAt).toLocaleDateString()}</td>
                      <td className="py-3.5 px-5 text-right">
                        <button onClick={() => onApproveJoinRequest(req)} className="font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ml-auto">
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Contracts preview */}
      {preview.length > 0 && (
        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-800"><FileText className="w-5 h-5" /></div>
              <div><h2 className="text-sm font-bold text-slate-900">Recent Contracts</h2><p className="text-xs text-slate-500">Latest agreements — open the Contracts tab for the full list.</p></div>
            </div>
            <button onClick={onGoToContracts} className="text-xs font-semibold text-brand-700 hover:text-brand-900 hover:underline flex items-center gap-1"><span>View Full Contracts</span><ChevronRight className="w-3.5 h-3.5" /></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200/70">
                <tr><th className="py-3 px-5">Employee</th><th className="py-3 px-5">Department</th><th className="py-3 px-5">Monthly Wage</th><th className="py-3 px-5 text-center">Status</th><th className="py-3 px-5 text-right">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {preview.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-5 font-bold text-slate-900">{c.employeeId?.name || '—'}</td>
                    <td className="py-3.5 px-5">{c.departmentId?.name || c.employeeId?.departmentId?.name || '—'}</td>
                    <td className="py-3.5 px-5 font-bold text-slate-900">{inr(c.wage)} <span className="text-[10px] font-normal text-slate-400">/ mo</span></td>
                    <td className="py-3.5 px-5 text-center"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">{c.status}</span></td>
                    <td className="py-3.5 px-5 text-right"><button onClick={() => onEditContract({ ...c, id: c._id, employeeName: c.employeeId?.name })} className="font-semibold text-brand-700 hover:text-brand-900">Open</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Read-only employee detail */}
      {detail && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setDetail(null)} />
          <div className="absolute right-0 top-0 h-full w-full sm:max-w-md bg-canvas shadow-2xl flex flex-col">
            <div className="bg-brand-850 text-white p-4 sm:p-6 flex items-start gap-4">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-tr ${tone(detail.name)} flex items-center justify-center text-xl font-bold ring-2 ring-white/20`}>{initials(detail.name)}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold truncate">{detail.name}</h3>
                <p className="text-sm text-emerald-100/80 truncate">{detail.jobPosition}</p>
                <span className={`inline-flex mt-1.5 items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${stStyle(detail.status).badge}`}>{detail.status.replace('_', ' ')}</span>
              </div>
              <button onClick={() => setDetail(null)} className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              <DetailBlock title="Contact & Role">
                <DetailRow icon={Mail} label="Work Email" value={detail.workEmail} />
                <DetailRow icon={Phone} label="Work Phone" value={detail.workPhone} />
                <DetailRow icon={Building2} label="Department" value={detail.department} />
                <DetailRow icon={Briefcase} label="Position" value={detail.jobPosition} />
                <DetailRow icon={FileText} label="Employee Code" value={detail.empCode} />
              </DetailBlock>
              {canWrite && (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      const fullData = emp.items.find((i: any) => i._id === detail.id || i.id === detail.id);
                      if (fullData) onEditEmployee(fullData);
                    }}
                    className="w-full py-2.5 bg-brand-darkTeal text-white font-bold rounded-xl flex items-center justify-center gap-2"
                  >
                    Edit Employee
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailBlock: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-4">
    <h4 className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">{title}</h4>
    <div className="space-y-2.5">{children}</div>
  </div>
);
const DetailRow: React.FC<{ icon: any; label: string; value: string }> = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 text-sm"><Icon className="w-4 h-4 text-slate-400 shrink-0" /><span className="text-slate-500 w-28 shrink-0">{label}</span><span className="font-medium text-slate-800 truncate">{value}</span></div>
);
const Kpi: React.FC<{ icon: any; label: string; value: string; sub?: string; strong?: boolean }> = ({ icon: Icon, label, value, sub, strong }) => (
  <div className="flex items-center gap-2">
    <div className="p-1.5 rounded-lg bg-emerald-50 text-brand-800"><Icon className="w-4 h-4" /></div>
    <span>{label}: <strong className={strong ? 'text-emerald-700 font-bold text-sm' : 'text-slate-900 font-bold'}>{value}</strong> {sub && <span className="text-slate-500 font-normal">{sub}</span>}</span>
  </div>
);
const Divider = () => <div className="h-4 w-px bg-slate-200 hidden sm:block" />;
