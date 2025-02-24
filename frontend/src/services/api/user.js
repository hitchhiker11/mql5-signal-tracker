import axios from '../axios';

export const userApi = {
  getAllUsers: async () => {
    const response = await axios.get('/api/users');
    return response.data;
  },

  getUser: async (userId) => {
    const response = await axios.get(`/api/users/${userId}`);
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await axios.put('/api/users/profile', userData);
    return response.data;
  },

  changePassword: async (passwords) => {
    const response = await axios.put('/api/users/password', passwords);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await axios.delete(`/api/users/${userId}`);
    return response.data;
  },

  getStats: async () => {
    const response = await axios.get('/api/users/stats');
    return response.data;
  }
};
