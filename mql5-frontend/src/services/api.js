import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const signalService = {
    getSignal: async (url) => {
        const response = await axios.post(`${API_URL}/parse`, { url });
        return response.data;
    },
    
    getAllSignals: async () => {
        const response = await axios.get(`${API_URL}/signals`);
        return response.data;
    }
}; 