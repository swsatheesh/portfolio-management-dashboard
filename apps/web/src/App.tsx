import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicOnlyRoute } from './components/auth/PublicOnlyRoute';
import { DashboardPage } from './pages/DashboardPage';
import { InvestmentsPage } from './pages/InvestmentsPage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { TransactionsPage } from './pages/TransactionsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />
          <Route
            path="/investments"
            element={<InvestmentsPage />}
          />
          <Route
            path="/transactions"
            element={<TransactionsPage />}
          />
        </Route>
      </Route>

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}