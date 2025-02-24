import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import signalRoutes from './routes/signals.js';
import userRoutes from './routes/users.js';
import { verifyToken } from './middleware/auth.js';
import { errorHandler } from './middleware/error.js';
import { initDatabase } from './config/database.js';
import { MQL5Parser } from './parser.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Инициализация парсера
export const parser = new MQL5Parser();

// Middleware
// app.use(cors());
app.use(cors({
    origin: 'http://localhost:3000',  // URL вашего фронтенда
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/signals', verifyToken, signalRoutes);
app.use('/api/users', verifyToken, userRoutes);

// Публичный маршрут для тестирования парсера
app.post('/api/parse', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ message: 'URL сигнала обязателен' });
    }
    const data = await parser.parseSignal(url);
    res.json(data);
  } catch (error) {
    console.error('Parser error:', error);
    res.status(500).json({ message: 'Ошибка при парсинге сигнала' });
  }
});

// Error handling
app.use(errorHandler);

// Database initialization
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

export default app;