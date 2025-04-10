import axios from 'axios';
import { getAuthToken, clearAuthCookies } from './cookies';

const baseURL = window.location.hostname.includes('ngrok-free.app')
  ? 'https://1564-51-38-68-200.ngrok-free.app' // Ваш ngrok URL для бэкенда
  : 'http://localhost:3001';

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Добавляем перехватчик для добавления токена к каждому запросу
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Добавляем перехватчик для обработки ошибок
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Если получили 401, очищаем cookies и перенаправляем на страницу входа
      console.log('Unauthorized, redirecting to login...');
      clearAuthCookies();
      if (window.location.pathname !== '/auth/login') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
