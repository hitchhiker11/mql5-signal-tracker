import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/useAuth';
import { AuthGuard } from './auth/AuthGuard';
// Layouts
import DashboardLayout from './components/dashboard/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';

// Pages
import Home from './pages/Home';
import NotFound from './pages/NotFound';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import SignalManagement from './pages/admin/SignalManagement';
import AdminProfile from './pages/admin/Profile';

// User Pages
import UserDashboard from './pages/user/Dashboard';
import UserProfile from './pages/user/Profile';
import UserSignals from './pages/user/Signals';

const ProtectedRoute = ({ children, allowedRoles = ['user', 'admin'] }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default function Router() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />

      {/* Auth Routes */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AuthGuard allowedRoles={['admin']}>
            <AdminLayout />
          </AuthGuard>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="signals" element={<SignalManagement />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      {/* User Routes */}
      <Route
        path="/user"
        element={
          <AuthGuard allowedRoles={['user']}>
            <UserLayout />
          </AuthGuard>
        }
      >
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="signals" element={<UserSignals />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
