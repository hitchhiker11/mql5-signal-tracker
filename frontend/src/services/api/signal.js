import axios from '../axios';

export const signalApi = {
  getSignal: async (url) => {
    const response = await axios.post('/api/signals/parse', { url });
    return response.data;
  },

  getAllSignals: async () => {
    return axios.get('/api/admin/signals');
  },

  getUserSignals: async () => {
    return axios.get('/api/signals/user');
  },

  addSignal: async (url) => {
    const response = await axios.post('/api/admin/signals', { url });
    return response;
  },

  deleteSignal: async (id) => {
    return axios.delete(`/api/admin/signals/${id}`);
  },

  assignSignal: async (userId, signalId) => {
    return axios.post('/api/admin/signals/assign', {
      userId,
      signalId
    });
  },

  getStats: async () => {
    const response = await axios.get('/api/signals/stats');
    return response.data;
  },

  parseSignal: async (url) => {
    const response = await axios.post('/api/signals/parse', { url });
    return response;
  },

  updateSignal: async (signalId) => {
    const response = await axios.put(`/api/signals/${signalId}/update`);
    return response.data;
  },

  updateSignalData: async (id) => {
    const response = await axios.put(`/api/signals/${id}/update`);
    return response;
  },

  getSignal: async (signalId) => {
    const response = await axios.get(`/api/signals/${signalId}`);
    return response.data;
  }
};
