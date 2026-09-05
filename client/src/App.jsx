import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './lib/auth.jsx';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import LoginPage from './features/auth/LoginPage.jsx';
import UsersPage from './features/auth/UsersPage.jsx';
import EmployeesPage from './features/employees/EmployeesPage.jsx';
import ContractsPage from './features/contracts/ContractsPage.jsx';
import SchedulesPage from './features/schedules/SchedulesPage.jsx';
import ConfigPage from './features/config/ConfigPage.jsx';
import AttendancePage from './features/attendance/AttendancePage.jsx';
import TimeOffPage from './features/timeoff/TimeOffPage.jsx';
import PayrollPage from './features/payroll/PayrollPage.jsx';
import PayrunView from './features/payroll/PayrunView.jsx';

function RequireAuth({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="contracts" element={<ContractsPage />} />
        <Route path="schedules" element={<SchedulesPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="timeoff" element={<TimeOffPage />} />
        <Route path="payroll" element={<PayrollPage />} />
        <Route path="payroll/:id" element={<PayrunView />} />
        <Route path="config" element={<ConfigPage />} />
        <Route path="users" element={<UsersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
