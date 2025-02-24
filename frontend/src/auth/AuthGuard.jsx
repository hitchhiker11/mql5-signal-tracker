import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import LoadingScreen from '../components/LoadingScreen';

export const AuthGuard = ({ children, allowedRoles = ['user', 'admin'] }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const { pathname } = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    // Сохраняем путь, с которого пользователь был перенаправлен
    return <Navigate to="/auth/login" state={{ from: pathname }} />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    // Если роль не подходит, перенаправляем на домашнюю страницу
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};
