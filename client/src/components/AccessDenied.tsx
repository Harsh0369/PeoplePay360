import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { roleLabel } from '../services/auth';
import { useAuth } from '../hooks/useAuth';

export const AccessDenied: React.FC<{ title?: string }> = ({ title = 'this section' }) => {
  const { user } = useAuth();
  return (
    <div className="px-6 lg:px-8 py-16">
      <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200/90 shadow-sm p-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 grid place-items-center mx-auto mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
        <p className="text-sm text-slate-500 mt-1.5">
          Your role (<strong className="text-slate-700">{roleLabel(user)}</strong>) doesn’t have permission to view {title}.
        </p>
        <p className="text-xs text-slate-400 mt-4">Contact an administrator if you need access.</p>
      </div>
    </div>
  );
};
