import axiosInstance from '../axios';

export const authApi = {
  login: (credentials) => axiosInstance.post('/api/auth/login', credentials),
  register: (userData) => axiosInstance.post('/api/auth/register', userData),
  checkAuth: () => axiosInstance.get('/api/auth/me'),
};
