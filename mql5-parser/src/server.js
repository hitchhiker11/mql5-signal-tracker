const express = require('express');
const cors = require('cors');
const MQL5Parser = require('./parser');

const app = express();
const parser = new MQL5Parser();

app.use(cors());
app.use(express.json());

app.post('/api/parse', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL сигнала обязателен' });
        }

        const data = await parser.parseSignal(url);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3001;

const startServer = async () => {
    try {
        app.listen(PORT, () => {
            console.log(`Сервер парсера запущен на порту ${PORT}`);
        });
    } catch (error) {
        if (error.code === 'EADDRINUSE') {
            console.error(`Порт ${PORT} занят. Попробуйте другой порт или остановите процесс.`);
            process.exit(1);
        } else {
            console.error('Ошибка при запуске сервера:', error);
            process.exit(1);
        }
    }
};

startServer();