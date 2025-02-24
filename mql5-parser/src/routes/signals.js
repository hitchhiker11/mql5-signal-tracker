import express from 'express';
import { MQL5Parser } from '../parser.js';
import { pool } from '../config/database.js';
import { isAdmin } from '../middleware/auth.js';

const router = express.Router();
const parser = new MQL5Parser();

// Получить все сигналы (для админа)
router.get('/', isAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM signals');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении сигналов' });
  }
});

// Получить сигналы пользователя
router.get('/user', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT s.* FROM signals s JOIN user_signals us ON s.id = us.signal_id WHERE us.user_id = $1',
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении сигналов' });
  }
});

// Парсинг нового сигнала
router.post('/parse', async (req, res) => {
  try {
    const { url } = req.body;
    const signalData = await parser.parseSignal(url);
    res.json(signalData);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при парсинге сигнала' });
  }
});

// Добавить сигнал
router.post('/', isAdmin, async (req, res) => {
  try {
    const { url } = req.body;
    const signalData = await parser.parseSignal(url);
    
    const { rows } = await pool.query(
      'INSERT INTO signals (url, name, author, data) VALUES ($1, $2, $3, $4) RETURNING id',
      [url, signalData.generalInfo.signalName, signalData.generalInfo.author, signalData]
    );

    res.status(201).json({ id: rows[0].id, ...signalData });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при добавлении сигнала' });
  }
});

// Назначить сигнал пользователю
router.post('/assign/:userId', isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { url } = req.body;

    const { rows } = await pool.query(
      'SELECT id FROM signals WHERE url = $1',
      [url]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Сигнал не найден' });
    }

    await pool.query(
      'INSERT INTO user_signals (user_id, signal_id) VALUES ($1, $2)',
      [userId, rows[0].id]
    );

    res.json({ message: 'Сигнал успешно назначен пользователю' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при назначении сигнала' });
  }
});

// Получить статистику сигналов
router.get('/stats', isAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT us.user_id) as assigned_users,
        (SELECT COUNT(*) FROM signals s2 WHERE s2.created_at > NOW() - INTERVAL '7 days') as new_last_week
      FROM signals s
      LEFT JOIN user_signals us ON s.id = us.signal_id
    `);
    
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении статистики' });
  }
});

export default router; 