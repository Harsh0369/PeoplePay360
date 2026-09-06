import React, { useState, useEffect } from 'react';
import { Employee, Contract, JobPosition, Department, ActiveTab } from './types';
import { apiService } from './services/api';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardModule } from './components/DashboardModule';
import { EmployeesModule } from './components/EmployeesModule';
import { EmployeeForm } from './components/EmployeeForm';
import { ContractsModule } from './components/ContractsModule';
import { ContractForm } from './components/ContractForm';
import { LoginPage } from './components/LoginPage';
import { PayrollModule } from './components/PayrollModule';
import { ConfigModule } from './components/ConfigModule';
import { AttendanceModule } from './components/AttendanceModule';
import { TimeOffModule } from './components/TimeOffModule';
import { OrgModule } from './components/OrgModule';
import { RolesModule } from './components/RolesModule';
import { AuditModule } from './components/AuditModule';
import { MyProfileModule } from './components/MyProfileModule';
import { AccessDenied } from './components/AccessDenied';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TAB_PERMS, PERM } from './lib/permissions';
import { notify } from './lib/toast';
import { fetchPaged } from './lib/paged';
import { masterApi } from './services/hrApi';
import { useAuth } from './hooks/useAuth';
import { JobPositionList } from './components/JobPositionList';
import { JobPositionForm } from './components/JobPositionForm';
import { LayoutGrid, List, Plus, Search, Filter, Users, DollarSign, FileText, CheckCircle2, Briefcase, Loader2 } from 'lucide-react';

export function App() {
  const { isAuthenticated, isLoading: authLoading, can, permissions } = useAuth();
  const canView = (tab: ActiveTab) => {
    const perms = TAB_PERMS[tab];
    return !perms || can(...perms);
  };
  // Main State Management
  const [activeTab, setActiveTab] = useState<ActiveTab>('DASHBOARD');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  // Total record counts shown as badges next to every sidebar module.
  const [navCounts, setNavCounts] = useState<Partial<Record<ActiveTab, number>>>({});

  // Sub Views State
  const [employeeViewMode, setEmployeeViewMode] = useState<'KANBAN' | 'LIST'>('KANBAN');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEditingEmployee, setIsEditingEmployee] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([]);

  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isEditingContract, setIsEditingContract] = useState(false);

  const [isCreatingJobPosition, setIsCreatingJobPosition] = useState(false);
  const [selectedJobPosition, setSelectedJobPosition] = useState<JobPosition | null>(null);

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [contractEmployeeFilter, setContractEmployeeFilter] = useState<string | null>(null);

  // Toast Notification
  // Routes to a themed react-hot-toast; error-ish messages become error toasts.
  const showToast = (msg: string) => {
    if (/^(error|could not|failed|not available)/i.test(msg)) notify.error(msg.replace(/^Error:\s*/i, ''));
    else notify.success(msg);
  };

  // Initial Data Fetching & API Health Check.
  // Runs once the user is authenticated so requests carry the Bearer token —
  // otherwise protected routes (contracts, etc.) return 401 and fall back to mock data.
  useEffect(() => {
    if (!isAuthenticated) return;

    async function init() {
      setIsBackendConnected(await apiService.checkHealth());
      // Lists (Employees, Contracts, Attendance…) now fetch their own paginated
      // pages. Here we only load the small reference lists the FORMS need for
      // their dropdowns (employees for contract/assign pickers, departments,
      // job positions), and only what this role may read.
      if (canView('EMPLOYEES')) apiService.getEmployees().then(setEmployees).catch(() => setEmployees([]));
      if (canView('SETTINGS')) masterApi.getRoles().then(setRoles).catch(() => setRoles([]));
      if (canView('ORG')) apiService.getDepartments().then(setDepartments).catch(() => setDepartments([]));
      if (canView('JOB_POSITIONS')) apiService.getJobPositions().then(setJobPositions).catch(() => setJobPositions([]));
    }
    init();
  }, [isAuthenticated]);

  // Sidebar count badges — one lightweight total per module the role can see, so
  // every nav item shows a number (not just Employees). Uses the paginated
  // endpoints' offsetPagination.totalItems; Roles isn't paginated so we count it.
  useEffect(() => {
    if (!isAuthenticated) return;
    let alive = true;
    const put = (tab: ActiveTab, n: number) => { if (alive) setNavCounts((c) => ({ ...c, [tab]: n })); };
    const total = (path: string) => fetchPaged(path, { limit: 1 }).then((r) => r.pagination.totalItems);
    const len = (p: Promise<any>) => p.then((r) => (Array.isArray(r) ? r.length : 0));

    const tasks: [ActiveTab, Promise<number>][] = [];
    if (canView('EMPLOYEES')) tasks.push(['EMPLOYEES', total('/employees')]);
    if (canView('CONTRACTS')) tasks.push(['CONTRACTS', total('/contracts')]);
    if (canView('JOB_POSITIONS')) tasks.push(['JOB_POSITIONS', total('/job-positions')]);
    if (canView('ATTENDANCE')) tasks.push(['ATTENDANCE', total('/attendance')]);
    if (canView('TIMEOFF')) tasks.push(['TIMEOFF', total('/time-off/requests')]);
    if (canView('PAYROLL')) tasks.push(['PAYROLL', total('/payruns')]);
    if (canView('CONFIG')) tasks.push(['CONFIG', total('/payroll-config/rules')]);
    if (canView('ORG')) tasks.push(['ORG', total('/departments')]);
    if (canView('SETTINGS')) tasks.push(['SETTINGS', len(masterApi.getRoles())]);
    if (canView('AUDIT')) tasks.push(['AUDIT', total('/business-logs')]);

    tasks.forEach(([tab, p]) => p.then((n) => put(tab, n)).catch(() => {}));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, permissions]);

  // If the current tab isn't allowed for this role (e.g. after login), land the
  // user on the first section they can actually see.
  useEffect(() => {
    if (!isAuthenticated) return;
    if (!canView(activeTab)) {
      const order: ActiveTab[] = ['DASHBOARD', 'EMPLOYEES', 'ATTENDANCE', 'TIMEOFF', 'PAYROLL', 'CONTRACTS', 'ORG', 'CONFIG', 'SETTINGS', 'JOB_POSITIONS', 'MY_PROFILE'];
      setActiveTab(order.find(canView) || 'MY_PROFILE');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, permissions, activeTab]);

  // Dynamic Calculated Metrics
  const activeEmployeesCount = employees.filter((e) => e.status === 'ACTIVE').length;
  const activeContractsList = contracts.filter((c) => c.status === 'ACTIVE');
  const totalMonthlyWageBudget = activeContractsList.reduce((sum, c) => sum + (c.wage || 0), 0);

  // Filtered Lists
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.empCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.jobPosition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'ALL' || emp.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  // The backend populates contract.employeeId with fields that don't exist on the
  // model, so names arrive empty. Resolve them from the loaded employees instead.
  const empById = new Map(employees.map((e) => [e.id, e]));
  const contractsResolved = contracts.map((c) =>
    c.employeeName && c.employeeName !== '—'
      ? c
      : { ...c, employeeName: empById.get(c.employeeId)?.name || '—' }
  );

  const filteredContracts = contractsResolved.filter((cnt) => {
    const matchesEmp = !contractEmployeeFilter || cnt.employeeId === contractEmployeeFilter;
    const matchesSearch =
      cnt.contractRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cnt.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cnt.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesEmp && matchesSearch;
  });

  // Handlers - Employees.
  const handleSaveEmployee = async (empData: any) => {
    try {
      if (selectedEmployee?.id) {
        await apiService.updateEmployee(selectedEmployee.id, empData);
        showToast(`Employee "${empData.name}" updated successfully!`);
      } else {
        await apiService.createEmployee(empData);
        showToast(`Employee "${empData.name}" created successfully!`);
      }
      apiService.getEmployees().then(setEmployees).catch(() => {});
      setIsEditingEmployee(false);
      setSelectedEmployee(null);
      setPendingUser(null);
    } catch (e: any) {
      showToast(`Could not save employee: ${e.message}`);
    }
  };

  // Handlers - Contracts. The backend only allows editing a contract's status
  // and end date (activate, expire, cancel, extend); creation needs the full record.
  const STATUS_TO_API: Record<string, string> = { DRAFT: 'Draft', ACTIVE: 'Running', RUNNING: 'Running', EXPIRED: 'Expired', CANCELLED: 'Cancelled' };
  const handleSaveContract = async (cntData: Contract) => {
    try {
      const isEdit = !!selectedContract?.id;
      const savedCnt = isEdit
        ? await apiService.updateContract(selectedContract!.id, {
            status: STATUS_TO_API[String(cntData.status).toUpperCase()] as any,
            endDate: cntData.endDate ?? null,
          } as any)
        : await apiService.createContract(cntData);

      // Refresh contracts from the source of truth.
      apiService.getContracts().then(setContracts).catch(() => {});
      showToast(isEdit ? 'Contract updated successfully!' : 'Contract created successfully!');
      setIsEditingContract(false);
      setSelectedContract(null);
    } catch (e: any) {
      showToast(`Error: ${e.message}`);
    }
  };

  // Handlers - Job Positions
  const handleSaveJobPosition = async (data: any) => {
    try {
      if (selectedJobPosition?.id) {
        await apiService.updateJobPosition(selectedJobPosition.id, data);
        showToast(`Job Position "${data.title}" updated successfully!`);
      } else {
        await apiService.createJobPosition(data);
        showToast(`Job Position "${data.title}" created successfully!`);
      }
      apiService.getJobPositions().then(setJobPositions).catch(() => {});
      setIsCreatingJobPosition(false);
      setSelectedJobPosition(null);
    } catch (e: any) {
      showToast(`Could not save job position: ${e.message}`);
    }
  };

  const handleDeleteJobPosition = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job position?')) return;
    try {
      await apiService.deleteJobPosition(id);
      showToast('Job Position deleted.');
      apiService.getJobPositions().then(setJobPositions).catch(() => {});
    } catch (e: any) {
      showToast(`Could not delete job position: ${e.message}`);
    }
  };

  const handleAssignEmployeeJobPosition = async (employeeId: string, jobPositionId: string) => {
    const targetPosition = jobPositions.find((j) => (j.id || j._id) === jobPositionId);
    const targetEmployee = employees.find((e) => e.id === employeeId);

    if (!targetPosition || !targetEmployee) return;

    await apiService.assignEmployeeJobPosition(employeeId, jobPositionId);

    // Update local employee state
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id === employeeId) {
          return { ...e, jobPosition: targetPosition.title };
        }
        return e;
      })
    );

    showToast(`Assigned ${targetEmployee.name} to "${targetPosition.title}"!`);
  };

  const handleSmartButtonViewContracts = (employeeId: string) => {
    setContractEmployeeFilter(employeeId);
    setActiveTab('CONTRACTS');
    setIsEditingEmployee(false);
  };

  // --- Auth gate ---------------------------------------------------------
  if (authLoading) {
    return (
      <div className="min-h-screen bg-brand-deepTeal flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-brand-teal animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) return <LoginPage />;
  // -----------------------------------------------------------------------

  const TAB_TITLE: Record<string, string> = {
    DASHBOARD: 'Dashboard', EMPLOYEES: 'Employees Directory', CONTRACTS: 'Contracts', JOB_POSITIONS: 'Job Positions',
    ATTENDANCE: 'Attendance', TIMEOFF: 'Time Off', PAYROLL: 'Payroll', CONFIG: 'Configuration',
    ORG: 'Organization', SETTINGS: 'Roles & Access', AUDIT: 'Audit Trail', MY_PROFILE: 'My Profile',
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans">
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setIsEditingEmployee(false);
          setPendingUser(null);
          setIsEditingContract(false);
          setIsCreatingJobPosition(false);
          setSelectedJobPosition(null);
          if (tab === 'EMPLOYEES') setContractEmployeeFilter(null);
        }}
        isBackendConnected={isBackendConnected}
        counts={navCounts}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopHeader title={TAB_TITLE[activeTab] || 'PeoplePay360'} onMenuToggle={() => setMobileSidebarOpen(true)} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-canvas">
        <ErrorBoundary resetKey={activeTab} label={`Something went wrong in ${TAB_TITLE[activeTab] || 'this section'}`}>
        {!canView(activeTab) ? (
          <AccessDenied title={TAB_TITLE[activeTab]} />
        ) : (
        <>
        {activeTab === 'DASHBOARD' && <DashboardModule />}
        {activeTab === 'PAYROLL' && <PayrollModule />}
        {activeTab === 'CONFIG' && <ConfigModule />}
        {activeTab === 'ATTENDANCE' && <AttendanceModule />}
        {activeTab === 'TIMEOFF' && <TimeOffModule />}
        {activeTab === 'ORG' && <OrgModule />}
        {activeTab === 'SETTINGS' && <RolesModule />}
        {activeTab === 'AUDIT' && <AuditModule />}
        {activeTab === 'MY_PROFILE' && <MyProfileModule />}
        {activeTab === 'EMPLOYEES' && (
          isEditingEmployee ? (
            <EmployeeForm
              employee={selectedEmployee}
              roles={roles}
              pendingUser={pendingUser}
              onSave={handleSaveEmployee}
              onCancel={() => { setIsEditingEmployee(false); setSelectedEmployee(null); setPendingUser(null); }}
              onViewRelatedContracts={handleSmartButtonViewContracts}
            />
          ) : (
            <EmployeesModule
              onEditContract={(cnt) => { setSelectedContract(cnt); setActiveTab('CONTRACTS'); setIsEditingContract(true); }}
              onGoToContracts={() => setActiveTab('CONTRACTS')}
              onApproveJoinRequest={(user) => { setPendingUser(user); setIsEditingEmployee(true); }}
              onEditEmployee={(empData) => {
                setSelectedEmployee(empData);
                setPendingUser(null);
                setIsEditingEmployee(true);
              }}
              canWrite={can(...PERM.employeeWrite)}
            />
          )
        )}

        {activeTab === 'CONTRACTS' && (
          <div>
            {isEditingContract ? (
              <ContractForm
                contract={selectedContract}
                employees={employees}
                allContracts={[]}
                onSave={handleSaveContract}
                onCancel={() => setIsEditingContract(false)}
              />
            ) : (
              <ContractsModule
                canWrite={can(...PERM.contractWrite)}
                onSelectContract={(cnt) => { setSelectedContract(cnt); setIsEditingContract(true); }}
                onNewContract={() => { setSelectedContract(null); setIsEditingContract(true); }}
              />
            )}
          </div>
        )}

        {activeTab === 'JOB_POSITIONS' && (
          <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-brand-darkCharcoal flex items-center">
                  <Briefcase className="w-6 h-6 mr-2 text-brand-darkTeal" />
                  Job Position Management
                </h1>
                <p className="text-xs text-brand-mutedSlate">
                  Configure organization job roles, target monthly salary benchmarks, and staff assignments.
                </p>
              </div>
            </div>

            {isCreatingJobPosition ? (
              <JobPositionForm 
                jobPosition={selectedJobPosition}
                departments={departments}
                onSave={handleSaveJobPosition} 
                onCancel={() => { setIsCreatingJobPosition(false); setSelectedJobPosition(null); }} 
              />
            ) : (
              <JobPositionList
                jobPositions={jobPositions}
                departments={departments}
                employees={employees}
                canWrite={can(...PERM.jobPositionWrite)}
                onOpenCreateForm={() => { setSelectedJobPosition(null); setIsCreatingJobPosition(true); }}
                onEdit={(pos) => { setSelectedJobPosition(pos); setIsCreatingJobPosition(true); }}
                onDelete={handleDeleteJobPosition}
                onAssignEmployee={handleAssignEmployeeJobPosition}
              />
            )}
          </div>
        )}
        </>
        )}
        </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export default App;
