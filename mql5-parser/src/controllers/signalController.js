import { pool } from '../config/database.js';
import { MQL5Parser } from '../parser.js';

const parser = new MQL5Parser();

export const parseSignal = async (req, res) => {
  try {
    const { url } = req.body;
    const signalData = await parser.parseSignal(url);
    
    // Проверяем наличие основных данных
    if (!signalData.generalInfo || !signalData.generalInfo.signalName) {
      throw new Error('Invalid signal data');
    }

    res.json(signalData);
  } catch (error) {
    console.error('Parse error:', error);
    res.status(500).json({ message: 'Ошибка при парсинге сигнала' });
  }
};

export const addSignal = async (req, res) => {
  try {
    const { url } = req.body;
    const signalData = await parser.parseSignal(url);
    
    const result = await pool.query(
      'INSERT INTO signals (url, name, author, data) VALUES ($1, $2, $3, $4) RETURNING *',
      [
        url,
        signalData.generalInfo.signalName,
        signalData.generalInfo.author,
        JSON.stringify(signalData)
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add signal error:', error);
    res.status(500).json({ message: 'Ошибка при добавлении сигнала' });
  }
};

export const updateSignalData = async (req, res) => {
  const { id } = req.params;
  
  try {
    const signal = await pool.query('SELECT url FROM signals WHERE id = $1', [id]);
    if (signal.rows.length === 0) {
      return res.status(404).json({ message: 'Сигнал не найден' });
    }

    const signalData = await parser.parseSignal(signal.rows[0].url);
    const result = await pool.query(
      'UPDATE signals SET data = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [signalData, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update signal error:', error);
    res.status(500).json({ message: 'Ошибка при обновлении сигнала' });
  }
}; 