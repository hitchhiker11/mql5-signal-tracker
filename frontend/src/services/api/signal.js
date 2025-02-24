import axiosInstance from '../axios';

export const signalApi = {
  getSignal: (url) => axiosInstance.post('/api/parse', { url }),
  getUserSignals: () => axiosInstance.get('/api/user/signals'),
  assignSignal: (userId, signalUrl) => 
    axiosInstance.post('/api/admin/assign-signal', { userId, signalUrl }),
};
