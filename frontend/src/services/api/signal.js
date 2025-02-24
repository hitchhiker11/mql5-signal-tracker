import axios from '../axios';

export const signalApi = {
  getSignal: async (url) => {
    const response = await axios.post('/api/signals/parse', { url });
    return response.data;
  },

  getAllSignals: async () => {
    const response = await axios.get('/api/signals');
    return response.data;
  },

  getUserSignals: async () => {
    const response = await axios.get('/api/signals/user');
    return response.data;
  },

  addSignal: async (url) => {
    const response = await axios.post('/api/signals', { url });
    return response.data;
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
  }
};
