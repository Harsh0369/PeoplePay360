import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, RefreshCw, ShieldAlert } from 'lucide-react';
import { Card, Table, EmptyRow } from './ConfigModule';
import { Paginator } from './ui/Paginator';
import { fetchPaged } from '../lib/paged';

const PAGE_SIZE = 20;
const ENTITIES = ['ATTENDANCE', 'EMPLOYEE', 'LEAVE', 'CONTRACT', 'PAYROLL'];
const ACTIONS = ['CREATE', 'UPDATE', 'DELETE', 'OVERRIDE', 'APPROVE', 'REJECT'];

const ACTION_BADGE: Record<string, string> = {
  CREATE: 'bg-brand-activeBg text-brand-activeText',
  UPDATE: 'bg-brand-draftBg text-brand-draftText',
  DELETE: 'bg-brand-warningBg text-brand-warningText',
  OVERRIDE: 'bg-brand-leaveBg text-brand-leaveText',
  APPROVE: 'bg-brand-activeBg text-brand-activeText',
  REJECT: 'bg-brand-warningBg text-brand-warningText',
};
const nameOf = (v: any) => (v && typeof v === 'object' ? v.name : v) || '—';
const fmt = (d?: string) => (d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—');

export const AuditModule: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [info, setInfo] = useState({ page: 1, totalPages: 1, totalItems: 0, pageSize: PAGE_SIZE });
  const [loading, setLoading] = useState(true);
  const [entity, setEntity] = useState('');
  const [action, setAction] = useState('');

  const loadPage = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const extra = new URLSearchParams();
      if (entity) extra.set('entity', entity);
      if (action) extra.set('action', action);
      
      const res = await fetchPaged('/business-logs', { page, limit: PAGE_SIZE, extra: extra.toString() });
      
      setRows(res.items);
      setInfo({
        page: res.pagination.currentPage,
        totalPages: res.pagination.totalPages,
        totalItems: res.pagination.totalItems,
        pageSize: res.pagination.pageSize,
      });
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [entity, action]);

  useEffect(() => { loadPage(1); }, [loadPage]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-brand-darkCharcoal flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-brand-teal" /> Audit Trail</h2>
          <p className="text-sm text-brand-mutedSlate">Every create, update, override and approval — who did what, and when.</p>
        </div>
        <button onClick={() => loadPage(info.page)} className="p-2 rounded-lg border border-brand-sandBorder text-brand-mutedSlate hover:bg-brand-hoverRow"><RefreshCw className="w-4 h-4" /></button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select className="inp w-48" value={entity} onChange={(e) => setEntity(e.target.value)}>
          <option value="">All entities</option>
          {ENTITIES.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
        <select className="inp w-48" value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="">All actions</option>
          {ACTIONS.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
        {(entity || action) && (
          <button onClick={() => { setEntity(''); setAction(''); }} className="text-sm text-brand-teal hover:underline">Clear filters</button>
        )}
        <span className="text-sm text-brand-mutedSlate ml-auto">{info.totalItems.toLocaleString('en-IN')} events</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brand-teal" /></div>
      ) : (
        <Card>
          <Table head={['When', 'Actor', 'Action', 'Entity', 'Affected', 'Detail']}>
            {rows.map((r) => (
              <tr key={r._id} className="border-b border-brand-sandBorder/60 last:border-0 hover:bg-brand-hoverRow align-top">
                <td className="td whitespace-nowrap text-brand-mutedSlate">{fmt(r.createdAt)}</td>
                <td className="td font-medium text-brand-darkCharcoal">{nameOf(r.actorId)}</td>
                <td className="td"><span className={`badge ${ACTION_BADGE[r.action] || 'bg-brand-draftBg text-brand-draftText'}`}>{r.action}</span></td>
                <td className="td font-mono text-xs text-brand-mutedSlate">{r.entity}</td>
                <td className="td">{nameOf(r.affectedEmployeeId)}</td>
                <td className="td max-w-md text-brand-darkCharcoal">{r.content}</td>
              </tr>
            ))}
            {rows.length === 0 && <EmptyRow cols={6} msg="No audit events match these filters." />}
          </Table>
          <Paginator page={info.page} totalPages={info.totalPages} totalItems={info.totalItems} pageSize={info.pageSize} onPage={loadPage} />
        </Card>
      )}
    </div>
  );
};
