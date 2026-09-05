import React, { useState, useEffect } from 'react';
import { Employee, Contract, JobPosition, Department, ActiveTab } from './types';
import { INITIAL_EMPLOYEES, INITIAL_CONTRACTS, INITIAL_JOB_POSITIONS, INITIAL_DEPARTMENTS } from './data/mockData';
import { apiService } from './services/api';
import { Navbar } from './components/Navbar';
import { EmployeeKanban } from './components/EmployeeKanban';
import { EmployeeList } from './components/EmployeeList';
import { EmployeeForm } from './components/EmployeeForm';
import { ContractList } from './components/ContractList';
import { ContractForm } from './components/ContractForm';
import { JobPositionList } from './components/JobPositionList';
import { JobPositionForm } from './components/JobPositionForm';
import { LayoutGrid, List, Plus, Search, Filter, Users, DollarSign, FileText, CheckCircle2, Briefcase } from 'lucide-react';

export function App() {
  // Main State Management
  const [activeTab, setActiveTab] = useState<ActiveTab>('EMPLOYEES');
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [contracts, setContracts] = useState<Contract[]>(INITIAL_CONTRACTS);
  const [jobPositions, setJobPositions] = useState<JobPosition[]>(INITIAL_JOB_POSITIONS);
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initial Data Fetching & API Health Check
  useEffect(() => {
    async function init() {
      const isConnected = await apiService.checkHealth();
      setIsBackendConnected(isConnected);

      const [remoteEmps, remoteCnts, remoteDepts, remotePositions] = await Promise.all([
        apiService.getEmployees(),
        apiService.getContracts(),
        apiService.getDepartments(),
        apiService.getJobPositions()
      ]);

      if (remoteEmps && remoteEmps.length > 0) setEmployees(remoteEmps);
      if (remoteCnts && remoteCnts.length > 0) setContracts(remoteCnts);
      if (remoteDepts && remoteDepts.length > 0) setDepartments(remoteDepts);
      if (remotePositions && remotePositions.length > 0) setJobPositions(remotePositions);
    }
    init();
  }, []);

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

  const filteredContracts = contracts.filter((cnt) => {
    const matchesEmp = !contractEmployeeFilter || cnt.employeeId === contractEmployeeFilter;
    const matchesSearch =
      cnt.contractRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cnt.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cnt.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesEmp && matchesSearch;
  });

  // Handlers - Employees
  const handleSaveEmployee = async (empData: Employee) => {
    const savedEmp = await apiService.createEmployee(empData);

    setEmployees((prev) => {
      const idx = prev.findIndex((e) => e.id === savedEmp.id || e.id === empData.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = savedEmp;
        return updated;
      }
      return [savedEmp, ...prev];
    });

    showToast(`Employee "${savedEmp.name}" updated successfully!`);
    setIsEditingEmployee(false);
    setSelectedEmployee(null);
  };

  // Handlers - Contracts
  const handleSaveContract = async (cntData: Contract) => {
    const savedCnt = await apiService.createContract(cntData);

    setContracts((prev) => {
      const idx = prev.findIndex((c) => c.id === savedCnt.id || c.id === cntData.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = savedCnt;
        return updated;
      }
      return [savedCnt, ...prev];
    });

    // Dynamically re-calculate employee contract counts
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id === savedCnt.employeeId) {
          const empContracts = [...contracts.filter(c => c.id !== savedCnt.id), savedCnt].filter((c) => c.employeeId === e.id);
          return { ...e, contractCount: empContracts.length };
        }
        return e;
      })
    );

    showToast(`Contract "${savedCnt.contractRef}" saved successfully!`);
    setIsEditingContract(false);
    setSelectedContract(null);
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

  return (
    <div className="min-h-screen bg-brand-warmCream flex flex-col font-sans relative">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setIsEditingEmployee(false);
          setIsEditingContract(false);
          if (tab === 'EMPLOYEES') setContractEmployeeFilter(null);
        }}
        isBackendConnected={isBackendConnected}
      />

      {/* Dynamic Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-brand-deepTeal text-brand-offWhite px-4 py-3 rounded-xl shadow-xl border border-brand-teal flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-brand-sageGreen" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Dynamic Summary KPI Ribbon */}
      <div className="bg-brand-softSand border-b border-brand-sandBorder px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-brand-darkCharcoal">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-brand-darkTeal" />
              <span>Total Staff: <strong className="text-brand-deepTeal">{employees.length}</strong></span>
              <span className="text-brand-mutedSlate">({activeEmployeesCount} Active)</span>
            </div>

            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-brand-teal" />
              <span>Active Contracts: <strong className="text-brand-darkTeal">{activeContractsList.length}</strong></span>
            </div>

            <div className="flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-brand-teal" />
              <span>Job Positions: <strong className="text-brand-darkTeal">{jobPositions.length}</strong></span>
            </div>

            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-brand-darkTeal" />
              <span>Monthly Base Budget: <strong className="text-brand-darkTeal">${totalMonthlyWageBudget.toLocaleString()}</strong></span>
            </div>
          </div>

          <div className="text-[11px] text-brand-mutedSlate italic">
            ⚡ Dynamic real-time calculations active
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'EMPLOYEES' && (
          <div>
            {isEditingEmployee ? (
              <EmployeeForm
                employee={selectedEmployee}
                onSave={handleSaveEmployee}
                onCancel={() => setIsEditingEmployee(false)}
                onViewRelatedContracts={handleSmartButtonViewContracts}
              />
            ) : (
              <div className="max-w-7xl mx-auto space-y-4">
                {/* Control Bar */}
                <div className="p-4 bg-brand-offWhite border-b border-brand-sandBorder shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        setSelectedEmployee(null);
                        setIsEditingEmployee(true);
                      }}
                      className="bg-brand-darkTeal hover:bg-brand-teal text-brand-offWhite px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      <span>NEW EMPLOYEE</span>
                    </button>

                    <h1 className="text-base font-bold text-brand-darkCharcoal flex items-center">
                      <Users className="w-5 h-5 mr-2 text-brand-darkTeal" />
                      Employees Directory
                    </h1>
                  </div>

                  {/* Search & Filters */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Search Input */}
                    <div className="relative min-w-[240px]">
                      <Search className="w-4 h-4 text-brand-mutedSlate absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search employee, position..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-1.5 border border-brand-sandBorder bg-white rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-darkTeal text-brand-darkCharcoal"
                      />
                    </div>

                    {/* Department Filter */}
                    <div className="flex items-center border border-brand-sandBorder rounded-lg px-2.5 bg-white text-xs">
                      <Filter className="w-3.5 h-3.5 text-brand-mutedSlate mr-1.5" />
                      <select
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        className="py-1.5 text-xs text-brand-darkCharcoal bg-transparent focus:outline-none font-semibold"
                      >
                        <option value="ALL">All Departments</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Finance & Payroll">Finance & Payroll</option>
                        <option value="Product & Design">Product & Design</option>
                        <option value="Sales & Marketing">Sales & Marketing</option>
                      </select>
                    </div>

                    {/* View Switcher */}
                    <div className="flex items-center border border-brand-sandBorder rounded-lg overflow-hidden divide-x divide-brand-sandBorder shadow-sm">
                      <button
                        onClick={() => setEmployeeViewMode('KANBAN')}
                        className={`p-2 transition-colors ${
                          employeeViewMode === 'KANBAN'
                            ? 'bg-brand-darkTeal text-brand-offWhite'
                            : 'bg-brand-softSand text-brand-darkCharcoal hover:bg-brand-sandBorder'
                        }`}
                        title="Kanban View"
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEmployeeViewMode('LIST')}
                        className={`p-2 transition-colors ${
                          employeeViewMode === 'LIST'
                            ? 'bg-brand-darkTeal text-brand-offWhite'
                            : 'bg-brand-softSand text-brand-darkCharcoal hover:bg-brand-sandBorder'
                        }`}
                        title="List View"
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Employees View Render */}
                {employeeViewMode === 'KANBAN' ? (
                  <EmployeeKanban
                    employees={filteredEmployees}
                    onSelectEmployee={(emp) => {
                      setSelectedEmployee(emp);
                      setIsEditingEmployee(true);
                    }}
                  />
                ) : (
                  <EmployeeList
                    employees={filteredEmployees}
                    onSelectEmployee={(emp) => {
                      setSelectedEmployee(emp);
                      setIsEditingEmployee(true);
                    }}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'CONTRACTS' && (
          <div>
            {isEditingContract ? (
              <ContractForm
                contract={selectedContract}
                employees={employees}
                allContracts={contracts}
                onSave={handleSaveContract}
                onCancel={() => setIsEditingContract(false)}
              />
            ) : (
              <div>
                {/* Active Filter Indicator banner if filtered from Employee Smart Button */}
                {contractEmployeeFilter && (
                  <div className="max-w-7xl mx-auto px-4 pt-3 flex items-center justify-between text-xs bg-brand-softSand border border-brand-sandBorder text-brand-deepTeal rounded-lg p-3">
                    <span>
                      Filtering contracts for employee ID: <strong>{contractEmployeeFilter}</strong>
                    </span>
                    <button
                      onClick={() => setContractEmployeeFilter(null)}
                      className="font-bold text-brand-darkTeal hover:underline ml-2"
                    >
                      Clear Filter
                    </button>
                  </div>
                )}

                <ContractList
                  contracts={filteredContracts}
                  onSelectContract={(cnt) => {
                    setSelectedContract(cnt);
                    setIsEditingContract(true);
                  }}
                  onNewContract={() => {
                    setSelectedContract(null);
                    setIsEditingContract(true);
                  }}
                />
              </div>
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
      </main>
    </div>
  );
}

export default App;
