import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Токен не предоставлен' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const [user] = await pool.query(
      'SELECT id, username, email, role FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user[0]) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }

    req.user = user[0];
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Недействительный токен' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Доступ запрещен' });
  }
  next();
}; 