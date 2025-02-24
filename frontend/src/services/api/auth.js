import axios from '../axios';

export const authApi = {
  login: async (credentials) => {
    const response = await axios.post('/api/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await axios.post('/api/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    const response = await axios.post('/api/auth/logout');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await axios.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await axios.post('/api/auth/reset-password', { token, password });
    return response.data;
  },

  checkAuth: async () => {
    const response = await axios.get('/api/auth/me');
    return response.data;
  }
};
