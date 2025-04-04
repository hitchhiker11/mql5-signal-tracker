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

// Настройка CORS для работы с ngrok
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://1564-51-38-68-200.ngrok-free.app' // Добавьте ваш ngrok URL
];

// Добавляем все домены ngrok в список разрешенных
if (process.env.NODE_ENV === 'development') {
  const ngrokPattern = /^https:\/\/.*\.ngrok-free\.app$/;
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && ngrokPattern.test(origin)) {
      allowedOrigins.push(origin);
    }
    next();
  });
}

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Логгирование запросов
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/signals', verifyToken, signalRoutes);
app.use('/api/admin/users', verifyToken, userRoutes);
app.use('/api/admin/signals', verifyToken, signalRoutes);

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