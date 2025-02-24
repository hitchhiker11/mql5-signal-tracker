import axios from '../axios';

export const signalApi = {
  getSignal: async (url) => {
    const response = await axios.post('/api/signals/parse', { url });
    return response.data;
  },

  getAllSignals: async () => {
    const response = await axios.get('/api/signals');
    return response;
  },

  getUserSignals: async () => {
    const response = await axios.get('/api/signals/user');
    return response;
  },

  addSignal: async (url) => {
    const response = await axios.post('/api/signals', { url });
    return response;
  },

  deleteSignal: async (signalId) => {
    const response = await axios.delete(`/api/signals/${signalId}`);
    return response.data;
  },

  assignSignal: async (userId, signalUrl) => {
    const response = await axios.post(`/api/signals/assign/${userId}`, {
      url: signalUrl
    });
    return response.data;
  },

  getStats: async () => {
    const response = await axios.get('/api/signals/stats');
    return response.data;
  },

  parseSignal: async (url) => {
    const response = await axios.post('/api/signals/parse', { url });
    return response;
  },

  updateSignalData: async (id) => {
    const response = await axios.put(`/api/signals/${id}/update`);
    return response;
  }
};
