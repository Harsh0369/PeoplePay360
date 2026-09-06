import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCw, ShieldCheck, Plus, Pencil, Trash2 } from 'lucide-react';
import { masterApi } from '../services/hrApi';
import { useAuth } from '../hooks/useAuth';
import { Card, Table, EmptyRow, Field, Drawer } from './ConfigModule';
import { useClientList } from '../hooks/usePagedList';
import { SearchBar } from './ui/SearchBar';
import { Paginator } from './ui/Paginator';
import { notify } from '../lib/toast';

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

const ROLE_SEARCH = ['name', 'dataScope'];
const USER_SEARCH = ['email', 'employeeId.name', 'roleId.name'];

export const RolesModule: React.FC = () => {
  const { can } = useAuth();
  const canWrite = can('admin', 'Settings.Write');
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<any>(null);
  const [form, setForm] = useState<any>(null);
  const [userForm, setUserForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'ROLES' | 'USERS'>('ROLES');
  const [users, setUsers] = useState<any[]>([]);
  
  const cl = useClientList(roles, { searchFields: ROLE_SEARCH, pageSize: 15 });
  const userList = useClientList(users, { searchFields: USER_SEARCH, pageSize: 15 });

  const load = async () => {
    setLoading(true); setError('');
    try { 
      const r = await masterApi.getRoles(); setRoles(Array.isArray(r) ? r : []); 
      const u = await masterApi.getUsers(); setUsers(Array.isArray(u) ? u : []);
    }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const togglePerm = (key: string) => setForm((f: any) => ({ ...f, perms: { ...f.perms, [key]: !f.perms[key] } }));

  const editRole = (r: any) => {
    const perms: Record<string, boolean> = {};
    grantedPerms(r.permissions).forEach((p) => { if (p !== 'admin') perms[p] = true; });
    setForm({ _id: r._id, name: r.name, dataScope: r.dataScope || 'self', isAdmin: !!r.isAdmin, perms });
  };

  const editUser = (u: any) => {
    if (u.roleId?.isAdmin) {
      notify.error("Cannot set custom permissions on Admin users");
      return;
    }
    const perms: Record<string, boolean> = {};
    if (u.customPermissions) {
      for (const [k, v] of Object.entries(u.customPermissions)) {
        if (v !== undefined) perms[k] = Boolean(v);
      }
    }
    setUserForm({ _id: u._id, email: u.email, perms });
  };

  const saveRole = async () => {
    setSaving(true); setError('');
    try {
      const permissions: Record<string, boolean> = {};
      Object.entries(form.perms).forEach(([k, v]) => { if (v) permissions[k] = true; });
      const body = { name: form.name, dataScope: form.dataScope, isAdmin: !!form.isAdmin, permissions };
      if (form._id) {
        await masterApi.updateRole(form._id, body);
        notify.success(`Role "${form.name}" updated.`);
      } else {
        await masterApi.createRole(body);
        notify.success(`Role "${form.name}" created.`);
      }
      setForm(null); load();
    } catch (e: any) { notify.error(e.message); }
    finally { setSaving(false); }
  };

  const saveUser = async () => {
    setSaving(true); setError('');
    try {
      // Send the entire perms object, which includes true for Allow and false for Deny.
      await masterApi.updateUserRole(userForm._id, undefined, userForm.perms);
      notify.success(`Custom permissions for "${userForm.email}" updated.`);
      setUserForm(null); load();
    } catch (e: any) { notify.error(e.message); }
    finally { setSaving(false); }
  };

  const deleteRole = async (r: any) => {
    if (!window.confirm(`Delete role "${r.name}"? Users assigned to it may lose access.`)) return;
    try {
      await masterApi.deleteRole(r._id);
      notify.success(`Role "${r.name}" deleted.`);
      load();
    } catch (e: any) { notify.error(e.message); }
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
          {canWrite && activeTab === 'ROLES' && (
            <button onClick={() => setForm({ name: '', dataScope: 'self', isAdmin: false, perms: {} })} className="flex items-center gap-2 bg-brand-darkTeal hover:bg-brand-teal text-brand-offWhite font-semibold px-4 py-2 rounded-lg text-sm">
              <Plus className="w-4 h-4" /> New Role
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-4 border-b border-brand-sandBorder mb-6">
        <button
          onClick={() => setActiveTab('ROLES')}
          className={`pb-2 px-1 text-sm font-semibold transition-colors ${
            activeTab === 'ROLES'
              ? 'border-b-2 border-brand-darkTeal text-brand-darkTeal'
              : 'text-brand-mutedSlate hover:text-brand-darkCharcoal'
          }`}
        >
          Roles
        </button>
        <button
          onClick={() => setActiveTab('USERS')}
          className={`pb-2 px-1 text-sm font-semibold transition-colors ${
            activeTab === 'USERS'
              ? 'border-b-2 border-brand-darkTeal text-brand-darkTeal'
              : 'text-brand-mutedSlate hover:text-brand-darkCharcoal'
          }`}
        >
          Assign Users
        </button>
      </div>

      {error && <div className="mb-4 rounded-lg bg-brand-warningBg text-brand-warningText px-3 py-2.5 text-sm">{error}</div>}

      <div className="mb-3">
        {activeTab === 'ROLES' ? (
          <SearchBar 
            value={cl.search} 
            onChange={cl.setSearch} 
            placeholder="Search roles…" 
            className="w-64" 
          />
        ) : (
          <SearchBar 
            value={userList.search} 
            onChange={userList.setSearch} 
            placeholder="Search users…" 
            className="w-64" 
          />
        )}
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brand-teal" /></div> : (
        <>
          {activeTab === 'ROLES' && (
            <Card><Table head={['Role', 'Data Scope', 'Permissions', '']}>
              {cl.items.map((r) => {
                const perms = grantedPerms(r.permissions);
                return (
                  <tr key={r._id} className="border-b border-brand-sandBorder/60 last:border-0 hover:bg-brand-hoverRow cursor-pointer" onClick={() => setView({ ...r, _perms: perms })}>
                    <td className="td font-medium text-brand-darkCharcoal flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-brand-teal" /> {r.name}</td>
                    <td className="td">{r.dataScope || '—'}</td>
                    <td className="td">{r.isAdmin || perms.includes('admin') ? <span className="badge bg-brand-activeBg text-brand-activeText">All (admin)</span> : `${perms.length} granted`}</td>
                    <td className="td" onClick={(e) => e.stopPropagation()}>
                      {canWrite ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => editRole(r)} className="p-1.5 rounded-lg text-brand-mutedSlate hover:text-brand-darkTeal hover:bg-brand-activeBg" title="Edit"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => deleteRole(r)} className="p-1.5 rounded-lg text-brand-mutedSlate hover:text-rose-600 hover:bg-rose-50" title="Delete"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ) : <span className="text-brand-teal text-xs">View</span>}
                    </td>
                  </tr>
                );
              })}
              {roles.length === 0 && <EmptyRow cols={4} msg="No roles found." />}
              <tr><td colSpan={4} className="p-0"><Paginator page={cl.page} totalPages={cl.totalPages} totalItems={cl.totalItems} pageSize={cl.pageSize} onPage={cl.setPage} /></td></tr>
            </Table></Card>
          )}

          {activeTab === 'USERS' && (
            <Card><Table head={['User Email', 'Linked Employee', 'Role', '']}>
              {userList.items.map((u) => (
                <tr key={u._id} className="border-b border-brand-sandBorder/60 last:border-0 hover:bg-brand-hoverRow">
                  <td className="td font-medium text-brand-darkCharcoal">{u.email}</td>
                  <td className="td">{u.employeeId?.name || '—'}</td>
                  <td className="td font-medium">{u.roleId?.name || '—'}</td>
                  <td className="td">
                    {canWrite && (
                      <div className="flex items-center gap-2">
                        <select 
                          className="inp py-1 text-sm"
                          value={u.roleId?._id || ''}
                          onChange={async (e) => {
                            try {
                              await masterApi.updateUserRole(u._id, e.target.value);
                              notify.success("User role updated successfully");
                              load();
                            } catch (err: any) {
                              notify.error(err.message);
                            }
                          }}
                        >
                          <option value="" disabled>Select Role</option>
                          {roles.map(r => (
                            <option key={r._id} value={r._id}>{r.name}</option>
                          ))}
                        </select>
                        <button onClick={() => editUser(u)} className="p-1.5 rounded-lg text-brand-mutedSlate hover:text-brand-darkTeal hover:bg-brand-activeBg" title="Custom Permissions"><Pencil className="w-4 h-4" /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && <EmptyRow cols={4} msg="No users found." />}
              <tr><td colSpan={4} className="p-0"><Paginator page={userList.page} totalPages={userList.totalPages} totalItems={userList.totalItems} pageSize={userList.pageSize} onPage={userList.setPage} /></td></tr>
            </Table></Card>
          )}
        </>
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

      {/* Custom Permissions Drawer */}
      {userForm && (
        <Drawer title={`Custom Permissions: ${userForm.email}`} onClose={() => setUserForm(null)}
          footer={<>
            <button onClick={() => setUserForm(null)} className="px-4 py-2 text-sm text-brand-mutedSlate">Cancel</button>
            <button onClick={saveUser} disabled={saving} className="flex items-center gap-2 bg-brand-darkTeal hover:bg-brand-teal text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">{saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Permissions</button>
          </>}>
          <div className="text-sm text-brand-mutedSlate mb-4">
            These permissions override the user's role permissions. Admin users cannot have custom permissions.
          </div>
          <div className="space-y-3">
            {PERMISSION_GROUPS.map((g) => (
              <div key={g.label} className="rounded-lg border border-brand-sandBorder p-3">
                <div className="text-xs font-semibold text-brand-mutedSlate mb-2">{g.label}</div>
                <div className="flex flex-col gap-2">
                  {g.keys.map((k) => (
                    <div key={k} className="flex items-center justify-between text-sm">
                      <span className="font-mono text-xs">{k}</span>
                      <select 
                        className="inp py-1 px-2 text-xs w-28"
                        value={userForm.perms[k] === true ? 'allow' : userForm.perms[k] === false ? 'deny' : 'inherit'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setUserForm((f: any) => {
                            const newPerms = { ...f.perms };
                            if (val === 'inherit') delete newPerms[k];
                            else newPerms[k] = val === 'allow';
                            return { ...f, perms: newPerms };
                          });
                        }}
                      >
                        <option value="inherit">Inherit</option>
                        <option value="allow">Allow (+)</option>
                        <option value="deny">Deny (-)</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Drawer>
      )}

      {/* Create / edit drawer */}
      {form && (
        <Drawer title={form._id ? 'Edit Role' : 'New Role'} onClose={() => setForm(null)}
          footer={<>
            <button onClick={() => setForm(null)} className="px-4 py-2 text-sm text-brand-mutedSlate">Cancel</button>
            <button onClick={saveRole} disabled={!form.name || saving} className="flex items-center gap-2 bg-brand-darkTeal hover:bg-brand-teal text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">{saving && <Loader2 className="w-4 h-4 animate-spin" />} {form._id ? 'Save Changes' : 'Create Role'}</button>
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
