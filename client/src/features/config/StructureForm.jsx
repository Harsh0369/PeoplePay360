import { useEffect, useState } from 'react';
import FormDrawer from '../../components/ui/FormDrawer.jsx';
import { Field, TextInput, FormGrid } from '../../components/ui/Field.jsx';
import { useSaveStructure, useRules } from './api.js';

const EMPTY = { name: '', code: '', rules: [], active: true };
const CAT_COLOR = {
  basic: 'text-brand', allowance: 'text-emerald-600', gross: 'text-indigo-600',
  deduction: 'text-rose-600', net: 'text-ink',
};

export default function StructureForm({ open, structure, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const save = useSaveStructure();
  const { data: rules = [] } = useRules();

  useEffect(() => { setForm(structure ? { ...EMPTY, ...structure } : EMPTY); }, [structure, open]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const toggle = (id) =>
    setForm((f) => ({
      ...f,
      rules: f.rules.includes(id) ? f.rules.filter((r) => r !== id) : [...f.rules, id],
    }));

  const submit = async () => {
    await save.mutateAsync({ ...form, code: form.code.toUpperCase() });
    onClose();
  };

  const sortedRules = [...rules].sort((a, b) => (a.sequence ?? 100) - (b.sequence ?? 100));

  return (
    <FormDrawer
      open={open}
      title={structure?._id ? form.name || 'Structure' : 'New Salary Structure'}
      subtitle={`${form.rules.length} rules selected`}
      onClose={onClose}
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={!form.name || save.isPending}>
            {save.isPending ? 'Saving…' : 'Save'}
          </button>
        </>
      }
    >
      <FormGrid>
        <Field label="Name" required><TextInput value={form.name} onChange={set('name')} placeholder="e.g. Regular Salary" /></Field>
        <Field label="Code" required><TextInput value={form.code} onChange={set('code')} placeholder="REG" /></Field>
      </FormGrid>

      <div className="mt-6">
        <h3 className="mb-2 text-sm font-semibold">Included Rules (run in sequence order)</h3>
        <div className="card divide-y divide-line">
          {sortedRules.map((r) => (
            <label key={r._id} className="flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-brand-light/40">
              <input type="checkbox" checked={form.rules.includes(r._id)} onChange={() => toggle(r._id)} className="h-4 w-4 accent-[#4F46E5]" />
              <span className="w-8 text-xs text-muted">{r.sequence}</span>
              <span className="flex-1 font-medium">{r.name}</span>
              <span className="font-mono text-xs text-muted">{r.code}</span>
              <span className={`text-xs font-medium ${CAT_COLOR[r.category] || 'text-muted'}`}>{r.category}</span>
            </label>
          ))}
          {sortedRules.length === 0 && <div className="px-4 py-6 text-center text-sm text-muted">Create salary rules first.</div>}
        </div>
      </div>
    </FormDrawer>
  );
}
