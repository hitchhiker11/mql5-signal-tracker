import axiosInstance from '../axios';

export const signalApi = {
  getSignal: async (url) => {
    const response = await axiosInstance.post('/api/signals/parse', { url });
    return response.data;
  },

  getAllSignals: async () => {
    return axiosInstance.get('/api/admin/signals');
  },

  getUserSignals: async () => {
    return axiosInstance.get('/api/signals/user');
  },

  addSignal: async (url) => {
    return axiosInstance.post('/api/admin/signals', { url });
  },

  deleteSignal: async (id) => {
    return axiosInstance.delete(`/api/admin/signals/${id}`);
  },

  assignSignal: async (userId, signalId) => {
    return axiosInstance.post('/api/admin/signals/assign', {
      userId,
      signalId
    });
  },

  getStats: async () => {
    const response = await axiosInstance.get('/api/signals/stats');
    return response.data;
  },

  parseSignal: async (url) => {
    const response = await axiosInstance.post('/api/signals/parse', { url });
    return response;
  },

  updateSignal: async (id, data) => {
    return axiosInstance.put(`/api/admin/signals/${id}`, data);
  },

  updateSignalData: async (id) => {
    const response = await axiosInstance.put(`/api/signals/${id}/update`);
    return response;
  }
};
