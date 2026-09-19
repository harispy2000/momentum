import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import {
  LayoutDashboard,
  Target,
  Layers,
  BrainCircuit,
  LogOut,
  Sparkles
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/goals', label: 'Goals', icon: Target, end: false },
  { to: '/plan', label: 'Plans', icon: Layers, end: false },
  { to: '/model', label: 'Personal Model', icon: BrainCircuit, end: false },
];

function navClass(isActive: boolean): string {
  return isActive
    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-medium';
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-lg font-black text-white shadow-md shadow-indigo-600/25">
        M
      </div>
      <div>
        <span className="text-base font-extrabold tracking-tight text-slate-900">Momentum</span>
        <span className="block text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">Review 1 MVP</span>
      </div>
    </div>
  );
}

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-slate-200/80 bg-white px-5 py-6 md:flex">
        <Brand />

        <div className="mt-7 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
          Navigation
        </div>

        <nav className="mt-2 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs transition-all ${navClass(
                    isActive
                  )}`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout at bottom */}
        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between gap-2 rounded-2xl bg-slate-50 p-3 border border-slate-100">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-900">{user?.fullName || 'User'}</p>
              <p className="truncate text-[11px] text-slate-400">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-indigo-500" />
              Adaptive Engine
            </span>
            <span>v1.0</span>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/95 backdrop-blur md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Brand />
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-4 pb-2.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${navClass(
                    isActive
                  )}`
                }
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </header>

      {/* Main Page Content */}
      <main className="px-4 py-8 md:ml-64 md:px-10">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}