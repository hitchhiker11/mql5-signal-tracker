/**
 * MQL5Service
 * 
 * Основной сервис для парсинга данных с сайта MQL5.
 * Управляет потоком парсинга и предоставляет публичный API для извлечения данных.
 */

import FastHtmlCleaner from './utils/FastHtmlCleaner.js';
import { SimpleHtmlParser } from './parser/SimpleHtmlParser.js';
import { MQL5Fetcher } from './utils/MQL5Fetcher.js';
import { MQL5Parser } from './parser/MQL5Parser.js';
import { createLogger, LogLevel } from './utils/Logger.js';
import defaultConfig from './config/default.js';
import { EventEmitter } from 'events';
import * as cheerio from 'cheerio';

/**
 * @class MQL5Service
 * @extends EventEmitter
 */
export class MQL5Service extends EventEmitter {
    /**
     * Создает экземпляр сервиса
     * @param {Object} config - Конфигурация сервиса
     */
    constructor(config = {}) {
        super();
        
        // Объединяем конфигурацию с настройками по умолчанию
        this.config = this._mergeConfig(defaultConfig, config);
        
        // Инициализируем логгер
        this.logger = createLogger({
            prefix: this.config.logger?.prefix || 'MQL5Service',
            level: this.config.logger?.level !== undefined ? this.config.logger.level : LogLevel.INFO,
            transport: this.config.logger?.transport,
            timestamp: this.config.logger?.timestamp !== undefined ? this.config.logger.timestamp : true,
            colorize: this.config.logger?.colorize !== undefined ? this.config.logger.colorize : true
        });
        
        // Инициализируем компоненты
        this.fetcher = new MQL5Fetcher(this.config);
        this.htmlCleaner = new FastHtmlCleaner(this.config.htmlCleaning);
        this.simpleParser = new SimpleHtmlParser(this.config);
        
        // Убираем ленивую инициализацию - создаем MQL5Parser сразу
        try {
            this.advancedParser = new MQL5Parser(this.config);
            this.logger.info('MQL5Parser initialized successfully during service setup.');
        } catch (error) {
            this.logger.error(`Failed to initialize MQL5Parser during service setup: ${error.message}`);
            this.logger.error(`Advanced parsing will likely fail. Stack: ${error.stack}`);
            this.advancedParser = null; // Устанавливаем в null, чтобы избежать дальнейших ошибок
        }
        
        // Режим парсинга (fast, normal, advanced)
        this.parsingMode = this.config.parsingMode || 'normal';
        
        this.logger.info(`MQL5Service initialized in ${this.parsingMode} mode`);
    }
    
    /**
     * Получает данные сигнала по URL
     * @param {string} url - URL сигнала
     * @param {Object} options - Опции для парсинга
     * @returns {Promise<Object>} - Данные сигнала
     */
    async getSignalData(url, options = {}) {
        try {
            // Проверяем URL
            await this.fetcher.validateSignalUrl(url);
            
            // Определяем режим парсинга для текущего запроса
            const mode = options.mode || this.parsingMode;
            this.logger.info(`Запрос данных сигнала ${url} (режим: ${mode})`);
            
            // Отслеживаем время выполнения
            const startTime = Date.now();
            
            // Получаем HTML-страницу
            const html = await this.fetcher.fetchPage(url, options.bypassCache);
            const originalSize = html ? html.length : 0;
            
            // Реагируем на режим парсинга
            let data;
            let processedSize = originalSize;
            let parser = 'Unknown';
            
            switch (mode) {
                case 'fast':
                    data = await this._fastParsing(html, url);
                    parser = 'SimpleHtmlParser';
                    break;
                case 'advanced':
                    try {
                        data = await this._advancedParsing(html, url);
                        parser = 'MQL5Parser';
                    } catch (error) {
                        this.logger.error(`Ошибка в режиме advanced: ${error.message}`);
                        this.logger.error(`Стек ошибки advanced: ${error.stack}`);
                        this.logger.warn(`Переключаемся на normal из-за ошибки в advanced`);
                        const cleanedHtml = this.htmlCleaner.clean(html);
                        processedSize = cleanedHtml.length;
                        data = await this.simpleParser.parseSignal(cleanedHtml, url);
                        parser = 'SimpleHtmlParser (fallback)';
                    }
                    break;
                case 'normal':
                default:
                    const cleanedHtml = this.htmlCleaner.clean(html);
                    processedSize = cleanedHtml.length;
                    data = await this.simpleParser.parseSignal(cleanedHtml, url);
                    parser = 'SimpleHtmlParser';
                    break;
            }
            
            // Рассчитываем время выполнения
            const endTime = Date.now();
            const processingTime = endTime - startTime;
            
            this.logger.info(`Данные сигнала получены за ${processingTime}ms`);
            
            // Добавляем метаданные о процессе парсинга
            data.meta = {
                parsedAt: new Date().toISOString(),
                processingTime,
                parser,
                mode,
                url,
                originalSize,
                processedSize,
                ...(data.meta || {})
            };
            
            // Генерируем событие о завершении парсинга
            this.emit('signalParsed', {
                url,
                processingTime,
                mode
            });
            
            return data;
        } catch (error) {
            this.logger.error(`Ошибка получения данных сигнала: ${error.message}`);
            this.logger.debug(`Стек ошибки: ${error.stack}`);
            
            // Генерируем событие об ошибке
            this.emit('error', {
                url,
                error: error.message,
                stack: error.stack
            });
            
            throw error;
        }
    }
    
    /**
     * Быстрый режим парсинга (только основные данные)
     * @param {string} html - HTML страницы
     * @param {string} url - URL страницы
     * @returns {Promise<Object>} - Базовые данные сигнала
     * @private
     */
    async _fastParsing(html, url) {
        this.logger.debug('Using fast parsing mode');
        
        // В быстром режиме пропускаем очистку HTML для экономии времени
        return this.simpleParser.parseSignal(html, url);
    }
    
    /**
     * Обычный режим парсинга (с очисткой HTML)
     * @param {string} html - HTML страницы
     * @param {string} url - URL страницы
     * @returns {Promise<Object>} - Данные сигнала
     * @private
     */
    async _normalParsing(html, url) {
        this.logger.debug('Using normal parsing mode');
        
        // Очищаем HTML перед парсингом
        const cleanedHtml = this.htmlCleaner.clean(html);
        
        // Добавляем логирование для отладки
        this.logger.debug(`HTML после очистки (первые 200 символов): ${cleanedHtml.substring(0, 200)}...`);
        
        // Выводим информацию о наличии ключевых селекторов
        const $ = cheerio.load(cleanedHtml);
        const signalNameElement = $('.signal-header-name');
        const authorElement = $('.signal-header-author');
        
        this.logger.debug(`Найдены элементы: signal-header-name=${signalNameElement.length}, signal-header-author=${authorElement.length}`);
        
        if (signalNameElement.length) {
            this.logger.debug(`Текст signal-header-name: '${signalNameElement.text().trim()}'`);
        }
        
        if (authorElement.length) {
            this.logger.debug(`Текст signal-header-author: '${authorElement.text().trim()}'`);
        }
        
        // Парсим с помощью SimpleHtmlParser
        return this.simpleParser.parseSignal(cleanedHtml, url);
    }
    
    /**
     * Расширенный режим парсинга (с JSDOM для извлечения данных из JavaScript)
     * @param {string} html - HTML страницы
     * @param {string} url - URL страницы
     * @returns {Promise<Object>} - Полные данные сигнала, включая графики
     * @private
     */
    async _advancedParsing(html, url) {
        this.logger.debug('Using advanced parsing mode');
        
        // Проверяем, был ли парсер успешно инициализирован в конструкторе
        if (!this.advancedParser) {
            throw new Error('MQL5Parser was not initialized successfully. Cannot perform advanced parsing.');
        }
        
        // Используем предварительно инициализированный MQL5Parser
        // MQL5Parser.parseSignal требует URL, а не HTML
        return await this.advancedParser.parseSignal(url);
    }
    
    /**
     * Устанавливает режим парсинга по умолчанию
     * @param {string} mode - Режим парсинга: 'fast', 'normal', 'advanced'
     */
    setParsingMode(mode) {
        const validModes = ['fast', 'normal', 'advanced'];
        if (!validModes.includes(mode)) {
            throw new Error(`Invalid parsing mode: ${mode}. Must be one of: ${validModes.join(', ')}`);
        }
        
        this.parsingMode = mode;
        this.logger.info(`Parsing mode set to: ${mode}`);
    }
    
    /**
     * Очищает кэш
     * @param {string} [url] - URL для удаления из кэша (если не указан, удаляется весь кэш)
     * @returns {Promise<void>}
     */
    async clearCache(url) {
        return this.fetcher.clearCache(url);
    }
    
    /**
     * Объединяет конфигурации рекурсивно
     * @param {Object} defaultConfig - Конфигурация по умолчанию
     * @param {Object} userConfig - Пользовательская конфигурация
     * @returns {Object} - Объединенная конфигурация
     * @private
     */
    _mergeConfig(defaultConfig, userConfig) {
        const result = { ...defaultConfig };
        
        for (const [key, value] of Object.entries(userConfig)) {
            if (value === null || value === undefined) {
                continue;
            }
            
            if (typeof value === 'object' && !Array.isArray(value) && typeof result[key] === 'object' && !Array.isArray(result[key])) {
                result[key] = this._mergeConfig(result[key], value);
            } else {
                result[key] = value;
            }
        }
        
        return result;
    }
}

export default MQL5Service; 