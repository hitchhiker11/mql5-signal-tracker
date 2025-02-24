-- Создание базы данных
CREATE DATABASE IF NOT EXISTS mql5_signals;
USE mql5_signals;

-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Создание таблицы сигналов
CREATE TABLE IF NOT EXISTS signals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  url VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Создание таблицы связей пользователей и сигналов
CREATE TABLE IF NOT EXISTS user_signals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  signal_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (signal_id) REFERENCES signals(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_signal (user_id, signal_id)
);

-- Индексы для оптимизации запросов
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_signals_url ON signals(url);
CREATE INDEX idx_user_signals_user ON user_signals(user_id);
CREATE INDEX idx_user_signals_signal ON user_signals(signal_id);

CREATE TABLE general_info (
    id SERIAL PRIMARY KEY,
    signal_id INTEGER REFERENCES signals(id),
    growth DECIMAL(10,2),
    profit DECIMAL(15,2),
    equity DECIMAL(15,2),
    balance DECIMAL(15,2),
    initial_deposit DECIMAL(15,2),
    withdrawals DECIMAL(15,2),
    deposits DECIMAL(15,2),
    trading_days INTEGER,
    last_trade VARCHAR(100),
    trades_per_week INTEGER,
    avg_holding_time VARCHAR(100),
    subscribers INTEGER,
    weeks INTEGER,
    launched TIMESTAMP
);

CREATE TABLE statistics (
    id SERIAL PRIMARY KEY,
    signal_id INTEGER REFERENCES signals(id),
    total_trades INTEGER,
    profitable_trades INTEGER,
    profitable_trades_percent DECIMAL(5,2),
    loss_trades INTEGER,
    loss_trades_percent DECIMAL(5,2),
    best_trade DECIMAL(15,2),
    worst_trade DECIMAL(15,2),
    total_profit DECIMAL(15,2),
    total_loss DECIMAL(15,2),
    max_win_streak INTEGER,
    max_win_streak_profit DECIMAL(15,2),
    sharpe_ratio DECIMAL(5,2),
    trading_activity DECIMAL(5,2),
    max_deposit_load DECIMAL(5,2),
    recovery_factor DECIMAL(5,2),
    profit_factor DECIMAL(5,2),
    expected_payoff DECIMAL(15,2),
    avg_profit DECIMAL(15,2),
    avg_loss DECIMAL(15,2)
);

CREATE TABLE distribution (
    id SERIAL PRIMARY KEY,
    signal_id INTEGER REFERENCES signals(id),
    symbol VARCHAR(20),
    value VARCHAR(50),
    percentage DECIMAL(5,2),
    distribution_type VARCHAR(20) -- 'trades', 'profit', 'loss'
);

CREATE TABLE author_signals (
    id SERIAL PRIMARY KEY,
    signal_id INTEGER REFERENCES signals(id),
    name VARCHAR(255),
    url VARCHAR(255)
); 