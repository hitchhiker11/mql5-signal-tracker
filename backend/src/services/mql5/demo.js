/**
 * MQL5Service Demo
 * 
 * Демонстрационный скрипт для показа работы новой архитектуры сервиса MQL5.
 * Показывает различные режимы парсинга и их производительность.
 */

import MQL5Service from './index.js';
import fs from 'fs/promises';
import path from 'path';

// Создаем директорию для результатов
const resultsDir = path.join(process.cwd(), 'results');

// Функция для тестирования парсера
async function runDemo() {
    console.log('MQL5Service Demo');
    console.log('----------------');
    
    // Создаем экземпляр сервиса с настройками
    const mql5 = new MQL5Service({
        cache: {
            enabled: true
        },
        logger: {
            level: 'INFO'
        }
    });
    
    // Подписываемся на события
    mql5.on('signalParsed', (data) => {
        console.log(`Сигнал ${data.url} обработан за ${data.processingTime}ms (режим: ${data.mode})`);
    });
    
    mql5.on('error', (error) => {
        console.error(`Ошибка: ${error.error}`);
    });
    
    // URL сигналов для тестирования
    const testUrls = [
        'https://www.mql5.com/ru/signals/2299787', // Пример из запроса пользователя

    ];
    
    // Создаем директорию для результатов
    try {
        await fs.mkdir(resultsDir, { recursive: true });
        console.log(`Директория для результатов создана: ${resultsDir}`);
    } catch (error) {
        console.error(`Ошибка при создании директории: ${error.message}`);
    }
    
    // Тестируем разные режимы парсинга
    for (const url of testUrls) {
        console.log(`\nТестирование URL: ${url}`);
        
        // Пробуем разные режимы парсинга
        const modes = ['fast', 'normal', 'advanced'];
        
        for (const mode of modes) {
            console.log(`\n[Режим: ${mode}]`);
            console.time(`Парсинг (${mode})`);
            
            try {
                const data = await mql5.getSignalData(url, { mode, bypassCache: false });
                console.timeEnd(`Парсинг (${mode})`);
                
                // Вывести основную информацию
                if (data.generalInfo) {
                    console.log(`Название сигнала: ${data.generalInfo.signalName}`);
                    console.log(`Автор: ${data.generalInfo.author}`);
                }
                
                // Сохраняем результат в файл
                const fileName = `result_${mode}_${path.basename(url)}.json`;
                const filePath = path.join(resultsDir, fileName);
                
                await fs.writeFile(filePath, JSON.stringify(data, null, 2));
                console.log(`Результат сохранен в файл: ${filePath}`);
                
                // Выводим статистику
                console.log(`Размер данных: ${JSON.stringify(data).length} байт`);
                console.log(`Метаданные: ${JSON.stringify(data.meta)}`);
            } catch (error) {
                console.error(`Ошибка при парсинге (${mode}): ${error.message}`);
            }
        }
    }
    
    console.log('\nДемонстрация завершена.');
}

// Запускаем демонстрацию
runDemo().catch(error => {
    console.error('Ошибка в демонстрации:', error);
}); 