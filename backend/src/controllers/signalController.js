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
  const client = await pool.connect();
<<<<<<< HEAD
  try {
    const { url } = req.body;
    const parser = new MQL5Parser();
=======
  
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ message: 'URL сигнала обязателен' });
    }
>>>>>>> 1e8dc0706bfbe094d5c7e8822614770dfb2bf70d

    // Парсим сигнал
    const signalData = await parser.parseSignal(url);
    
<<<<<<< HEAD
    if (!signalData.generalInfo || !signalData.generalInfo.signalName) {
      throw new Error('Invalid signal data structure');
    }

    // Начинаем транзакцию
    await client.query('BEGIN');

    // Проверяем существование сигнала
=======
    // Проверяем, существует ли уже сигнал с таким URL
>>>>>>> 1e8dc0706bfbe094d5c7e8822614770dfb2bf70d
    const existingSignal = await client.query(
      'SELECT id FROM signals WHERE url = $1',
      [url]
    );

    if (existingSignal.rows.length > 0) {
<<<<<<< HEAD
      // Обновляем существующий сигнал
      result = await client.query(
        `UPDATE signals 
         SET name = $1, 
             author = $2, 
             data = $3::jsonb, 
             updated_at = NOW()
         WHERE url = $4
         RETURNING *`,
        [
          signalData.generalInfo.signalName,
          signalData.generalInfo.author,
          JSON.stringify(signalData),
          url
        ]
      );
    } else {
      // Создаем новый сигнал
      result = await client.query(
        `INSERT INTO signals (name, author, url, data)
         VALUES ($1, $2, $3, $4::jsonb)
         RETURNING *`,
        [
          signalData.generalInfo.signalName,
          signalData.generalInfo.author,
          url,
          JSON.stringify(signalData)
        ]
      );
    }

    await client.query('COMMIT');
    return result.rows[0];
=======
      return res.status(400).json({ message: 'Сигнал с таким URL уже существует' });
    }

    // Сохраняем сигнал
    const result = await client.query(
      `INSERT INTO signals (
        url, 
        name, 
        author, 
        data,
        created_at, 
        updated_at
      ) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *`,
      [
        url,
        signalData.generalInfo.signalName,
        signalData.generalInfo.author,
        signalData
      ]
    );

    return res.status(201).json(result.rows[0]);
>>>>>>> 1e8dc0706bfbe094d5c7e8822614770dfb2bf70d
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving signal:', error);
<<<<<<< HEAD
    throw error;
=======
    return res.status(500).json({ message: 'Ошибка при сохранении сигнала' });
  } finally {
    client.release();
  }
};

export const deleteSignal = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;

    // Начинаем транзакцию
    await client.query('BEGIN');

    // Сначала удаляем все связи с пользователями
    await client.query(
      'DELETE FROM user_signals WHERE signal_id = $1',
      [id]
    );

    // Затем удаляем сам сигнал
    const result = await client.query(
      'DELETE FROM signals WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Сигнал не найден' });
    }

    await client.query('COMMIT');
    res.json({ message: 'Сигнал успешно удален', signal: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting signal:', error);
    res.status(500).json({ message: 'Ошибка при удалении сигнала' });
>>>>>>> 1e8dc0706bfbe094d5c7e8822614770dfb2bf70d
  } finally {
    client.release();
  }
}; 