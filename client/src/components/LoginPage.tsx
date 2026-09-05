import React, { useState } from 'react';
import { LogIn, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-deepTeal flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-brand-darkTeal border border-brand-teal/40 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-brand-offWhite"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" className="text-brand-teal opacity-60" strokeDasharray="4 2" />
              <path d="M16 11V7a4 4 0 0 0-8 0v4" />
              <rect x="6" y="11" width="12" height="9" rx="2" fillOpacity="0.2" fill="currentColor" />
              <circle cx="12" cy="15.5" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <div>
            <div className="leading-none">
              <span className="font-extrabold text-lg tracking-tight text-brand-offWhite">PeoplePay</span>
              <span className="font-black text-lg tracking-tight text-brand-teal">360</span>
            </div>
            <span className="text-[10px] text-[#A7C8C2] font-semibold tracking-wider uppercase block mt-0.5">
              Integrated HR &amp; Payroll
            </span>
          </div>
        </div>

        {/* Card */}
        <form
          onSubmit={submit}
          className="bg-brand-offWhite rounded-2xl shadow-xl border border-brand-sandBorder p-7"
        >
          <h1 className="text-xl font-bold text-brand-darkCharcoal">Welcome back</h1>
          <p className="text-sm text-brand-mutedSlate mt-1 mb-6">Sign in to continue</p>

          <label className="block text-sm font-semibold text-brand-darkCharcoal mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full mb-4 px-3.5 py-2.5 rounded-lg border border-brand-sandBorder bg-white text-brand-darkCharcoal placeholder:text-brand-mutedSlate/60 focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal"
          />

          <label className="block text-sm font-semibold text-brand-darkCharcoal mb-1.5">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full mb-4 px-3.5 py-2.5 rounded-lg border border-brand-sandBorder bg-white text-brand-darkCharcoal placeholder:text-brand-mutedSlate/60 focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal"
          />

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-brand-warningBg text-brand-warningText px-3 py-2.5 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-darkTeal hover:bg-brand-teal disabled:opacity-60 text-brand-offWhite font-semibold py-2.5 transition-colors"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-[11px] text-[#A7C8C2] mt-5">
          Signing in unlocks contracts, attendance, time off and payroll configuration.
        </p>
      </div>
    </div>
  );
};
