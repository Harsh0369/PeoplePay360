import React, { useEffect, useMemo, useState } from 'react';
import { Contract, ContractStatus, Employee } from '../types';
import { ArrowLeft, Save, X, FileText, AlertTriangle, Loader2 } from 'lucide-react';
import { masterApi, configApi } from '../services/hrApi';

interface ContractFormProps {
  contract: Contract | null;
  employees: Employee[];
  allContracts: Contract[];
  onSave: (cnt: Contract) => void;
  onCancel: () => void;
}

export const ContractForm: React.FC<ContractFormProps> = ({ contract, employees, allContracts, onSave, onCancel }) => {
  const isEdit = !!contract;

  const [formData, setFormData] = useState<Contract>(
    contract || {
      id: '',
      contractRef: '',
      employeeId: employees[0]?.id || '',
      employeeName: employees[0]?.name || '',
      department: '',
      jobPosition: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: null,
      wage: 0,
      salaryStructure: '',
      status: 'DRAFT',
      terms: '',
    }
  );

  // Real backend references (create needs ObjectIds, not names).
  const [ids, setIds] = useState({ departmentId: '', jobPositionId: '', workingScheduleId: '', salaryStructureId: '' });
  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [structures, setStructures] = useState<any[]>([]);
  const [loading, setLoading] = useState(!isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Load option lists (only needed when creating).
  useEffect(() => {
    if (isEdit) return;
    (async () => {
      try {
        const [d, p, s, st] = await Promise.all([
          masterApi.getDepartments(), masterApi.getJobPositions(), masterApi.getWorkingSchedules(), configApi.getStructures(),
        ]);
        setDepartments(Array.isArray(d) ? d : []);
        setPositions(Array.isArray(p) ? p : []);
        setSchedules(Array.isArray(s) ? s : []);
        setStructures(Array.isArray(st) ? st : []);
      } catch (e: any) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [isEdit]);

  const handleChange = (field: keyof Contract, value: any) => setFormData((prev) => ({ ...prev, [field]: value }));
  const setId = (k: keyof typeof ids) => (e: any) => setIds((prev) => ({ ...prev, [k]: e.target.value }));

  const hasConcurrentActiveContract =
    formData.status === 'ACTIVE' &&
    allContracts.some((c) => c.employeeId === formData.employeeId && c.id !== formData.id && c.status === 'ACTIVE');

  const canSubmit = isEdit
    ? true
    : formData.employeeId && ids.departmentId && ids.jobPositionId && ids.workingScheduleId && formData.wage > 0 && formData.startDate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isEdit) {
      // Backend only updates status + end date; App maps status -> backend enum.
      onSave(formData);
      return;
    }
    if (!canSubmit) { setError('Please fill employee, department, job position, working schedule, wage and start date.'); return; }
    setSaving(true);
    // Real create payload — ObjectIds as the backend requires.
    const payload: any = {
      employeeId: formData.employeeId,
      departmentId: ids.departmentId,
      jobPositionId: ids.jobPositionId,
      workingScheduleId: ids.workingScheduleId,
      wage: Number(formData.wage),
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
    };
    if (ids.salaryStructureId) payload.salaryStructureId = ids.salaryStructureId;
    try {
      await onSave(payload as any); // App calls apiService.createContract(payload)
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inp = 'w-full px-3.5 py-2 border border-brand-sandBorder bg-white rounded-lg text-xs font-medium text-brand-darkCharcoal focus:outline-none focus:ring-1 focus:ring-brand-darkTeal';
  const label = 'block text-xs font-semibold text-brand-darkCharcoal mb-1';

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 bg-brand-offWhite p-4 rounded-xl border border-brand-sandBorder shadow-sm">
        <div className="flex items-center space-x-3">
          <button onClick={onCancel} className="p-2 rounded-lg hover:bg-brand-softSand text-brand-deepTeal"><ArrowLeft className="w-5 h-5 text-brand-darkTeal" /></button>
          <div>
            <span className="text-xs text-brand-darkTeal font-bold uppercase tracking-wider block">Contracts / {isEdit ? formData.contractRef : 'New'}</span>
            <h2 className="text-lg font-bold text-brand-darkCharcoal leading-tight">{isEdit ? formData.employeeName : 'New Contract'}</h2>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={handleSubmit} disabled={!canSubmit || saving} className="bg-brand-darkTeal hover:bg-brand-teal disabled:opacity-50 text-brand-offWhite px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isEdit ? 'Update Contract' : 'Create Contract'}</span>
          </button>
          <button onClick={onCancel} className="bg-brand-softSand text-brand-deepTeal hover:bg-brand-sandBorder px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-1 border border-brand-sandBorder"><X className="w-4 h-4" /><span>Cancel</span></button>
        </div>
      </div>

      <div className="bg-brand-offWhite rounded-xl border border-brand-sandBorder shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-sandBorder pb-5">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-brand-darkTeal" />
            <span className="font-extrabold text-brand-darkCharcoal text-sm">{isEdit ? formData.contractRef : 'Draft contract'}</span>
          </div>
          {/* Status is only editable on an existing contract (backend allows status + end date). */}
          <div className="flex items-center border border-brand-sandBorder rounded-lg overflow-hidden divide-x divide-brand-sandBorder shadow-sm">
            {(['DRAFT', 'ACTIVE', 'EXPIRED', 'CANCELLED'] as ContractStatus[]).map((st) => (
              <button key={st} type="button" disabled={!isEdit} onClick={() => handleChange('status', st)}
                className={`px-4 py-2 text-xs font-bold uppercase transition-all disabled:opacity-50 ${formData.status === st ? 'bg-brand-darkTeal text-brand-offWhite' : 'bg-brand-softSand text-brand-mutedSlate hover:bg-brand-sandBorder'}`}>
                {st}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="bg-brand-warningBg border border-brand-coral/40 text-brand-warningText rounded-xl p-3 text-xs">{error}</div>}
        {hasConcurrentActiveContract && (
          <div className="bg-brand-warningBg border border-brand-coral/40 text-brand-warningText rounded-xl p-3.5 text-xs flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-brand-coral flex-shrink-0 mt-0.5" />
            <div><strong className="font-bold">Payroll Rule Warning:</strong> {formData.employeeName} already has an active contract. Payroll uses the single contract matching the payroll period.</div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-brand-teal" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className={label}>Employee *</label>
                <select value={formData.employeeId} disabled={isEdit} onChange={(e) => { const emp = employees.find((x) => x.id === e.target.value); handleChange('employeeId', e.target.value); if (emp) handleChange('employeeName', emp.name); }} className={inp}>
                  <option value="">— Select employee —</option>
                  {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name} ({emp.empCode})</option>)}
                </select>
              </div>

              {isEdit ? (
                <>
                  <div><label className={label}>Department</label><input readOnly value={formData.department} className={`${inp} bg-brand-softSand/60`} /></div>
                  <div><label className={label}>Job Position</label><input readOnly value={formData.jobPosition} className={`${inp} bg-brand-softSand/60`} /></div>
                </>
              ) : (
                <>
                  <div>
                    <label className={label}>Department *</label>
                    <select value={ids.departmentId} onChange={setId('departmentId')} className={inp}>
                      <option value="">— Select —</option>
                      {departments.map((d) => <option key={d._id || d.id} value={d._id || d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={label}>Job Position *</label>
                    <select value={ids.jobPositionId} onChange={setId('jobPositionId')} className={inp}>
                      <option value="">— Select —</option>
                      {positions.map((p) => <option key={p._id || p.id} value={p._id || p.id}>{p.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={label}>Working Schedule *</label>
                    <select value={ids.workingScheduleId} onChange={setId('workingScheduleId')} className={inp}>
                      <option value="">— Select —</option>
                      {schedules.map((s) => <option key={s._id || s.id} value={s._id || s.id}>{s.name} ({s.totalWeeklyHours ?? 0}h/wk)</option>)}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className={label}>Start Date *</label><input type="date" value={formData.startDate} disabled={isEdit} onChange={(e) => handleChange('startDate', e.target.value)} className={inp} /></div>
                <div><label className={label}>End Date (Optional)</label><input type="date" value={formData.endDate || ''} onChange={(e) => handleChange('endDate', e.target.value || null)} className={inp} /></div>
              </div>

              <div>
                <label className={label}>Monthly Wage (Base Salary) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2 text-xs font-bold text-brand-mutedSlate">₹</span>
                  <input type="number" value={formData.wage} disabled={isEdit} onChange={(e) => handleChange('wage', Number(e.target.value))} placeholder="50000" className={`${inp} pl-7`} />
                </div>
              </div>

              {!isEdit && (
                <div>
                  <label className={label}>Salary Structure (Optional)</label>
                  <select value={ids.salaryStructureId} onChange={setId('salaryStructureId')} className={inp}>
                    <option value="">— None —</option>
                    {structures.map((s) => <option key={s._id || s.id} value={s._id || s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}

              {isEdit && (
                <p className="text-xs text-brand-mutedSlate bg-brand-softSand/50 rounded-lg p-3">
                  On an existing contract you can change the <strong>status</strong> and <strong>end date</strong>. Other terms are fixed for audit integrity.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
