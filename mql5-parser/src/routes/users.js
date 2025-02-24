import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../config/database.js';
import { isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Получить всех пользователей (только админ)
router.get('/', isAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, username, email, role, created_at FROM users'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении пользователей' });
  }
});

// Получить статистику пользователей
router.get('/stats', isAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as new_users_week
      FROM users
    `);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении статистики' });
  }
});

// Обновить профиль
router.put('/profile', async (req, res) => {
  try {
    const { username, email } = req.body;
    const userId = req.user.id;

    // Проверка уникальности email и username
    const { rows } = await pool.query(
      'SELECT id FROM users WHERE (email = $1 OR username = $2) AND id != $3',
      [email, username, userId]
    );

    if (rows.length > 0) {
      return res.status(400).json({ message: 'Email или имя пользователя уже заняты' });
    }

    await pool.query(
      'UPDATE users SET username = $1, email = $2 WHERE id = $3',
      [username, email, userId]
    );

    res.json({ message: 'Профиль успешно обновлен' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении профиля' });
  }
});

// Изменить пароль
router.put('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Проверка текущего пароля
    const { rows } = await pool.query(
      'SELECT password FROM users WHERE id = $1',
      [userId]
    );

    const validPassword = await bcrypt.compare(currentPassword, rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Неверный текущий пароль' });
    }

    // Хеширование и обновление пароля
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, userId]
    );

    res.json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при изменении пароля' });
  }
});

// Удалить пользователя (только админ)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Проверка, не пытается ли админ удалить сам себя
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Невозможно удалить собственный аккаунт' });
    }

    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'Пользователь успешно удален' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении пользователя' });
  }
});

export default router; 