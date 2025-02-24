import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';

// Layouts
import DashboardLayout from './components/dashboard/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Dashboard from './pages/Dashboard';
import SignalsList from './pages/SignalsList';
import UserSignals from './pages/UserSignals';
import UsersList from './pages/UsersList';
import Profile from './pages/Profile';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }

  return children;
};

export default function Router() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="signals" element={<SignalsList />} />
        <Route path="my-signals" element={<UserSignals />} />
        <Route path="users" element={<UsersList />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Redirect unknown routes to dashboard */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
