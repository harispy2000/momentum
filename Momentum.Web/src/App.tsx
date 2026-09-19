import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import GoalsPage from './pages/GoalsPage';
import PlanPage from './pages/PlanPage';
import PersonalModelPage from './pages/PersonalModelPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, initialized, loading } = useAuthStore();

  if (!initialized && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f7f4]">
        <div className="text-center">
          <div className="inline-flex h-10 w-10 animate-spin items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
            M
          </div>
          <p className="mt-3 text-xs font-semibold text-slate-500">Loading Momentum...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected App Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="plan" element={<PlanPage />} />
          <Route path="model" element={<PersonalModelPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
