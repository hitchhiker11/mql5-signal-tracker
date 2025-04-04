import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Токен не предоставлен' });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const { rows } = await pool.query(
        'SELECT id, username, email, role FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (rows.length === 0) {
        return res.status(401).json({ message: 'Пользователь не найден' });
      }

      req.user = rows[0];
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return res.status(401).json({ message: 'Недействительный токен' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Ошибка сервера при проверке аутентификации' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Доступ запрещен' });
  }
}; 