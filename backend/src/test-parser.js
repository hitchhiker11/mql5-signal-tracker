/**
 * Тестовый скрипт для проверки работы HTMLCleaner и МQL5Parser
 */

import fs from 'fs/promises';
import path from 'path';
import { HTMLCleaner } from './services/mql5/utils/HTMLCleaner.js';
import { MQL5Parser } from './services/mql5/parser/MQL5Parser.js';
import { createLogger, LogLevel } from './services/mql5/utils/Logger.js';

// Создаем логгер с высоким уровнем детализации
const logger = createLogger({
    prefix: 'TestParser',
    level: LogLevel.DEBUG,
    colorize: true
});

// Путь к тестовому HTML файлу
const testHtmlPath = path.join(process.cwd(), 'test.html');

// Функция для тестирования HTMLCleaner
async function testHtmlCleaner() {
    logger.info('Тестирование HTMLCleaner начато');
    
    try {
        // Читаем тестовый HTML
        const html = await fs.readFile(testHtmlPath, 'utf8');
        logger.info(`Тестовый HTML загружен, размер: ${html.length} байт`);
        
        // Создаем HTMLCleaner с разными настройками
        const cleaners = {
            extract: new HTMLCleaner({
                mode: 'extract',
                preserveScripts: true,
                preserveStyles: true,
                logger: (msg) => logger.debug(msg),
                verbose: true
            }),
            clean: new HTMLCleaner({
                mode: 'clean',
                preserveScripts: true,
                preserveStyles: true,
                logger: (msg) => logger.debug(msg),
                verbose: true
            })
        };
        
        // Тестируем режим extract
        logger.info('Тестирование режима extract');
        const extractedHtml = cleaners.extract.process(html);
        await fs.writeFile(path.join(process.cwd(), 'test-extracted.html'), extractedHtml);
        logger.info(`Обработанный HTML (extract) сохранен, размер: ${extractedHtml.length} байт`);
        
        // Тестируем режим clean
        logger.info('Тестирование режима clean');
        const cleanedHtml = cleaners.clean.process(html);
        await fs.writeFile(path.join(process.cwd(), 'test-cleaned.html'), cleanedHtml);
        logger.info(`Обработанный HTML (clean) сохранен, размер: ${cleanedHtml.length} байт`);
        
        logger.info('Тестирование HTMLCleaner завершено успешно');
        return { extractedHtml, cleanedHtml };
    } catch (error) {
        logger.error(`Ошибка при тестировании HTMLCleaner: ${error.message}`);
        logger.error(error.stack);
        throw error;
    }
}

// Функция для тестирования MQL5Parser
async function testMql5Parser() {
    logger.info('Тестирование MQL5Parser начато');
    
    try {
        // Читаем тестовый HTML
        const html = await fs.readFile(testHtmlPath, 'utf8');
        
        // Создаем экземпляр парсера
        const parser = new MQL5Parser({
            logger: {
                prefix: 'TestMQL5Parser',
                level: LogLevel.DEBUG,
                colorize: true
            },
            parsing: {
                verboseLogging: true,
                scriptTimeout: 10000  // Увеличиваем таймаут для отладки
            }
        });
        
        // Парсим тестовую страницу
        logger.info('Парсинг тестовой страницы...');
        const testUrl = 'http://localhost/test.html';  // Фиктивный URL
        const result = await parser._renderPage(html, testUrl);
        
        // Сохраняем результат
        await fs.writeFile(
            path.join(process.cwd(), 'test-parser-result.json'), 
            JSON.stringify(result, null, 2)
        );
        
        logger.info('Тестирование MQL5Parser завершено успешно');
        logger.info('Результат парсинга:');
        console.log(JSON.stringify(result, null, 2));
        
        return result;
    } catch (error) {
        logger.error(`Ошибка при тестировании MQL5Parser: ${error.message}`);
        logger.error(error.stack);
        throw error;
    }
}

// Запускаем тесты
async function runTests() {
    try {
        // Сначала тестируем HTMLCleaner
        const cleanerResults = await testHtmlCleaner();
        
        // Затем тестируем MQL5Parser
        const parserResults = await testMql5Parser();
        
        process.exit(0);
    } catch (error) {
        console.error('Тесты завершились с ошибкой:', error);
        process.exit(1);
    }
}

// Запускаем тесты
runTests(); 