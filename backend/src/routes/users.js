import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../config/database.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Применяем middleware аутентификации
router.use(verifyToken);

// Получить всех пользователей (для админа)
router.get('/', isAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, username, email, role, created_at FROM users WHERE role != $1', ['admin']);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Ошибка при получении пользователей' });
  }
});

// Получить статистику пользователей
router.get('/stats', isAdmin, async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
        COUNT(CASE WHEN created_at > DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as new_users_week
      FROM users
    `);
    res.json(stats[0]);
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
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE (email = ? OR username = ?) AND id != ?',
      [email, username, userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email или имя пользователя уже заняты' });
    }

    await pool.query(
      'UPDATE users SET username = ?, email = ? WHERE id = ?',
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
    const [user] = await pool.query(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    const validPassword = await bcrypt.compare(currentPassword, user[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Неверный текущий пароль' });
    }

    // Хеширование и обновление пароля
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при изменении пароля' });
  }
});

// Обновить статус пользователя
router.patch('/:id/status', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const result = await pool.query(
      'UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, username, email, status',
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Ошибка при обновлении статуса пользователя' });
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

    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'Пользователь успешно удален' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении пользователя' });
  }
});

export default router; 