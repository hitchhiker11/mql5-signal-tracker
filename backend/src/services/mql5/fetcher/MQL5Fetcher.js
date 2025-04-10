/**
 * MQL5Fetcher - класс для загрузки HTML-контента с сайта MQL5
 * 
 * Предоставляет функциональность для загрузки HTML-страниц с сайта MQL5
 * с оптимизированными настройками запроса и обработкой ошибок.
 */

import axios from 'axios';
import CacheManager from '../utils/CacheManager.js';
import { URL } from 'url';

class MQL5Fetcher {
    /**
     * Создает экземпляр MQL5Fetcher
     * 
     * @param {Object} options - Настройки загрузчика
     * @param {Object} [options.httpRequest] - Настройки HTTP-запросов
     * @param {Object} [options.cache] - Настройки кеширования
     * @param {Object} [options.logger] - Объект логгера
     */
    constructor(options = {}) {
        // Настройки по умолчанию для HTTP
        this.defaultHttpOptions = {
            timeout: 30000, // 30 сек
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Sec-Ch-Ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1'
            },
            maxRedirects: 5,
            validateStatus: (status) => status >= 200 && status < 300,
            decompress: true
        };

        // Применяем пользовательские настройки HTTP
        this.httpOptions = {
            ...this.defaultHttpOptions,
            ...(options.httpRequest || {})
        };

        // Инициализируем логгер
        this.logger = options.logger || {
            info: () => {},
            debug: () => {},
            warn: () => {},
            error: () => {}
        };

        // Инициализируем кеш-менеджер для HTML-контента, если кеширование включено
        if (options.cache?.enabled) {
            this.cacheManager = new CacheManager({
                ...options.cache,
                logger: this.logger
            });
            this.logger.info('MQL5Fetcher: Кеширование HTML включено');
        } else {
            this.logger.info('MQL5Fetcher: Кеширование HTML отключено');
        }

        // Создаем HTTP-клиент с настройками
        this.httpClient = axios.create({
            ...this.httpOptions
        });

        // Счетчик запросов для отслеживания и статистики
        this.requestCounter = {
            total: 0,
            success: 0,
            failed: 0,
            lastRequestTime: null
        };

        this.logger.info('MQL5Fetcher: Загрузчик HTML инициализирован');
    }

    /**
     * Проверяет, является ли URL допустимым URL сигнала MQL5
     * 
     * @param {string} url - URL для проверки
     * @returns {boolean} True, если URL валидный и относится к сигналам MQL5
     */
    isValidSignalUrl(url) {
        try {
            const parsedUrl = new URL(url);
            
            // Проверяем, что это URL с домена mql5.com
            if (!parsedUrl.hostname.includes('mql5.com')) {
                return false;
            }
            
            // Проверяем, что путь содержит '/signals/'
            if (!parsedUrl.pathname.includes('/signals/')) {
                return false;
            }
            
            // Дополнительно проверяем, что после /signals/ есть числовой идентификатор
            const signalIdMatch = parsedUrl.pathname.match(/\/signals\/(\d+)/);
            if (!signalIdMatch || !signalIdMatch[1]) {
                return false;
            }
            
            return true;
        } catch (error) {
            this.logger.error(`MQL5Fetcher: Ошибка при проверке URL: ${error.message}`);
            return false;
        }
    }

    /**
     * Получает HTML-контент по указанному URL
     * 
     * @param {string} url - URL для загрузки
     * @param {Object} options - Дополнительные опции
     * @param {boolean} [options.bypassCache=false] - Игнорировать кеш и загрузить свежий контент
     * @param {string} [options.cacheKey] - Пользовательский ключ для кеширования
     * @returns {Promise<Object>} HTML-контент и метаданные
     */
    async fetchHtml(url, options = {}) {
        const { bypassCache = false, cacheKey = 'html' } = options;
        
        // Проверяем валидность URL
        if (!this.isValidSignalUrl(url)) {
            throw new Error(`Недопустимый URL сигнала MQL5: ${url}`);
        }
        
        // Начало замера времени обработки
        const startTime = Date.now();
        
        // Пытаемся получить из кеша, если кеширование включено и не требуется обход кеша
        if (this.cacheManager && !bypassCache) {
            const cachedHtml = this.cacheManager.get(url, cacheKey);
            if (cachedHtml) {
                this.logger.info(`MQL5Fetcher: Использован кешированный HTML для ${url}`);
                return {
                    html: cachedHtml.html,
                    fromCache: true,
                    url,
                    meta: {
                        ...cachedHtml.meta,
                        processingTime: Date.now() - startTime
                    }
                };
            }
        }
        
        // Обновляем счетчики и время последнего запроса
        this.requestCounter.total++;
        this.requestCounter.lastRequestTime = new Date();
        
        try {
            this.logger.info(`MQL5Fetcher: Загрузка HTML с ${url}`);
            
            // Выполняем HTTP-запрос
            const response = await this.httpClient.get(url);
            
            // Проверяем ответ
            if (!response.data || typeof response.data !== 'string') {
                throw new Error(`Получен пустой или неверный HTML с ${url}`);
            }
            
            // Обновляем счетчик успешных запросов
            this.requestCounter.success++;
            
            // Формируем результат
            const result = {
                html: response.data,
                fromCache: false,
                url,
                meta: {
                    statusCode: response.status,
                    contentLength: response.data.length,
                    contentType: response.headers['content-type'],
                    headers: response.headers,
                    processingTime: Date.now() - startTime
                }
            };
            
            // Кешируем результат, если кеширование включено
            if (this.cacheManager) {
                this.cacheManager.set(url, { html: response.data, meta: result.meta }, cacheKey);
            }
            
            this.logger.info(`MQL5Fetcher: HTML загружен успешно, размер: ${(response.data.length / 1024).toFixed(2)} KB`);
            
            return result;
        } catch (error) {
            // Обновляем счетчик неудачных запросов
            this.requestCounter.failed++;
            
            // Логируем ошибку
            this.logger.error(`MQL5Fetcher: Ошибка при загрузке HTML с ${url}: ${error.message}`);
            
            // Пробрасываем ошибку выше для обработки вызывающим кодом
            throw new Error(`Ошибка при загрузке HTML: ${error.message}`);
        }
    }

    /**
     * Получает статистику запросов
     * 
     * @returns {Object} Статистика запросов
     */
    getRequestStats() {
        return {
            ...this.requestCounter,
            successRate: this.requestCounter.total > 0 
                ? (this.requestCounter.success / this.requestCounter.total * 100).toFixed(2) + '%' 
                : '0%',
            cacheStats: this.cacheManager ? this.cacheManager.getStats() : { enabled: false }
        };
    }

    /**
     * Очищает кеш HTML-контента
     * 
     * @returns {boolean} Успешность очистки
     */
    clearCache() {
        if (this.cacheManager) {
            return this.cacheManager.clear();
        }
        return false;
    }
}

export default MQL5Fetcher; 