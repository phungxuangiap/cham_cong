import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './app/hooks';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import HRDashboard from './pages/HRDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeNoAccountDashboard from './pages/EmployeeNoAccountDashboard';

// Protected Route Component with Role-based Dashboard
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAppSelector((state: any) => state.auth);
  return user ? <>{children}</> : <Navigate to="/login" />;
};

// Dashboard Router based on user role
const DashboardRouter = () => {
  const { user } = useAppSelector((state: any) => state.auth);

  if (!user) {
    return <Navigate to="/login" />;
  }

  switch (user.role) {
    case 'Admin':
      return <AdminDashboard />;
    case 'HR':
      return <HRDashboard />;
    case 'Employee':
      return <EmployeeDashboard />;
    case 'Employee_none_account':
      return <EmployeeNoAccountDashboard />;
    default:
      return <EmployeeDashboard />;
  }
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
