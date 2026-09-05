import { useMemo, useState } from 'react';
import Tabs from '../../components/ui/Tabs.jsx';
import PageToolbar from '../../components/ui/PageToolbar.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import StructureForm from './StructureForm.jsx';
import RuleForm from './RuleForm.jsx';
import { useStructures, useRules } from './api.js';
import { inr } from '../../lib/format.js';

const TABS = [
  { key: 'structures', label: 'Salary Structures' },
  { key: 'rules', label: 'Salary Rules' },
];
const COMPUTE_LABEL = { fixed: 'Fixed', percentage: 'Percentage', code: 'Formula' };
const CAT_CLS = {
  basic: 'bg-brand-light text-brand', allowance: 'bg-emerald-50 text-emerald-700',
  gross: 'bg-indigo-50 text-indigo-700', deduction: 'bg-rose-50 text-rose-600', net: 'bg-slate-100 text-slate-700',
};

export default function ConfigPage() {
  const [tab, setTab] = useState('structures');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  const { data: structures = [], isLoading: ls } = useStructures();
  const { data: rules = [], isLoading: lr } = useRules();

  const openNew = () => { setSelected(null); setOpen(true); };
  const openRow = (r) => { setSelected(r); setOpen(true); };

  const structRows = useMemo(
    () => structures.filter((s) => s.name?.toLowerCase().includes(search.toLowerCase())),
    [structures, search]
  );
  const ruleRows = useMemo(
    () => [...rules]
      .filter((r) => r.name?.toLowerCase().includes(search.toLowerCase()) || r.code?.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => (a.sequence ?? 100) - (b.sequence ?? 100)),
    [rules, search]
  );

  const structColumns = [
    { key: 'name', label: 'Structure', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'code', label: 'Code', render: (r) => <span className="font-mono text-xs text-muted">{r.code}</span> },
    { key: 'rules', label: 'Rules', render: (r) => `${r.rules?.length || 0} rules` },
    { key: 'active', label: 'Status', render: (r) => <StatusBadge status={r.active ? 'active' : 'inactive'} /> },
  ];

  const ruleColumns = [
    { key: 'sequence', label: 'Seq', className: 'w-12', render: (r) => <span className="text-muted">{r.sequence}</span> },
    { key: 'name', label: 'Rule', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'code', label: 'Code', render: (r) => <span className="font-mono text-xs text-muted">{r.code}</span> },
    { key: 'category', label: 'Category', render: (r) => <span className={`badge ${CAT_CLS[r.category] || ''}`}>{r.category}</span> },
    {
      key: 'compute', label: 'Computation',
      render: (r) =>
        r.computeType === 'fixed' ? inr(r.amountFixed)
        : r.computeType === 'percentage' ? `${r.percentage}% of ${r.percentBase}`
        : <span className="font-mono text-xs">{r.formula}</span>,
    },
    { key: 'type', label: 'Method', render: (r) => COMPUTE_LABEL[r.computeType] },
  ];

  return (
    <div>
      <Tabs tabs={TABS} active={tab} onChange={(t) => { setTab(t); setSearch(''); }} />
      <PageToolbar
        search={search} onSearch={setSearch}
        searchPlaceholder={tab === 'structures' ? 'Search structures…' : 'Search rules…'}
        onNew={openNew} newLabel={tab === 'structures' ? 'New Structure' : 'New Rule'}
      />
      {tab === 'structures' ? (
        <DataTable columns={structColumns} rows={structRows} loading={ls} onRowClick={openRow} empty="No salary structures yet." />
      ) : (
        <DataTable columns={ruleColumns} rows={ruleRows} loading={lr} onRowClick={openRow} empty="No salary rules yet." />
      )}

      {tab === 'structures'
        ? <StructureForm open={open} structure={selected} onClose={() => setOpen(false)} />
        : <RuleForm open={open} rule={selected} onClose={() => setOpen(false)} />}
    </div>
  );
}
