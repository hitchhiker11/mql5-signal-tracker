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
    console.error('Update signal error:', error);
    res.status(500).json({ 
      message: 'Ошибка при обновлении сигнала',
      details: error.message 
    });
  }
};

export const parseAndSaveSignal = async (req, res) => {
  try {
    const { url } = req.body;
    const signalData = await parser.parseSignal(url);
    
    // Проверяем существование сигнала
    const existingSignal = await pool.query(
      'SELECT id FROM signals WHERE url = $1',
      [url]
    );

    let result;
    if (existingSignal.rows.length > 0) {
      // Обновляем существующий сигнал
      result = await pool.query(
        `UPDATE signals 
         SET name = $1, 
             author = $2, 
             parsed_data = $3,
             updated_at = NOW()
         WHERE url = $4 
         RETURNING *`,
        [
          signalData.generalInfo.signalName,
          signalData.generalInfo.author,
          signalData,
          url
        ]
      );
    } else {
      // Создаем новый сигнал
      result = await pool.query(
        `INSERT INTO signals (url, name, author, parsed_data) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [
          url,
          signalData.generalInfo.signalName,
          signalData.generalInfo.author,
          signalData
        ]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error saving signal:', error);
    res.status(500).json({ message: 'Ошибка при сохранении сигнала' });
  }
}; 