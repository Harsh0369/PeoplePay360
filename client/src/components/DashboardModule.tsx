import React, { useEffect, useState } from 'react';
import { Users, Building2, CalendarCheck, Clock, Wallet, FileText, Activity, Download, X, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { apiService } from '../services/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { downloadCSV } from '../lib/csv';

const ReportModal: React.FC<{ title: string; onClose: () => void; fetcher: () => Promise<any[]> }> = ({ title, onClose, fetcher }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetcher().then((res) => {
      if (mounted) {
        setData(res);
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [fetcher]);

  const handleExport = () => {
    if (data.length > 0) downloadCSV(title, data);
  };

  const keys = data.length > 0 ? Object.keys(data[0]).filter(k => k !== 'id' && k !== '_id' && !k.endsWith('Id')) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-brand-900 border border-brand-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 flex items-center justify-between bg-brand-900/50 gap-3">
          <h2 className="text-base sm:text-xl font-bold text-white truncate">{title} Detailed Report</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              disabled={loading || data.length === 0}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-[#0f172a]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              <p className="text-sm text-emerald-200/50">Loading detailed data...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <FileText className="w-8 h-8 text-slate-500/50" />
              <p className="text-sm text-slate-400">No data available for this report.</p>
            </div>
          ) : (
            <div className="border border-white/5 rounded-xl overflow-hidden bg-brand-900/30">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-brand-800/50">
                      {keys.map((k) => (
                        <th key={k} className="px-4 py-3 text-xs font-semibold text-emerald-200/70 uppercase tracking-wider whitespace-nowrap border-b border-white/5">
                          {k.replace(/([A-Z])/g, ' $1').trim()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {data.map((row, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                        {keys.map((k) => (
                          <td key={k} className="px-4 py-3 text-sm text-slate-300 whitespace-nowrap">
                            {String(row[k] ?? '—')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const DashboardModule: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeReport, setActiveReport] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    apiService.getDashboardStats()
      .then((data) => {
        if (mounted) {
          setStats(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-emerald-200/60 font-medium">Loading metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <Activity className="w-5 h-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6'];

  const deptData = stats?.departmentBreakdown?.map((d: any) => ({ 
    name: d.departmentName.length > 15 ? d.departmentName.substring(0, 15) + '...' : d.departmentName, 
    value: d.count 
  })) || [];
  const typeData = stats?.employeeTypeBreakdown?.map((d: any) => ({ name: d.type.replace('_', ' '), value: d.count })) || [];
  const contractData = stats?.contractStatusBreakdown?.map((d: any) => ({ name: d.status, value: d.count })) || [];

  const handleCardClick = (report: string) => {
    setActiveReport(report);
  };

  const getReportFetcher = () => {
    switch (activeReport) {
      case 'Headcount': return async () => {
        const emps = await apiService.getEmployees();
        return emps.filter(e => e.status === 'ACTIVE').map(e => ({
          Name: e.name, Code: e.empCode, Email: e.workEmail, Position: e.jobPosition, Department: e.department, Type: e.employeeType
        }));
      };
      case 'Contracts': return async () => {
        const cnts = await apiService.getContracts();
        return cnts.map(c => ({
          Ref: c.contractRef, Employee: c.employeeName, Department: c.department, Position: c.jobPosition, Status: c.status, Wage: c.wage, Start: c.startDate
        }));
      };
      // Other generic fetchers can be added, but for now we'll stick to easily available ones or basic stubs if not strictly requested.
      default: return async () => [];
    }
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-[#0f172a] p-4 sm:p-6 lg:p-8">
      {activeReport && (
        <ReportModal title={activeReport} onClose={() => setActiveReport(null)} fetcher={getReportFetcher()} />
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Dashboard & Analytics</h1>
            <p className="text-emerald-200/60 mt-1">Key metrics and organizational insights at a glance.</p>
          </div>
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-sm font-medium text-emerald-100">Live Data</span>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          <div onClick={() => handleCardClick('Headcount')} className="cursor-pointer bg-brand-900/40 border border-white/10 rounded-2xl p-5 hover:bg-brand-900/80 hover:border-emerald-500/50 transition-all group overflow-hidden relative shadow-lg">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-all" />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-semibold text-emerald-200/60 uppercase tracking-wider group-hover:text-emerald-400 transition-colors">Total Headcount</p>
                <h3 className="text-2xl sm:text-4xl font-bold text-white mt-2">{stats?.headcount || 0}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center text-xs text-emerald-200/50">
              <span className="text-emerald-400 font-medium mr-1">Active</span> employees
            </div>
          </div>

          <div className="bg-brand-900/40 border border-white/10 rounded-2xl p-5 hover:bg-brand-900/60 transition-all group overflow-hidden relative shadow-lg">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-semibold text-emerald-200/60 uppercase tracking-wider">Today's Attendance</p>
                <h3 className="text-2xl sm:text-4xl font-bold text-white mt-2">{stats?.todaysAttendance || 0}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30 group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center text-xs text-emerald-200/50">
              <span className="text-blue-400 font-medium mr-1">Clocked in</span> today
            </div>
          </div>

          <div className="bg-brand-900/40 border border-white/10 rounded-2xl p-5 hover:bg-brand-900/60 transition-all group overflow-hidden relative shadow-lg">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all" />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-semibold text-emerald-200/60 uppercase tracking-wider">Pending Time Off</p>
                <h3 className="text-2xl sm:text-4xl font-bold text-white mt-2">{stats?.pendingTimeOffs || 0}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 border border-orange-500/30 group-hover:scale-110 transition-transform">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center text-xs text-emerald-200/50">
              <span className="text-orange-400 font-medium mr-1">Awaiting</span> approval
            </div>
          </div>

          <div onClick={() => handleCardClick('Contracts')} className="cursor-pointer bg-brand-900/40 border border-white/10 rounded-2xl p-5 hover:bg-brand-900/80 hover:border-purple-500/50 transition-all group overflow-hidden relative shadow-lg">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/30 transition-all" />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-semibold text-emerald-200/60 uppercase tracking-wider group-hover:text-purple-400 transition-colors">Paid This Month</p>
                <h3 className="text-2xl font-bold text-white mt-2 flex items-end gap-1">
                  <span className="text-emerald-400/80 text-lg">₹</span>
                  {stats?.salaryPaidThisMonth?.toLocaleString() || 0}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/30 group-hover:scale-110 transition-transform">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-emerald-200/50">
              <span>Across <span className="text-purple-400 font-medium">{stats?.payslipsThisMonth || 0}</span> payslips</span>
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>

        {/* Charts & Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Department Breakdown */}
          <div className="bg-brand-900/40 border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Building2 className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-white">Department Breakdown</h2>
            </div>
            
            <div className="flex-1 min-h-[250px] w-full">
              {deptData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={deptData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                      {deptData.map((e: any, i: number) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                    <Legend verticalAlign="bottom" height={36} formatter={(v) => <span className="text-emerald-100/80 text-xs ml-1">{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-emerald-200/50 text-sm">No data</div>
              )}
            </div>
          </div>

          {/* Employee Types */}
          <div className="bg-brand-900/40 border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                <PieChartIcon className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-white">Employee Types</h2>
            </div>
            
            <div className="flex-1 min-h-[250px] w-full">
              {typeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={typeData} cx="50%" cy="50%" innerRadius={0} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                      {typeData.map((e: any, i: number) => <Cell key={`cell-${i}`} fill={COLORS[(i+2) % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                    <Legend verticalAlign="bottom" height={36} formatter={(v) => <span className="text-emerald-100/80 text-xs ml-1">{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-emerald-200/50 text-sm">No data</div>
              )}
            </div>
          </div>

          {/* Contract Status Bar Chart */}
          <div className="bg-brand-900/40 border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-white">Contract Status</h2>
            </div>
            
            <div className="flex-1 min-h-[250px] w-full">
              {contractData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={contractData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {contractData.map((e: any, i: number) => <Cell key={`cell-${i}`} fill={COLORS[(i+4) % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-emerald-200/50 text-sm">No data</div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
