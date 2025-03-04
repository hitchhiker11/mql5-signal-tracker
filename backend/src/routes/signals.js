import express from 'express';
import { MQL5Parser } from '../parser.js';
import { pool } from '../config/database.js';
import { isAdmin, verifyToken } from '../middleware/auth.js';
import { 
  parseAndSaveSignal,
  deleteSignal,
  // ... другие импорты контроллеров
} from '../controllers/signalController.js';

const router = express.Router();
const parser = new MQL5Parser();

// Применяем middleware аутентификации ко всем маршрутам
router.use(verifyToken);

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
    console.log('User from request:', req.user); // Для отладки
    
    const { rows } = await pool.query(
      'SELECT s.* FROM signals s JOIN user_signals us ON s.id = us.signal_id WHERE us.user_id = $1',
      [req.user.id]
    );
    
    console.log('Found signals:', rows); // Для отладки
    res.json(rows);
  } catch (error) {
    console.error('Error fetching user signals:', error);
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

// Используем только один обработчик для добавления сигнала
router.post('/', isAdmin, parseAndSaveSignal);

// Назначить сигнал пользователю
router.post('/assign', isAdmin, async (req, res) => {
  try {
    const { userId, signalId } = req.body;

    // Проверяем существование сигнала
    const signalExists = await pool.query(
      'SELECT id FROM signals WHERE id = $1',
      [signalId]
    );

    if (signalExists.rows.length === 0) {
      return res.status(404).json({ message: 'Сигнал не найден' });
    }

    // Проверяем, не назначен ли уже этот сигнал пользователю
    const existingAssignment = await pool.query(
      'SELECT * FROM user_signals WHERE user_id = $1 AND signal_id = $2',
      [userId, signalId]
    );

    if (existingAssignment.rows.length > 0) {
      return res.status(400).json({ message: 'Сигнал уже назначен этому пользователю' });
    }

    await pool.query(
      'INSERT INTO user_signals (user_id, signal_id) VALUES ($1, $2)',
      [userId, signalId]
    );

    res.json({ message: 'Сигнал успешно назначен пользователю' });
  } catch (error) {
    console.error('Error assigning signal:', error);
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

router.post('/:id/parse', verifyToken, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Получаем сигнал
      const signal = await pool.query('SELECT url FROM signals WHERE id = $1', [id]);
      
      if (signal.rows.length === 0) {
        return res.status(404).json({ message: 'Сигнал не найден' });
      }
  
      // Парсим данные
      const signalData = await parser.parseSignal(signal.rows[0].url);
      
      if (!signalData || !signalData.generalInfo) {
        throw new Error('Invalid signal data structure');
      }
  
      // Обновляем в базе
      const result = await pool.query(
        `UPDATE signals 
         SET parsed_data = $1, 
             name = $2,
             author = $3,
             updated_at = NOW() 
         WHERE id = $4 
         RETURNING *`,
        [
          signalData,
          signalData.generalInfo.signalName,
          signalData.generalInfo.author,
          id
        ]
      );
  
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating signal:', error);
      res.status(500).json({ 
        message: 'Ошибка при обновлении сигнала',
        details: error.message 
      });
    }
  });

// Обновить сигнал (только для админа)
router.put('/:id', isAdmin, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { name, url } = req.body;

    await client.query('BEGIN');

    // Проверяем существование сигнала
    const checkSignal = await client.query(
      'SELECT id FROM signals WHERE id = $1',
      [id]
    );

    if (checkSignal.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Сигнал не найден' });
    }

    // Обновляем данные сигнала
    const { rows } = await client.query(
      `UPDATE signals 
       SET name = COALESCE($1, name),
           url = COALESCE($2, url),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [name, url, id]
    );

    await client.query('COMMIT');
    res.json(rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating signal:', error);
    res.status(500).json({ message: 'Ошибка при обновлении сигнала' });
  } finally {
    client.release();
  }
});

router.put('/:id/update', async (req, res) => {
  try {
    const signalId = req.params.id;
    // Логика обновления сигнала для пользователя
    // Проверка прав доступа к сигналу
    // Обновление данных
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении сигнала' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const signalId = req.params.id;
    // Логика получения данных сигнала для пользователя
    // Проверка прав доступа к сигналу
    res.json(signal);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении данных сигнала' });
  }
});

// Добавляем маршрут для удаления сигнала (только для админов)
router.delete('/:id', isAdmin, deleteSignal);

export default router; 