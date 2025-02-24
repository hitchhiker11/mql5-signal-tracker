import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

export default function AuthGuard({ children, requireAdmin }) {
  const { user } = useAuth();
  const { pathname } = useLocation();

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: pathname }} replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/404" replace />;
  }

  return <>{children}</>;
}
