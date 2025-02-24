import axiosInstance from '../axios';

export const adminApi = {
  getUsers: async () => {
    const response = await axiosInstance.get('/api/admin/users');
    return response;
  },

  getAllUsers: async () => {
    const response = await axiosInstance.get('/api/admin/users');
    return response;
  },

  getDashboardStats: async () => {
    const response = await axiosInstance.get('/api/admin/dashboard/stats');
    return response;
  },

  updateUserStatus: async (userId, status) => {
    const response = await axiosInstance.patch(`/api/admin/users/${userId}/status`, { status });
    return response;
  },

  deleteUser: async (userId) => {
    const response = await axiosInstance.delete(`/api/admin/users/${userId}`);
    return response;
  },

  getAllSignals: async () => {
    const response = await axiosInstance.get('/api/admin/signals');
    return response;
  },

  updateSignal: async (signalId, signalData) => {
    const response = await axiosInstance.put(`/api/admin/signals/${signalId}`, signalData);
    return response;
  },

  assignSignalToUser: async (userId, signalId) => {
    const response = await axiosInstance.post('/api/admin/signals/assign', {
      userId,
      signalId
    });
    return response;
  }
}; 