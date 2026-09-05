import { useMemo, useState } from 'react';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import FormDrawer from '../../components/ui/FormDrawer.jsx';
import { Field, TextInput, Select, FormGrid } from '../../components/ui/Field.jsx';
import { useSavePayrun, useStructures, useEmployees } from './api.js';

const TYPE_LABEL = { full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract', intern: 'Intern' };

// Two-step wizard: (1) scope/structure/period, (2) select employees.
// The Payrun is created only after employee selection (per the mockup).
export default function PayrunWizard({ open, onClose, onCreated }) {
  const [step, setStep] = useState(1);
  const [scope, setScope] = useState({ name: '', salaryStructure: '', periodStart: '', periodEnd: '', employeeType: 'all' });
  const [picked, setPicked] = useState([]);
  const save = useSavePayrun();
  const { data: structures = [] } = useStructures();
  const { data: employees = [] } = useEmployees();

  const set = (k) => (e) => setScope((s) => ({ ...s, [k]: e.target.value }));

  const eligible = useMemo(
    () => employees.filter((e) => e.status === 'active' && (scope.employeeType === 'all' || e.employeeType === scope.employeeType)),
    [employees, scope.employeeType]
  );

  const reset = () => { setStep(1); setScope({ name: '', salaryStructure: '', periodStart: '', periodEnd: '', employeeType: 'all' }); setPicked([]); };
  const close = () => { reset(); onClose(); };

  const toContinue = () => {
    setPicked(eligible.map((e) => e._id)); // preselect all eligible
    setStep(2);
  };
  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const create = async () => {
    const run = await save.mutateAsync({ ...scope, employees: picked, payslips: [], state: 'draft' });
    reset();
    onCreated(run._id);
  };

  const step1Valid = scope.name && scope.salaryStructure && scope.periodStart && scope.periodEnd;

  return (
    <FormDrawer
      open={open}
      title="New Pay Run"
      subtitle={`Step ${step} of 2 — ${step === 1 ? 'Scope & Period' : 'Select Employees'}`}
      onClose={close}
      footer={
        step === 1 ? (
          <>
            <button className="btn-ghost" onClick={close}>Cancel</button>
            <button className="btn-primary" onClick={toContinue} disabled={!step1Valid}>Continue <ArrowRight size={16} /></button>
          </>
        ) : (
          <>
            <button className="btn-ghost" onClick={() => setStep(1)}><ArrowLeft size={16} /> Back</button>
            <button className="btn-primary" onClick={create} disabled={picked.length === 0 || save.isPending}>
              <Check size={16} /> {save.isPending ? 'Creating…' : `Create Payrun (${picked.length})`}
            </button>
          </>
        )
      }
    >
      {step === 1 ? (
        <FormGrid>
          <Field label="Payrun Name" required><TextInput value={scope.name} onChange={set('name')} placeholder="e.g. February 2026" /></Field>
          <Field label="Salary Structure" required>
            <Select value={scope.salaryStructure} onChange={set('salaryStructure')}>
              <option value="">— Select —</option>{structures.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </Select>
          </Field>
          <Field label="Period Start" required><TextInput type="date" value={scope.periodStart} onChange={set('periodStart')} /></Field>
          <Field label="Period End" required><TextInput type="date" value={scope.periodEnd} onChange={set('periodEnd')} /></Field>
          <Field label="Employee Type">
            <Select value={scope.employeeType} onChange={set('employeeType')}>
              <option value="all">All</option>
              {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </Field>
        </FormGrid>
      ) : (
        <div>
          <p className="mb-3 text-sm text-muted">{picked.length} of {eligible.length} eligible employees selected.</p>
          <div className="card divide-y divide-line">
            {eligible.map((e) => (
              <label key={e._id} className="flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-brand-light/40">
                <input type="checkbox" checked={picked.includes(e._id)} onChange={() => toggle(e._id)} className="h-4 w-4 accent-[#4F46E5]" />
                <span className="flex-1 font-medium">{e.name}</span>
                <span className="text-xs text-muted">{e.department}</span>
                <span className="text-xs text-muted">{TYPE_LABEL[e.employeeType]}</span>
              </label>
            ))}
            {eligible.length === 0 && <div className="px-4 py-6 text-center text-sm text-muted">No eligible employees for this scope.</div>}
          </div>
        </div>
      )}
    </FormDrawer>
  );
}
