import React, { useState, useEffect } from 'react';
import { Employee, Contract, JobPosition, Department, ActiveTab } from './types';
import { apiService } from './services/api';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
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
import { MyProfileModule } from './components/MyProfileModule';
import { AccessDenied } from './components/AccessDenied';
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
  const [activeTab, setActiveTab] = useState<ActiveTab>('EMPLOYEES');
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

  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isEditingContract, setIsEditingContract] = useState(false);

  const [isCreatingJobPosition, setIsCreatingJobPosition] = useState(false);

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
      apiService.getEmployees().then(setEmployees).catch(() => setEmployees([]));
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

    tasks.forEach(([tab, p]) => p.then((n) => put(tab, n)).catch(() => {}));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, permissions]);

  // If the current tab isn't allowed for this role (e.g. after login), land the
  // user on the first section they can actually see.
  useEffect(() => {
    if (!isAuthenticated) return;
    if (!canView(activeTab)) {
      const order: ActiveTab[] = ['EMPLOYEES', 'ATTENDANCE', 'TIMEOFF', 'PAYROLL', 'CONTRACTS', 'ORG', 'CONFIG', 'SETTINGS', 'JOB_POSITIONS', 'MY_PROFILE'];
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

  // Handlers - Employees. The backend has no employee-update route, and creating
  // an employee requires a linked User account (no user-create endpoint yet), so
  // we surface the real backend response instead of faking success.
  const handleSaveEmployee = async (empData: Employee) => {
    if (selectedEmployee?.id) {
      showToast('Editing employees is not available yet — the backend has no update endpoint.');
      setIsEditingEmployee(false);
      setSelectedEmployee(null);
      return;
    }
    try {
      await apiService.createEmployee(empData);
      apiService.getEmployees().then(setEmployees).catch(() => {});
      showToast(`Employee "${empData.name}" created successfully!`);
      setIsEditingEmployee(false);
      setSelectedEmployee(null);
    } catch (e: any) {
      showToast(`Could not create employee: ${e.message}`);
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
  const handleCreateJobPosition = async (data: { title: string; departmentId: string; expectedSalary: number }) => {
    const newPos = await apiService.createJobPosition(data);
    const deptMatch = departments.find((d) => (d.id || d._id) === data.departmentId);
    newPos.departmentName = deptMatch ? deptMatch.name : 'Engineering';

    setJobPositions((prev) => [newPos, ...prev]);
    setIsCreatingJobPosition(false);
    showToast(`Job Position "${newPos.title}" created successfully!`);
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
    EMPLOYEES: 'Employees Directory', CONTRACTS: 'Contracts', JOB_POSITIONS: 'Job Positions',
    ATTENDANCE: 'Attendance', TIMEOFF: 'Time Off', PAYROLL: 'Payroll', CONFIG: 'Configuration',
    ORG: 'Organization', SETTINGS: 'Roles & Access', MY_PROFILE: 'My Profile',
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans">
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setIsEditingEmployee(false);
          setIsEditingContract(false);
          if (tab === 'EMPLOYEES') setContractEmployeeFilter(null);
        }}
        isBackendConnected={isBackendConnected}
        counts={navCounts}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopHeader title={TAB_TITLE[activeTab] || 'PeoplePay360'} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-canvas">
        {!canView(activeTab) ? (
          <AccessDenied title={TAB_TITLE[activeTab]} />
        ) : (
        <>
        {activeTab === 'PAYROLL' && <PayrollModule />}
        {activeTab === 'CONFIG' && <ConfigModule />}
        {activeTab === 'ATTENDANCE' && <AttendanceModule />}
        {activeTab === 'TIMEOFF' && <TimeOffModule />}
        {activeTab === 'ORG' && <OrgModule />}
        {activeTab === 'SETTINGS' && <RolesModule />}
        {activeTab === 'MY_PROFILE' && <MyProfileModule />}
        {activeTab === 'EMPLOYEES' && (
          <EmployeesModule
            onEditContract={(cnt) => { setSelectedContract(cnt); setActiveTab('CONTRACTS'); setIsEditingContract(true); }}
            onGoToContracts={() => setActiveTab('CONTRACTS')}
          />
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

            <JobPositionList
              jobPositions={jobPositions}
              departments={departments}
              employees={employees}
              canWrite={can(...PERM.jobPositionWrite)}
              onOpenCreateForm={() => setIsCreatingJobPosition(true)}
              onAssignEmployee={handleAssignEmployeeJobPosition}
            />

            {isCreatingJobPosition && (
              <JobPositionForm
                departments={departments}
                existingPositions={jobPositions}
                onSubmit={handleCreateJobPosition}
                onClose={() => setIsCreatingJobPosition(false)}
              />
            )}
          </div>
        )}
        </>
        )}
        </main>
      </div>
    </div>
  );
}

export default App;
