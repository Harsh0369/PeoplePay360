import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../lib/auth.jsx';

const DEMO = [
  { email: 'admin@urban.co', role: 'Admin' },
  { email: 'hr@urban.co', role: 'HR Manager' },
  { email: 'payroll@urban.co', role: 'Payroll Manager' },
  { email: 'rahul@urban.co', role: 'Employee' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('admin@urban.co');
  const [password, setPassword] = useState('demo');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await login(email, password);
      nav('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-sidebar p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3 text-white">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-xl font-bold">P</div>
          <div>
            <div className="text-lg font-semibold">PeoplePay360</div>
            <div className="text-xs text-white/50">HR &amp; Payroll</div>
          </div>
        </div>

        <form onSubmit={submit} className="card p-6">
          <h1 className="mb-1 text-xl font-semibold">Welcome back</h1>
          <p className="mb-5 text-sm text-muted">Sign in to your account</p>

          <label className="mb-1.5 block text-sm font-medium">Email</label>
          <input className="input mb-4" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          <label className="mb-1.5 block text-sm font-medium">Password</label>
          <input className="input mb-4" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" />

          {error && <div className="mb-4 rounded-lg bg-rose-50 p-2.5 text-sm text-rose-600">{error}</div>}

          <button className="btn-primary w-full justify-center" disabled={busy}>
            <LogIn size={16} /> {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 rounded-lg bg-white/5 p-3 text-xs text-white/60">
          <div className="mb-1 font-medium text-white/80">Demo accounts (password: demo)</div>
          {DEMO.map((d) => (
            <button key={d.email} onClick={() => setEmail(d.email)} className="mr-2 mt-1 rounded bg-white/10 px-2 py-1 hover:bg-white/20">
              {d.role}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
