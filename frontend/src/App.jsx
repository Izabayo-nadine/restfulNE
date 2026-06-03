import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Extinguishers from './pages/Extinguishers';
import Inspections from './pages/Inspections';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Users from './pages/Users';
import Notifications from './pages/Notifications';

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="extinguishers" element={<Extinguishers />} />
        <Route path="inspections" element={<Inspections />} />
        <Route
          path="maintenance"
          element={
            <PrivateRoute roles={['admin', 'inspector']}>
              <Maintenance />
            </PrivateRoute>
          }
        />
        <Route
          path="reports"
          element={
            <PrivateRoute roles={['admin', 'inspector']}>
              <Reports />
            </PrivateRoute>
          }
        />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />
        <Route
          path="users"
          element={
            <PrivateRoute roles={['admin']}>
              <Users />
            </PrivateRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
