import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Создаем экземпляр axios с базовой конфигурацией
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Добавляем интерцептор для обработки ошибок
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Обработка неавторизованного доступа
      console.log('Unauthorized, redirecting to login...');
    }
    return Promise.reject(error);
  }
);

export const adminApi = {
  getUsers: async () => {
    return axiosInstance.get('/api/admin/users');
  },

  getDashboardStats: async () => {
    return axiosInstance.get('/api/admin/dashboard/stats');
  },

  updateUserStatus: async (userId, status) => {
    return axiosInstance.patch(`/api/admin/users/${userId}/status`, { status });
  },

  deleteUser: async (userId) => {
    return axiosInstance.delete(`/api/admin/users/${userId}`);
  },

  updateSignal: async (signalId, signalData) => {
    return axiosInstance.put(`/api/admin/signals/${signalId}`, signalData);
  },

  assignSignalToUser: async (userId, signalId) => {
    return axiosInstance.post(`/api/admin/signals/assign`, {
      userId,
      signalId
    });
  },

  deleteSignal: async (signalId) => {
    return axios.delete(`${API_URL}/api/admin/signals/${signalId}`, {
      withCredentials: true
    });
  },

  getAllSignals: async () => {
    return axiosInstance.get('/api/admin/signals');
  }
}; 