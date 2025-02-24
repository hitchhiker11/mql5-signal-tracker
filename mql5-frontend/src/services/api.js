import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const signalService = {
    getSignal: async (url) => {
        try {
            const response = await axios.post(`${BASE_URL}/api/parse`, { url });
            return response.data;
        } catch (error) {
            throw new Error('Ошибка при получении данных сигнала');
        }
    },

    getAllSignals: async () => {
        const response = await axios.get(`${BASE_URL}/api/signals`);
        return response.data;
    }
}; 