import { Navigate, useRoutes } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import SignalManagement from './pages/admin/SignalManagement';

// User pages
import UserDashboard from './pages/user/Dashboard';
import UserProfile from './pages/user/Profile';
import UserSignals from './pages/user/Signals';

// Other pages
import Home from './pages/Home';
import NotFound from './pages/NotFound';

export default function Router() {
  return useRoutes([
    {
      path: '/auth',
      element: <AuthLayout />,
      children: [
        { path: 'login', element: <Login /> },
        { path: 'register', element: <Register /> },
        { path: 'forgot-password', element: <ForgotPassword /> },
      ],
    },
    {
      path: '/admin',
      element: <AdminLayout />,
      children: [
        { path: '', element: <Navigate to="/admin/dashboard" replace /> },
        { path: 'dashboard', element: <AdminDashboard /> },
        { path: 'users', element: <UserManagement /> },
        { path: 'signals', element: <SignalManagement /> },
      ],
    },
    {
      path: '/user',
      element: <UserLayout />,
      children: [
        { path: '', element: <Navigate to="/user/dashboard" replace /> },
        { path: 'dashboard', element: <UserDashboard /> },
        { path: 'profile', element: <UserProfile /> },
        { path: 'signals', element: <UserSignals /> },
      ],
    },
    {
      path: '/',
      element: <MainLayout />,
      children: [
        { path: '', element: <Home /> },
        { path: '404', element: <NotFound /> },
        { path: '*', element: <Navigate to="/404" replace /> },
      ],
    },
  ]);
}
