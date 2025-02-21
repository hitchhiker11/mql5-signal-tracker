const express = require('express');
const MQL5Parser = require('./parser');

const app = express();
const parser = new MQL5Parser();

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});