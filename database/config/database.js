import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mql5_signals',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

export const pool = mysql.createPool(config);

export const initDatabase = async () => {
  try {
    // Проверка соединения
    await pool.getConnection();
    console.log('Database connected successfully');

    // Создание таблиц, если они не существуют
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS signals (
        id INT PRIMARY KEY AUTO_INCREMENT,
        url VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_signals (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        signal_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (signal_id) REFERENCES signals(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_signal (user_id, signal_id)
      )
    `);

    // Создание админа по умолчанию, если его нет
    const [adminExists] = await pool.query(
      'SELECT id FROM users WHERE role = "admin" LIMIT 1'
    );

    if (adminExists.length === 0) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_DEFAULT_PASSWORD || 'admin123', 10);
      await pool.query(`
        INSERT INTO users (username, email, password, role)
        VALUES ('admin', 'admin@example.com', ?, 'admin')
      `, [hashedPassword]);
    }

  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}; 