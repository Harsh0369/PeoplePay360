import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCw, ShieldCheck, Plus } from 'lucide-react';
import { masterApi } from '../services/hrApi';
import { useAuth } from '../hooks/useAuth';
import { Card, Table, EmptyRow, Field, Drawer } from './ConfigModule';

// Canonical permission groups (mirrors the backend registry).
const PERMISSION_GROUPS: { label: string; keys: string[] }[] = [
  { label: 'Employee Management', keys: ['Employee.Read', 'Employee.Write'] },
  { label: 'Organization', keys: ['Organization.Read', 'Organization.Write'] },
  { label: 'Contracts', keys: ['Contract.Read', 'Contract.Write'] },
  { label: 'Attendance', keys: ['Attendance.Read', 'Attendance.Write'] },
  { label: 'Time Off', keys: ['TimeOff.Read', 'TimeOff.Write', 'TimeOff.Approve'] },
  { label: 'Payroll', keys: ['Payroll.Read', 'Payroll.Write'] },
  { label: 'Settings & Audit', keys: ['Settings.Read', 'Settings.Write', 'Audit.Read'] },
];

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
  const { can } = useAuth();
  const canWrite = can('admin', 'Settings.Write');
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<any>(null);
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true); setError('');
    try { const r = await masterApi.getRoles(); setRoles(Array.isArray(r) ? r : []); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const togglePerm = (key: string) => setForm((f: any) => ({ ...f, perms: { ...f.perms, [key]: !f.perms[key] } }));

  const saveRole = async () => {
    setSaving(true); setError('');
    try {
      const permissions: Record<string, boolean> = {};
      Object.entries(form.perms).forEach(([k, v]) => { if (v) permissions[k] = true; });
      await masterApi.createRole({ name: form.name, dataScope: form.dataScope, isAdmin: !!form.isAdmin, permissions });
      setForm(null); load();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-brand-darkCharcoal">Roles &amp; Permissions</h2>
          <p className="text-sm text-brand-mutedSlate">Role-based access control across the platform.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-lg border border-brand-sandBorder text-brand-mutedSlate hover:bg-brand-hoverRow"><RefreshCw className="w-4 h-4" /></button>
          {canWrite && (
            <button onClick={() => setForm({ name: '', dataScope: 'self', isAdmin: false, perms: {} })} className="flex items-center gap-2 bg-brand-darkTeal hover:bg-brand-teal text-brand-offWhite font-semibold px-4 py-2 rounded-lg text-sm">
              <Plus className="w-4 h-4" /> New Role
            </button>
          )}
        </div>
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

      {/* View drawer */}
      {view && (
        <Drawer title={view.name} onClose={() => setView(null)} footer={<button onClick={() => setView(null)} className="px-4 py-2 text-sm text-brand-mutedSlate ml-auto">Close</button>}>
          <p className="text-sm text-brand-mutedSlate mb-4">Data scope: <span className="font-semibold text-brand-darkCharcoal">{view.dataScope || '—'}</span></p>
          <h4 className="text-sm font-semibold text-brand-darkCharcoal mb-2">Granted Permissions</h4>
          {view._perms.length === 0 ? <p className="text-sm text-brand-mutedSlate">No explicit permissions.</p> : (
            <div className="flex flex-wrap gap-2">{view._perms.map((p: string) => <span key={p} className="badge bg-brand-activeBg text-brand-activeText font-mono">{p}</span>)}</div>
          )}
        </Drawer>
      )}

      {/* Create drawer */}
      {form && (
        <Drawer title="New Role" onClose={() => setForm(null)}
          footer={<>
            <button onClick={() => setForm(null)} className="px-4 py-2 text-sm text-brand-mutedSlate">Cancel</button>
            <button onClick={saveRole} disabled={!form.name || saving} className="flex items-center gap-2 bg-brand-darkTeal hover:bg-brand-teal text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">{saving && <Loader2 className="w-4 h-4 animate-spin" />} Create Role</button>
          </>}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Role Name"><input className="inp" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Team Lead" /></Field>
            <Field label="Data Scope">
              <select className="inp" value={form.dataScope} onChange={(e) => setForm({ ...form, dataScope: e.target.value })}>
                <option value="self">Self only</option>
                <option value="subordinates">Subordinates</option>
                <option value="all">All records</option>
              </select>
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm mt-3">
            <input type="checkbox" checked={form.isAdmin} onChange={(e) => setForm({ ...form, isAdmin: e.target.checked })} /> Super admin (grants everything)
          </label>

          {!form.isAdmin && (
            <div className="mt-5">
              <h4 className="text-sm font-semibold text-brand-darkCharcoal mb-2">Permissions</h4>
              <div className="space-y-3">
                {PERMISSION_GROUPS.map((g) => (
                  <div key={g.label} className="rounded-lg border border-brand-sandBorder p-3">
                    <div className="text-xs font-semibold text-brand-mutedSlate mb-2">{g.label}</div>
                    <div className="flex flex-wrap gap-3">
                      {g.keys.map((k) => (
                        <label key={k} className="flex items-center gap-1.5 text-sm">
                          <input type="checkbox" checked={!!form.perms[k]} onChange={() => togglePerm(k)} />
                          <span className="font-mono text-xs">{k}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Drawer>
      )}
    </div>
  );
};
