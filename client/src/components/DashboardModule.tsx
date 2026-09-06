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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <h2 className="text-xl font-bold text-slate-900">{title} Detailed Report</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              disabled={loading || data.length === 0}
              className="flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-800 hover:bg-brand-100 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 border border-brand-100"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-canvas">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <div className="w-6 h-6 border-2 border-brand-100 border-t-brand-700 rounded-full animate-spin" />
              <p className="text-sm text-slate-500">Loading detailed data...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <FileText className="w-8 h-8 text-slate-500/50" />
              <p className="text-sm text-slate-400">No data available for this report.</p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80">
                      {keys.map((k) => (
                        <th key={k} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap border-b border-slate-200">
                          {k.replace(/([A-Z])/g, ' $1').trim()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                        {keys.map((k) => (
                          <td key={k} className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
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
      <div className="flex-1 flex items-center justify-center bg-canvas">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-brand-100 border-t-brand-700 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Loading metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 bg-canvas">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-center gap-3">
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
    <div className="flex-1 overflow-y-auto no-scrollbar bg-canvas px-6 lg:px-8 py-6">
      {activeReport && (
        <ReportModal title={activeReport} onClose={() => setActiveReport(null)} fetcher={getReportFetcher()} />
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard & Analytics</h1>
            <p className="text-slate-500 mt-1">Key metrics and organizational insights at a glance.</p>
          </div>
          <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl flex items-center gap-2 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-sm font-medium text-brand-800">Live Data</span>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div onClick={() => handleCardClick('Headcount')} className="cursor-pointer bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-brand-100 transition-all group overflow-hidden relative shadow-card hover:shadow-card-hover">
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider group-hover:text-brand-700 transition-colors">Total Headcount</p>
                <h3 className="text-4xl font-bold text-slate-900 mt-2">{stats?.headcount || 0}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-brand-800 border border-brand-100 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-xs text-slate-500">
              <span className="text-emerald-700 font-medium mr-1">Active</span> employees
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 transition-all group overflow-hidden relative shadow-card hover:shadow-card-hover">
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Today's Attendance</p>
                <h3 className="text-4xl font-bold text-slate-900 mt-2">{stats?.todaysAttendance || 0}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30 group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-xs text-slate-500">
              <span className="text-blue-400 font-medium mr-1">Clocked in</span> today
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 transition-all group overflow-hidden relative shadow-card hover:shadow-card-hover">
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pending Time Off</p>
                <h3 className="text-4xl font-bold text-slate-900 mt-2">{stats?.pendingTimeOffs || 0}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 border border-orange-500/30 group-hover:scale-110 transition-transform">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-xs text-slate-500">
              <span className="text-orange-400 font-medium mr-1">Awaiting</span> approval
            </div>
          </div>

          <div onClick={() => handleCardClick('Contracts')} className="cursor-pointer bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-brand-100 transition-all group overflow-hidden relative shadow-card hover:shadow-card-hover">
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider group-hover:text-brand-700 transition-colors">Paid This Month</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-2 flex items-end gap-1">
                  <span className="text-emerald-700 text-lg">₹</span>
                  {stats?.salaryPaidThisMonth?.toLocaleString() || 0}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-800 border border-brand-100 group-hover:scale-110 transition-transform">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Across <span className="text-brand-700 font-medium">{stats?.payslipsThisMonth || 0}</span> payslips</span>
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>

        {/* Charts & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Department Breakdown */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Building2 className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Department Breakdown</h2>
            </div>
            
            <div className="flex-1 min-h-[330px] w-full flex flex-col">
              {deptData.length > 0 ? (
                <>
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={deptData} cx="50%" cy="50%" innerRadius={50} outerRadius={82} paddingAngle={5} dataKey="value" stroke="none">
                          {deptData.map((e: any, i: number) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a' }} itemStyle={{ color: '#0f172a' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-600">
                    {deptData.map((item: any, i: number) => (
                      <div key={item.name} className="flex min-w-0 items-center gap-2">
                        <span className="h-3 w-3 rounded-sm shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="truncate">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No data</div>
              )}
            </div>
          </div>

          {/* Employee Types */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                <PieChartIcon className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Employee Types</h2>
            </div>
            
            <div className="flex-1 min-h-[250px] w-full">
              {typeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={typeData} cx="50%" cy="50%" innerRadius={0} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                      {typeData.map((e: any, i: number) => <Cell key={`cell-${i}`} fill={COLORS[(i+2) % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a' }} itemStyle={{ color: '#0f172a' }} />
                    <Legend verticalAlign="bottom" height={36} formatter={(v) => <span className="text-slate-600 text-xs ml-1">{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No data</div>
              )}
            </div>
          </div>

          {/* Contract Status Bar Chart */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-800">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Contract Status</h2>
            </div>
            
            <div className="flex-1 min-h-[250px] w-full">
              {contractData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={contractData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {contractData.map((e: any, i: number) => <Cell key={`cell-${i}`} fill={COLORS[(i+4) % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No data</div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
