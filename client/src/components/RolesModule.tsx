import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import { masterApi } from '../services/hrApi';
import { Card, Table, EmptyRow, Drawer } from './ConfigModule';

// Flattens the role.permissions object into a list of granted permission strings.
function grantedPerms(permissions: any): string[] {
  if (!permissions) return [];
  if (Array.isArray(permissions)) return permissions;
  const out: string[] = [];
  for (const [k, v] of Object.entries(permissions)) {
    if (v === true) out.push(k);
    else if (Array.isArray(v)) v.forEach((a) => out.push(`${k}.${a}`));
    else if (v && typeof v === 'object') for (const [a, on] of Object.entries(v)) if (on) out.push(`${k}.${a}`);
  }
  return out;
}

export const RolesModule: React.FC = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<any>(null);

  const load = async () => {
    setLoading(true); setError('');
    try { const r = await masterApi.getRoles(); setRoles(Array.isArray(r) ? r : []); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-brand-darkCharcoal">Roles &amp; Permissions</h2>
          <p className="text-sm text-brand-mutedSlate">Role-based access control across the platform.</p>
        </div>
        <button onClick={load} className="p-2 rounded-lg border border-brand-sandBorder text-brand-mutedSlate hover:bg-brand-hoverRow"><RefreshCw className="w-4 h-4" /></button>
      </div>

      {error && <div className="mb-4 rounded-lg bg-brand-warningBg text-brand-warningText px-3 py-2.5 text-sm">{error}</div>}

      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brand-teal" /></div> : (
        <Card><Table head={['Role', 'Data Scope', 'Permissions', '']}>
          {roles.map((r) => {
            const perms = grantedPerms(r.permissions);
            return (
              <tr key={r._id} className="border-b border-brand-sandBorder/60 last:border-0 hover:bg-brand-hoverRow cursor-pointer" onClick={() => setView({ ...r, _perms: perms })}>
                <td className="td font-medium text-brand-darkCharcoal flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-brand-teal" /> {r.name}</td>
                <td className="td">{r.dataScope || '—'}</td>
                <td className="td">{r.isAdmin || perms.includes('admin') ? <span className="badge bg-brand-activeBg text-brand-activeText">All (admin)</span> : `${perms.length} granted`}</td>
                <td className="td text-brand-teal text-xs">View</td>
              </tr>
            );
          })}
          {roles.length === 0 && <EmptyRow cols={4} msg="No roles found." />}
        </Table></Card>
      )}

      {view && (
        <Drawer title={view.name} onClose={() => setView(null)} footer={<button onClick={() => setView(null)} className="px-4 py-2 text-sm text-brand-mutedSlate ml-auto">Close</button>}>
          <p className="text-sm text-brand-mutedSlate mb-4">Data scope: <span className="font-semibold text-brand-darkCharcoal">{view.dataScope || '—'}</span></p>
          <h4 className="text-sm font-semibold text-brand-darkCharcoal mb-2">Granted Permissions</h4>
          {view._perms.length === 0 ? <p className="text-sm text-brand-mutedSlate">No explicit permissions.</p> : (
            <div className="flex flex-wrap gap-2">
              {view._perms.map((p: string) => <span key={p} className="badge bg-brand-activeBg text-brand-activeText font-mono">{p}</span>)}
            </div>
          )}
        </Drawer>
      )}
    </div>
  );
};
