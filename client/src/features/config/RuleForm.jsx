import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import FormDrawer from '../../components/ui/FormDrawer.jsx';
import { Field, TextInput, Select, FormGrid } from '../../components/ui/Field.jsx';
import { useSaveRule } from './api.js';
import { validateFormula } from '../../lib/payrollEngine.js';

const EMPTY = {
  name: '', code: '', category: 'basic', sequence: 100,
  computeType: 'fixed', amountFixed: 0, percentage: 0, percentBase: 'basic', formula: '', active: true,
};

// Variables available to a formula rule (mirrors the engine scope).
const SCOPE = ['wage', 'basic', 'allowances', 'gross', 'net', 'deductions',
  'workedDays', 'totalDays', 'leaveDays', 'unpaidLeaveDays', 'overtimeHours', 'presentRatio'];

export default function RuleForm({ open, rule, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const save = useSaveRule();

  useEffect(() => { setForm(rule ? { ...EMPTY, ...rule } : EMPTY); }, [rule, open]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const formulaCheck = useMemo(
    () => (form.computeType === 'code' ? validateFormula(form.formula, SCOPE) : { ok: true }),
    [form.computeType, form.formula]
  );

  const submit = async () => {
    await save.mutateAsync({
      ...form,
      code: form.code.toUpperCase(),
      sequence: Number(form.sequence),
      amountFixed: Number(form.amountFixed),
      percentage: Number(form.percentage),
    });
    onClose();
  };

  const canSave = form.name && form.code && (form.computeType !== 'code' || formulaCheck.ok);

  return (
    <FormDrawer
      open={open}
      title={rule?._id ? form.name || 'Salary Rule' : 'New Salary Rule'}
      subtitle="Defines how one earning or deduction is calculated"
      onClose={onClose}
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={!canSave || save.isPending}>
            {save.isPending ? 'Saving…' : 'Save'}
          </button>
        </>
      }
    >
      <FormGrid>
        <Field label="Name" required><TextInput value={form.name} onChange={set('name')} placeholder="e.g. House Rent Allowance" /></Field>
        <Field label="Code" required hint="Uppercase, referenced in formulas"><TextInput value={form.code} onChange={set('code')} placeholder="HRA" /></Field>
        <Field label="Category" required>
          <Select value={form.category} onChange={set('category')}>
            <option value="basic">Basic</option>
            <option value="allowance">Allowance</option>
            <option value="gross">Gross</option>
            <option value="deduction">Deduction</option>
            <option value="net">Net</option>
          </Select>
        </Field>
        <Field label="Sequence" hint="Lower runs first (dependencies)"><TextInput type="number" value={form.sequence} onChange={set('sequence')} /></Field>
      </FormGrid>

      <div className="mt-6">
        <Field label="Computation Method">
          <Select value={form.computeType} onChange={set('computeType')}>
            <option value="fixed">Fixed amount</option>
            <option value="percentage">Percentage of a base</option>
            <option value="code">Formula (advanced)</option>
          </Select>
        </Field>
      </div>

      {form.computeType === 'fixed' && (
        <div className="mt-4">
          <Field label="Fixed Amount (₹)"><TextInput type="number" value={form.amountFixed} onChange={set('amountFixed')} placeholder="2000" /></Field>
        </div>
      )}

      {form.computeType === 'percentage' && (
        <FormGrid>
          <Field label="Percentage (%)"><TextInput type="number" value={form.percentage} onChange={set('percentage')} placeholder="40" /></Field>
          <Field label="Of Base">
            <Select value={form.percentBase} onChange={set('percentBase')}>
              <option value="wage">Contract Wage</option>
              <option value="basic">Basic</option>
              <option value="gross">Gross</option>
              <option value="net">Net</option>
            </Select>
          </Field>
        </FormGrid>
      )}

      {form.computeType === 'code' && (
        <div className="mt-4">
          <Field label="Formula" hint="Attendance/leave-aware. e.g. (unpaidLeaveDays / totalDays) * basic">
            <textarea
              className="input font-mono text-sm"
              rows={3}
              value={form.formula}
              onChange={set('formula')}
              placeholder="(unpaidLeaveDays / totalDays) * basic"
            />
          </Field>
          <div className={`mt-2 flex items-center gap-2 text-sm ${formulaCheck.ok ? 'text-emerald-600' : 'text-danger'}`}>
            {formulaCheck.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            {formulaCheck.ok ? 'Formula is valid' : formulaCheck.error}
          </div>
          <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-muted">
            <span className="font-medium text-ink">Available variables:</span> {SCOPE.join(', ')}, rules.CODE
          </div>
        </div>
      )}
    </FormDrawer>
  );
}
