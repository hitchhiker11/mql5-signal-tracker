import axios from '../axios';

export const userApi = {
  getAllUsers: async () => {
    const response = await axios.get('/api/users');
    return response.data;
  },

  getUser: async (id) => {
    const response = await axios.get(`/api/users/${id}`);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await axios.put(`/api/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await axios.delete(`/api/users/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await axios.get('/api/users/stats');
    return response.data;
  },
  
  updateProfile: async (userData) => {
    const response = await axios.put('/api/users/profile', userData);
    return response.data;
  }
};
