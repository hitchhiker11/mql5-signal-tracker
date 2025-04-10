import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import signalRoutes from './routes/signals.js';
import userRoutes from './routes/users.js';
import { verifyToken } from './middleware/auth.js';
import { errorHandler } from './middleware/error.js';
import { initDatabase } from './config/database.js';
import MQL5Service from './services/mql5/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Инициализация парсера
export const parser = new MQL5Service();

// Настройка CORS для работы с разными источниками
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:80',
  'http://frontend', // Для работы внутри Docker-сети
  'http://109.73.192.193',        // Внешний IP-адрес сервера (HTTP)
  'http://109.73.192.193:80',     // Внешний IP-адрес сервера с портом 80
  'http://109.73.192.193:3001',   // Внешний IP-адрес сервера с портом бэкенда
  'https://109.73.192.193',       // HTTPS версия, если будет использоваться SSL
  'https://1564-51-38-68-200.ngrok-free.app' // ngrok URL
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
    // Разрешаем запросы без origin (например, от Postman или curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked for origin: ${origin}`);
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
  console.log(`${req.method} ${req.path} (Origin: ${req.headers.origin || 'Unknown'})`);
  next();
});

// Endpoint для проверки здоровья сервера
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  });
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
    const data = await parser.getSignalData(url);
    res.json(data);
    console.log(data);
  } catch (error) {
    console.error('Parser error:', error);
    res.status(500).json({ message: 'Ошибка при парсинге сигнала' });
  }
});

// Error handling
app.use(errorHandler);

// Database initialization
initDatabase().then(() => {
  // Явно указываем host 0.0.0.0 для доступа извне
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} and accessible from all interfaces`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

export default app;