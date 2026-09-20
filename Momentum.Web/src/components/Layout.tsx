import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  Target,
  Layers,
  BrainCircuit,
  LogOut,
  Sparkles,
  Settings,
  Sun,
  Moon,
  X,
  UserCircle,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/goals', label: 'Goals', icon: Target, end: false },
  { to: '/plan', label: 'Plans', icon: Layers, end: false },
  { to: '/model', label: 'Personal Model', icon: BrainCircuit, end: false },
  { to: '/profile', label: 'Profile', icon: UserCircle, end: false },
];

function navClass(isActive: boolean, dark: boolean): string {
  return isActive
    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
    : dark
    ? 'text-slate-400 hover:bg-slate-700/70 hover:text-slate-100 font-medium'
    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-medium';
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg font-black text-white shadow-md shadow-indigo-600/30">
        M
      </div>
      <div>
        <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">Momentum</span>
        <span className="block text-[10px] font-semibold text-indigo-500 uppercase tracking-wider">AI Productivity</span>
      </div>
    </div>
  );
}

export default function Layout() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const isDark = theme === 'dark';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-[#f8f7f4] text-slate-900'}`}>

      {/* ── Desktop Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r px-5 py-6 md:flex transition-colors duration-300
        ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200/80 bg-white'}`}>

        <Brand />

        <div className={`mt-7 text-[11px] font-bold uppercase tracking-wider px-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
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
                  `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs transition-all ${navClass(isActive, isDark)}`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom: User Card + Settings */}
        <div className={`mt-auto pt-6 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
          {/* User card */}
          <div className={`flex items-center justify-between gap-2 rounded-2xl p-3 border mb-3
            ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-100'}`}>
            <div className="min-w-0 flex-1">
              <p className={`truncate text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.fullName || 'User'}</p>
              <p className={`truncate text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{user?.email}</p>
            </div>

            {/* Settings icon */}
            <button
              onClick={() => setSettingsOpen(true)}
              className={`rounded-lg p-1.5 transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-600 hover:text-slate-200' : 'text-slate-400 hover:bg-slate-200 hover:text-slate-700'}`}
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30 dark:hover:text-rose-400 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          <div className={`flex items-center justify-between text-[11px] px-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-indigo-500" />
              Adaptive Engine
            </span>
            <span>v1.0</span>
          </div>
        </div>
      </aside>

      {/* ── Mobile Header ── */}
      <header className={`sticky top-0 z-10 border-b backdrop-blur md:hidden
        ${isDark ? 'border-slate-700 bg-slate-800/95' : 'border-slate-200/80 bg-white/95'}`}>
        <div className="flex items-center justify-between px-4 py-3">
          <Brand />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSettingsOpen(true)}
              className={`rounded-lg p-1.5 ${isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              onClick={handleLogout}
              className={`rounded-lg p-1.5 ${isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
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
                  `flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${navClass(isActive, isDark)}`
                }
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </header>

      {/* ── Settings Panel (slide-in from right) ── */}
      {settingsOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
            onClick={() => setSettingsOpen(false)}
          />

          {/* Panel */}
          <div className={`fixed right-0 top-0 z-40 h-full w-80 shadow-2xl flex flex-col transition-colors duration-300
            ${isDark ? 'bg-slate-800 border-l border-slate-700' : 'bg-white border-l border-slate-200'}`}>

            {/* Panel header */}
            <div className={`flex items-center justify-between px-6 py-5 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-indigo-500" />
                <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Settings</span>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className={`rounded-lg p-1.5 transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-700 hover:text-slate-200' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

              {/* Theme toggle */}
              <div>
                <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Appearance
                </p>
                <div className={`flex items-center justify-between rounded-2xl p-4 border
                  ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    {isDark
                      ? <Moon className="h-5 w-5 text-indigo-400" />
                      : <Sun className="h-5 w-5 text-amber-500" />}
                    <div>
                      <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {isDark ? 'Dark Mode' : 'Light Mode'}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {isDark ? 'Switch to light theme' : 'Switch to dark theme'}
                      </p>
                    </div>
                  </div>

                  {/* Toggle switch */}
                  <button
                    onClick={toggleTheme}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none
                      ${isDark ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300
                        ${isDark ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
              </div>

              {/* Account info */}
              <div>
                <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Account
                </p>
                <div className={`rounded-2xl p-4 border space-y-2
                  ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                  <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.fullName || 'User'}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user?.email}</p>
                  {user?.profession && (
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user.profession}</p>
                  )}
                </div>
              </div>

              {/* Version */}
              <div>
                <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  About
                </p>
                <div className={`rounded-2xl p-4 border space-y-1
                  ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                  <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Momentum</p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Version 1.0 · AI Productivity Engine</p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Built for the 24h hackathon ⚡</p>
                </div>
              </div>
            </div>

            {/* Logout at bottom */}
            <div className={`px-6 py-5 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 px-4 py-2.5 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Main Content ── */}
      <main className="px-4 py-8 md:ml-64 md:px-10">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}