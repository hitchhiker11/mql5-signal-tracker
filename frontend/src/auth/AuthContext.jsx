import React, { createContext, useState, useEffect } from 'react';
import { authApi } from '../services/api/auth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  setAuthToken, 
  setRefreshToken, 
  setUserData, 
  getAuthToken, 
  getUserData, 
  clearAuthCookies,
  hasAuthToken
} from '../services/cookies';
import { loginWithTelegram as telegramLoginService } from '../services/telegram';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // Проверяем наличие токена в cookies
    if (hasAuthToken()) {
      try {
        // Устанавливаем токен авторизации в заголовок axios
        const token = getAuthToken();
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        // Пробуем получить данные пользователя из cookies
        const cachedUser = getUserData();
        if (cachedUser) {
          setUser(cachedUser);
          setIsAuthenticated(true);
          setLoading(false); // Устанавливаем loading=false сразу после чтения из cookie
        }
        
        // В фоновом режиме проверяем валидность токена
        try {
          const response = await authApi.checkAuth();
          if (response && response.user) {
            setUser(response.user);
            setUserData(response.user); // Обновляем данные пользователя в cookies
            setIsAuthenticated(true);
          } else {
            throw new Error('Invalid response format');
          }
        } catch (error) {
          console.error('Backend auth check failed:', error);
          // Если фоновая проверка не удалась, но у нас есть данные из cookie,
          // не выходим из аккаунта сразу, а оставляем пользователя авторизованным
          if (!cachedUser) {
            clearAuthCookies();
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        clearAuthCookies();
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authApi.login(credentials);
      
      if (response?.token && response?.user) {
        // Сохраняем токен и данные пользователя в cookies
        setAuthToken(response.token);
        if (response.refreshToken) {
          setRefreshToken(response.refreshToken);
        }
        setUserData(response.user);
        
        // Устанавливаем токен в заголовки axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
        
        // Обновляем состояние
        setUser(response.user);
        setIsAuthenticated(true);
        return response;
      } else {
        throw new Error('Неверный формат ответа от сервера');
      }
    } catch (error) {
      console.error('Ошибка входа:', error);
      clearAuthCookies();
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authApi.register(userData);
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      clearAuthCookies();
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
      navigate('/auth/login');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      clearAuthCookies();
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
      navigate('/auth/login');
    }
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    setUserData(updatedUserData); // Обновляем данные в cookies
  };

  const loginWithTelegram = async () => {
    try {
      const response = await telegramLoginService();
      
      if (response?.token && response?.user) {
        // Сохраняем токен и данные пользователя в cookies
        setAuthToken(response.token);
        if (response.refreshToken) {
          setRefreshToken(response.refreshToken);
        }
        setUserData(response.user);
        
        // Устанавливаем токен в заголовки axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
        
        // Обновляем состояние
        setUser(response.user);
        setIsAuthenticated(true);
        return response;
      } else {
        throw new Error('Неверный формат ответа от сервера');
      }
    } catch (error) {
      console.error('Ошибка входа через Telegram:', error);
      clearAuthCookies();
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    loginWithTelegram
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
