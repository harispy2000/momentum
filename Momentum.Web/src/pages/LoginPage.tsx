import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { ArrowRight, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid login credentials.');
    }
  };

  const handleDemoFill = () => {
    setEmail('demo@momentum.app');
    setPassword('DemoUser123!');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f6f2] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-black text-white shadow-lg shadow-indigo-600/25">
            M
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">Momentum</h1>
          <p className="mt-1 text-sm text-slate-600 font-medium">Adaptive Execution Intelligence</p>
        </div>

        {/* Card */}
        <div className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50">
          <div className="flex items-center justify-between pb-5 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Sign in</h2>
              <p className="text-xs text-slate-500">Access your adaptive workspace</p>
            </div>
            <button
              type="button"
              onClick={handleDemoFill}
              className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Fill Demo User
            </button>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200/60">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/15"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/15"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50 transition-all"
            >
              {loading ? 'Authenticating...' : 'Sign in to Momentum'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-2">
              Create an account
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-8 grid grid-cols-2 gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>AI Goal-to-Plan decomposition</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Honest personal behavioral model</span>
          </div>
        </div>
      </div>
    </div>
  );
}
