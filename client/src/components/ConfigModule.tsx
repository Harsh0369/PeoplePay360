import React, { useEffect, useState } from 'react';
import { Plus, Loader2, X, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import { configApi } from '../services/hrApi';
import { inr } from '../lib/format';
import { useAuth } from '../hooks/useAuth';
import { PERM } from '../lib/permissions';
import { useClientList } from '../hooks/usePagedList';
import { SearchBar } from './ui/SearchBar';
import { Paginator } from './ui/Paginator';
import { notify } from '../lib/toast';

type Tab = 'RULES' | 'STRUCTURES';

const CAT_BADGE: Record<string, string> = {
  BASIC: 'bg-brand-activeBg text-brand-activeText',
  ALLOWANCE: 'bg-brand-activeBg text-brand-activeText',
  DEDUCTION: 'bg-brand-warningBg text-brand-warningText',
  GROSS: 'bg-brand-leaveBg text-brand-leaveText',
  NET: 'bg-brand-draftBg text-brand-draftText',
};

const emptyRule = {
  name: '', code: '', category: 'BASIC', sequence: 100, amountType: 'FIXED', value: 0, formula: '',
};

export const ConfigModule: React.FC = () => {
  const { can } = useAuth();
  const canWrite = can(...PERM.configWrite);
  const [tab, setTab] = useState<Tab>('RULES');
  const [rules, setRules] = useState<any[]>([]);
  const [structures, setStructures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ruleForm, setRuleForm] = useState<any | null>(null);      // create OR edit a rule
  const [structForm, setStructForm] = useState<any | null>(null);  // create OR edit a structure

  const ruleList = useClientList(rules, { searchFields: ['name', 'code', 'category'], pageSize: 15 });
  const structList = useClientList(structures, { searchFields: ['name', 'code'], pageSize: 15 });
  const cl = tab === 'RULES' ? ruleList : structList;
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [r, s] = await Promise.all([configApi.getRules(), configApi.getStructures()]);
      setRules(Array.isArray(r) ? r : []);
      setStructures(Array.isArray(s) ? s : []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  // ---- Salary Rules ----
  const saveRule = async () => {
    const form = ruleForm;
    setSaving(true);
    try {
      const payload: any = {
        name: form.name, code: form.code.toUpperCase(), category: form.category,
        sequence: Number(form.sequence), amountType: form.amountType,
      };
      if (form.amountType === 'FORMULA') payload.formula = form.formula;
      else payload.value = Number(form.value);
      if (form._id) {
        await configApi.updateRule(form._id, payload);
        notify.success(`Salary rule "${payload.name}" updated.`);
      } else {
        await configApi.createRule(payload);
        notify.success(`Salary rule "${payload.name}" created.`);
      }
      setRuleForm(null);
      load();
    } catch (e: any) {
      notify.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteRule = async (r: any) => {
    if (!window.confirm(`Delete salary rule "${r.name}"? This cannot be undone.`)) return;
    try {
      await configApi.deleteRule(r._id);
      notify.success(`Salary rule "${r.name}" deleted.`);
      load();
    } catch (e: any) { notify.error(e.message); }
  };

  // ---- Salary Structures ----
  const saveStructure = async () => {
    const form = structForm;
    setSaving(true);
    try {
      const payload = { name: form.name, ruleIds: form.ruleIds || [] };
      if (form._id) {
        await configApi.updateStructure(form._id, payload);
        notify.success(`Structure "${payload.name}" updated.`);
      } else {
        await configApi.createStructure(payload);
        notify.success(`Structure "${payload.name}" created.`);
      }
      setStructForm(null);
      load();
    } catch (e: any) {
      notify.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteStructure = async (s: any) => {
    if (!window.confirm(`Delete structure "${s.name}"? This cannot be undone.`)) return;
    try {
      await configApi.deleteStructure(s._id);
      notify.success(`Structure "${s.name}" deleted.`);
      load();
    } catch (e: any) { notify.error(e.message); }
  };

  const set = (k: string) => (e: any) => setRuleForm((f: any) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-brand-darkCharcoal flex items-center gap-2">
            Payroll Configuration
          </h2>
          <p className="text-sm text-brand-mutedSlate">Salary rules &amp; structures that drive payslip computation.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-lg border border-brand-sandBorder text-brand-mutedSlate hover:bg-brand-hoverRow" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          {canWrite && tab === 'RULES' && (
            <button onClick={() => setRuleForm({ ...emptyRule })} className="flex items-center gap-2 bg-brand-darkTeal hover:bg-brand-teal text-brand-offWhite font-semibold px-4 py-2 rounded-lg text-sm">
              <Plus className="w-4 h-4" /> New Rule
            </button>
          )}
          {canWrite && tab === 'STRUCTURES' && (
            <button onClick={() => setStructForm({ name: '', ruleIds: [] })} className="flex items-center gap-2 bg-brand-darkTeal hover:bg-brand-teal text-brand-offWhite font-semibold px-4 py-2 rounded-lg text-sm">
              <Plus className="w-4 h-4" /> New Structure
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-brand-sandBorder mb-4">
        {(['RULES', 'STRUCTURES'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px ${tab === t ? 'border-brand-teal text-brand-darkTeal' : 'border-transparent text-brand-mutedSlate hover:text-brand-darkCharcoal'}`}>
            {t === 'RULES' ? 'Salary Rules' : 'Salary Structures'}
          </button>
        ))}
      </div>

      {error && <div className="mb-4 rounded-lg bg-brand-warningBg text-brand-warningText px-3 py-2.5 text-sm">{error}</div>}

      <div className="mb-3"><SearchBar value={cl.search} onChange={cl.setSearch} placeholder={tab === 'RULES' ? 'Search rules…' : 'Search structures…'} className="w-64" /></div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brand-teal" /></div>
      ) : (
        <>
          {tab === 'RULES'
            ? <RuleTable rules={cl.items} canWrite={canWrite} onEdit={(r) => setRuleForm({ ...emptyRule, ...r, value: r.value ?? 0, formula: r.formula ?? '' })} onDelete={deleteRule} />
            : <StructureTable structures={cl.items} canWrite={canWrite} onEdit={(s) => setStructForm({ _id: s._id, name: s.name, ruleIds: (s.ruleIds || []).map((x: any) => (typeof x === 'object' ? x._id : x)) })} onDelete={deleteStructure} />}
          <div className="mt-3 bg-white rounded-xl border border-slate-200/90">
            <Paginator page={cl.page} totalPages={cl.totalPages} totalItems={cl.totalItems} pageSize={cl.pageSize} onPage={cl.setPage} />
          </div>
        </>
      )}

      {/* Rule create/edit drawer */}
      {ruleForm && (
        <Drawer title={ruleForm._id ? 'Edit Salary Rule' : 'New Salary Rule'} onClose={() => setRuleForm(null)}
          footer={
            <>
              <button onClick={() => setRuleForm(null)} className="px-4 py-2 text-sm text-brand-mutedSlate">Cancel</button>
              <button onClick={saveRule} disabled={!ruleForm.name || !ruleForm.code || saving}
                className="flex items-center gap-2 bg-brand-darkTeal hover:bg-brand-teal text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save
              </button>
            </>
          }>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name"><input className="inp" value={ruleForm.name} onChange={set('name')} placeholder="House Rent Allowance" /></Field>
            <Field label="Code"><input className="inp" value={ruleForm.code} onChange={set('code')} placeholder="HRA" /></Field>
            <Field label="Category">
              <select className="inp" value={ruleForm.category} onChange={set('category')}>
                {['BASIC', 'ALLOWANCE', 'DEDUCTION', 'GROSS', 'NET'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Sequence"><input type="number" className="inp" value={ruleForm.sequence} onChange={set('sequence')} /></Field>
            <Field label="Amount Type">
              <select className="inp" value={ruleForm.amountType} onChange={set('amountType')}>
                <option value="FIXED">Fixed</option>
                <option value="PERCENTAGE">Percentage</option>
                <option value="FORMULA">Formula</option>
              </select>
            </Field>
            {ruleForm.amountType === 'FORMULA'
              ? <Field label="Formula"><input className="inp font-mono" value={ruleForm.formula} onChange={set('formula')} placeholder="BASIC * 0.4" /></Field>
              : <Field label={ruleForm.amountType === 'PERCENTAGE' ? 'Percentage (%)' : 'Amount (₹)'}><input type="number" className="inp" value={ruleForm.value} onChange={set('value')} /></Field>}
          </div>
        </Drawer>
      )}

      {/* Structure create/edit drawer */}
      {structForm && (
        <Drawer title={structForm._id ? 'Edit Salary Structure' : 'New Salary Structure'} onClose={() => setStructForm(null)}
          footer={
            <>
              <button onClick={() => setStructForm(null)} className="px-4 py-2 text-sm text-brand-mutedSlate">Cancel</button>
              <button onClick={saveStructure} disabled={!structForm.name || saving}
                className="flex items-center gap-2 bg-brand-darkTeal hover:bg-brand-teal text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save
              </button>
            </>
          }>
          <Field label="Name"><input className="inp" value={structForm.name} onChange={(e) => setStructForm((f: any) => ({ ...f, name: e.target.value }))} placeholder="Standard CTC" /></Field>
          <div className="mt-4">
            <span className="block text-sm font-semibold text-brand-darkCharcoal mb-2">Salary Rules ({(structForm.ruleIds || []).length} selected)</span>
            <div className="rounded-lg border border-brand-sandBorder max-h-72 overflow-y-auto divide-y divide-brand-sandBorder/60">
              {[...rules].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0)).map((r) => {
                const on = (structForm.ruleIds || []).includes(r._id);
                return (
                  <label key={r._id} className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-brand-hoverRow cursor-pointer">
                    <input type="checkbox" checked={on} onChange={() => setStructForm((f: any) => ({
                      ...f,
                      ruleIds: on ? f.ruleIds.filter((id: string) => id !== r._id) : [...(f.ruleIds || []), r._id],
                    }))} />
                    <span className="font-mono text-xs text-brand-mutedSlate w-14">{r.code}</span>
                    <span className="flex-1 text-brand-darkCharcoal">{r.name}</span>
                    <span className={`badge ${CAT_BADGE[r.category] || 'bg-brand-draftBg text-brand-draftText'}`}>{r.category}</span>
                  </label>
                );
              })}
              {rules.length === 0 && <div className="px-3 py-6 text-center text-sm text-brand-mutedSlate">Create salary rules first.</div>}
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
};

const RuleTable: React.FC<{ rules: any[]; canWrite: boolean; onEdit: (r: any) => void; onDelete: (r: any) => void }> = ({ rules, canWrite, onEdit, onDelete }) => (
  <Card>
    <Table head={['Seq', 'Rule', 'Code', 'Category', 'Computation', ...(canWrite ? [''] : [])]}>
      {[...rules].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0)).map((r) => (
        <tr key={r._id} className="border-b border-brand-sandBorder/60 last:border-0 hover:bg-brand-hoverRow">
          <td className="td text-brand-mutedSlate">{r.sequence}</td>
          <td className="td font-medium text-brand-darkCharcoal">{r.name}</td>
          <td className="td font-mono text-xs text-brand-mutedSlate">{r.code}</td>
          <td className="td"><span className={`badge ${CAT_BADGE[r.category] || 'bg-brand-draftBg text-brand-draftText'}`}>{r.category}</span></td>
          <td className="td">{r.amountType === 'FORMULA' ? <span className="font-mono text-xs">{r.formula}</span> : r.amountType === 'PERCENTAGE' ? `${r.value}%` : inr(r.value)}</td>
          {canWrite && <td className="td"><RowActions onEdit={() => onEdit(r)} onDelete={() => onDelete(r)} /></td>}
        </tr>
      ))}
      {rules.length === 0 && <EmptyRow cols={canWrite ? 6 : 5} msg="No salary rules yet." />}
    </Table>
  </Card>
);

const StructureTable: React.FC<{ structures: any[]; canWrite: boolean; onEdit: (s: any) => void; onDelete: (s: any) => void }> = ({ structures, canWrite, onEdit, onDelete }) => (
  <Card>
    <Table head={['Structure', 'Rules', 'Status', ...(canWrite ? [''] : [])]}>
      {structures.map((s) => (
        <tr key={s._id} className="border-b border-brand-sandBorder/60 last:border-0 hover:bg-brand-hoverRow">
          <td className="td font-medium text-brand-darkCharcoal">{s.name}</td>
          <td className="td">{(s.ruleIds || s.rules || s.salaryRuleIds || []).length} rules</td>
          <td className="td"><span className="badge bg-brand-activeBg text-brand-activeText">{s.isActive === false ? 'Inactive' : 'Active'}</span></td>
          {canWrite && <td className="td"><RowActions onEdit={() => onEdit(s)} onDelete={() => onDelete(s)} /></td>}
        </tr>
      ))}
      {structures.length === 0 && <EmptyRow cols={canWrite ? 4 : 3} msg="No salary structures yet." />}
    </Table>
  </Card>
);

// ---- tiny shared bits ----
export const RowActions: React.FC<{ onEdit: () => void; onDelete: () => void }> = ({ onEdit, onDelete }) => (
  <div className="flex items-center gap-1">
    <button onClick={onEdit} className="p-1.5 rounded-lg text-brand-mutedSlate hover:text-brand-darkTeal hover:bg-brand-activeBg" title="Edit"><Pencil className="w-4 h-4" /></button>
    <button onClick={onDelete} className="p-1.5 rounded-lg text-brand-mutedSlate hover:text-rose-600 hover:bg-rose-50" title="Delete"><Trash2 className="w-4 h-4" /></button>
  </div>
);
export const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-brand-offWhite rounded-xl border border-brand-sandBorder shadow-sm overflow-hidden overflow-x-auto">{children}</div>
);
export const Table: React.FC<{ head: string[]; children: React.ReactNode }> = ({ head, children }) => (
  <table className="w-full text-sm">
    <thead><tr className="bg-brand-softSand/50 text-left text-xs uppercase tracking-wide text-brand-mutedSlate">
      {head.map((h, i) => <th key={h || `c${i}`} className="px-4 py-3 font-semibold">{h}</th>)}
    </tr></thead>
    <tbody>{children}</tbody>
  </table>
);
export const EmptyRow: React.FC<{ cols: number; msg: string }> = ({ cols, msg }) => (
  <tr><td colSpan={cols} className="px-4 py-12 text-center text-brand-mutedSlate">{msg}</td></tr>
);
export const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block"><span className="block text-sm font-semibold text-brand-darkCharcoal mb-1.5">{label}</span>{children}</label>
);
export const Drawer: React.FC<{ title: string; onClose: () => void; footer: React.ReactNode; children: React.ReactNode }> = ({ title, onClose, footer, children }) => (
  <div className="fixed inset-0 z-50">
    <div className="absolute inset-0 bg-brand-darkCharcoal/30" onClick={onClose} />
    <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-brand-warmCream shadow-2xl flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 bg-brand-offWhite border-b border-brand-sandBorder">
        <h3 className="text-lg font-bold text-brand-darkCharcoal">{title}</h3>
        <button onClick={onClose} className="p-2 text-brand-mutedSlate hover:text-brand-darkCharcoal"><X className="w-5 h-5" /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      <div className="flex items-center justify-end gap-2 px-6 py-4 bg-brand-offWhite border-t border-brand-sandBorder">{footer}</div>
    </div>
  </div>
);
