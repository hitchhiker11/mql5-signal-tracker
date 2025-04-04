import axios from 'axios';

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
    const token = localStorage.getItem('token');
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
      // Можно добавить логику для обновления токена или перенаправления на страницу входа
      console.log('Unauthorized, redirecting to login...');
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
