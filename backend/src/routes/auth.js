import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import { verifyToken } from '../middleware/auth.js';
import cors from 'cors';

const corsOptions = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
  };

const router = express.Router();
router.use(cors(corsOptions));

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Проверка существующего пользователя (исправленный PostgreSQL синтаксис)
    const { rows } = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (rows.length > 0) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание пользователя (используем $1, $2, $3 вместо ?)
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
      [username, email, hashedPassword]
    );

    res.status(201).json({ 
      message: 'Пользователь успешно зарегистрирован',
      userId: result.rows[0].id 
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Ошибка при регистрации' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Поиск пользователя (PostgreSQL синтаксис)
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Неверные учетные данные' });
    }

    const user = rows[0];

    // Проверка пароля
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Неверные учетные данные' });
    }

    // Создание токена
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Ошибка при входе' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const { rows } = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Здесь должна быть логика отправки email
    // TODO: Реализовать отправку email

    res.json({ message: 'Инструкции по сбросу пароля отправлены на email' });
  } catch (error) {
    console.error('Error during forgot-password:', error);
    res.status(500).json({ message: 'Ошибка при обработке запроса' });
  }
});

router.get('/check', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

export default router; 