/**
 * MQL5Fetcher
 * 
 * Сервис для эффективной загрузки HTML-страниц с MQL5 с кэшированием результатов.
 * Отвечает только за получение HTML-контента, без его обработки.
 */

import axios from 'axios';
import { createLogger, LogLevel } from './Logger.js';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

/**
 * @class MQL5Fetcher
 */
export class MQL5Fetcher {
    /**
     * Создает экземпляр загрузчика
     * @param {Object} config - Конфигурация
     */
    constructor(config = {}) {
        // Инициализируем логгер
        this.logger = createLogger({
            prefix: config.logger?.prefix || 'MQL5Fetcher',
            level: config.logger?.level !== undefined ? config.logger.level : LogLevel.INFO,
            transport: config.logger?.transport,
            timestamp: config.logger?.timestamp !== undefined ? config.logger.timestamp : true,
            colorize: config.logger?.colorize !== undefined ? config.logger.colorize : true
        });
        
        // Настройки HTTP-клиента
        this.httpConfig = {
            baseUrl: config.httpRequest?.baseUrl || 'https://www.mql5.com',
            headers: config.httpRequest?.headers || {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
                'Accept-Encoding': 'gzip, deflate, br',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
            },
            cookies: config.httpRequest?.cookies,
            timeout: config.httpRequest?.timeout || 30000,
            maxRedirects: config.httpRequest?.maxRedirects || 5,
            decompress: config.httpRequest?.decompress !== undefined ? config.httpRequest.decompress : true
        };
        
        // Настройки кэширования
        this.cacheEnabled = config.cache?.enabled !== undefined ? config.cache.enabled : true;
        this.cacheTTL = config.cache?.ttl !== undefined ? config.cache.ttl * 1000 : 3600000; // 1 час по умолчанию
        this.cacheDir = config.cache?.dir || path.join(process.cwd(), 'cache', 'mql5');
        
        // Подготовка кэш-директории если кэширование включено
        if (this.cacheEnabled) {
            this._prepareCacheDir().catch(err => {
                this.logger.error(`Ошибка при подготовке директории кеша: ${err.message}`);
                this.cacheEnabled = false;
            });
        }
        
        this.logger.info('MQL5Fetcher инициализирован');
    }
    
    /**
     * Загружает HTML-страницу по указанному URL
     * @param {string} url - URL страницы
     * @param {boolean} [bypassCache=false] - Игнорировать кэш и загрузить заново
     * @returns {Promise<string>} - HTML-страницы
     */
    async fetchPage(url, bypassCache = false) {
        this.logger.info(`Загрузка HTML с ${url}`);
        
        // Если кэширование включено и мы не игнорируем кэш
        if (this.cacheEnabled && !bypassCache) {
            const cachedHtml = await this._getFromCache(url);
            if (cachedHtml) {
                this.logger.debug(`Использован кэшированный HTML для URL: ${url}`);
                return cachedHtml;
            }
        }
        
        try {
            // Подготавливаем заголовки запроса
            const headers = { ...this.httpConfig.headers };
            
            // Добавляем cookies, если они указаны в конфигурации
            if (this.httpConfig.cookies) {
                headers['Cookie'] = this.httpConfig.cookies;
            }
            
            // Получаем страницу с сервера
            const response = await axios.get(url, {
                headers,
                timeout: this.httpConfig.timeout,
                maxRedirects: this.httpConfig.maxRedirects,
                decompress: this.httpConfig.decompress
            });
            
            const html = response.data;
            
            // Логируем информацию о загрузке
            const sizeInKB = (html.length / 1024).toFixed(2);
            this.logger.info(`HTML загружен успешно, размер: ${sizeInKB} KB`);
            
            // Сохраняем в кэш если кэширование включено
            if (this.cacheEnabled) {
                await this._saveToCache(url, html);
            }
            
            return html;
        } catch (error) {
            this.logger.error(`Ошибка HTTP запроса: ${error.message}`);
            if (error.response) {
                this.logger.error(`Статус ответа: ${error.response.status}`);
                this.logger.debug(`Заголовки ответа: ${JSON.stringify(error.response.headers)}`);
            }
            throw new Error(`Не удалось загрузить страницу: ${error.message}`);
        }
    }
    
    /**
     * Валидирует URL сигнала
     * @param {string} url - URL для валидации
     * @returns {Promise<boolean>} - true, если URL валиден
     * @throws {Error} - если URL невалиден
     */
    async validateSignalUrl(url) {
        this.logger.debug(`Проверка URL сигнала: ${url}`);
        
        // Проверяем формат URL
        const urlPattern = /^https:\/\/www\.mql5\.com\/[a-z]{2}\/signals\/\d+$/;
        if (!urlPattern.test(url)) {
            this.logger.error(`Неверный формат URL сигнала: ${url}`);
            throw new Error('Неверный формат URL сигнала');
        }
        
        this.logger.debug('URL сигнала корректен');
        return true;
    }
    
    /**
     * Хэширует URL для использования в качестве имени файла кэша
     * @param {string} url - URL для хэширования
     * @returns {string} - Хэш URL
     * @private
     */
    _getCacheKey(url) {
        return crypto.createHash('md5').update(url).digest('hex');
    }
    
    /**
     * Получает HTML из кэша если он существует и не устарел
     * @param {string} url - URL страницы
     * @returns {Promise<string|null>} - HTML из кэша или null
     * @private
     */
    async _getFromCache(url) {
        const cacheKey = this._getCacheKey(url);
        const cacheFilePath = path.join(this.cacheDir, `${cacheKey}.html`);
        const metaFilePath = path.join(this.cacheDir, `${cacheKey}.meta.json`);
        
        try {
            // Проверяем существование метаданных
            const metaExists = await this._fileExists(metaFilePath);
            if (!metaExists) return null;
            
            // Читаем метаданные
            const metaRaw = await fs.readFile(metaFilePath, 'utf8');
            const meta = JSON.parse(metaRaw);
            
            // Проверяем актуальность кэша
            if (Date.now() - meta.timestamp > this.cacheTTL) {
                this.logger.debug(`Кэш устарел для URL: ${url}`);
                return null;
            }
            
            // Проверяем существование файла с HTML
            const htmlExists = await this._fileExists(cacheFilePath);
            if (!htmlExists) return null;
            
            // Читаем HTML из кэша
            const html = await fs.readFile(cacheFilePath, 'utf8');
            this.logger.debug(`Найден кэш для URL: ${url}, размер: ${html.length} байт`);
            
            return html;
        } catch (error) {
            this.logger.error(`Ошибка при получении из кэша: ${error.message}`);
            return null;
        }
    }
    
    /**
     * Сохраняет HTML в кэш
     * @param {string} url - URL страницы
     * @param {string} html - HTML для сохранения
     * @returns {Promise<void>}
     * @private
     */
    async _saveToCache(url, html) {
        const cacheKey = this._getCacheKey(url);
        const cacheFilePath = path.join(this.cacheDir, `${cacheKey}.html`);
        const metaFilePath = path.join(this.cacheDir, `${cacheKey}.meta.json`);
        
        try {
            // Записываем HTML
            await fs.writeFile(cacheFilePath, html);
            
            // Записываем метаданные
            const meta = {
                url,
                timestamp: Date.now(),
                size: html.length
            };
            await fs.writeFile(metaFilePath, JSON.stringify(meta));
            
            this.logger.debug(`Сохранено в кэш: ${url}, размер: ${html.length} байт`);
        } catch (error) {
            this.logger.error(`Ошибка при сохранении в кэш: ${error.message}`);
        }
    }
    
    /**
     * Проверяет существование файла
     * @param {string} filePath - Путь к файлу
     * @returns {Promise<boolean>} - true, если файл существует
     * @private
     */
    async _fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Создает директорию для кэша если она не существует
     * @returns {Promise<void>}
     * @private
     */
    async _prepareCacheDir() {
        try {
            await fs.mkdir(this.cacheDir, { recursive: true });
            this.logger.debug(`Директория кэша подготовлена: ${this.cacheDir}`);
        } catch (error) {
            throw error;
        }
    }
    
    /**
     * Очищает кэш
     * @param {string} [url] - URL для удаления из кэша (если не указан, удаляется весь кэш)
     * @returns {Promise<void>}
     */
    async clearCache(url) {
        if (!this.cacheEnabled) return;
        
        try {
            if (url) {
                // Удаляем кэш для конкретного URL
                const cacheKey = this._getCacheKey(url);
                const cacheFilePath = path.join(this.cacheDir, `${cacheKey}.html`);
                const metaFilePath = path.join(this.cacheDir, `${cacheKey}.meta.json`);
                
                await fs.unlink(cacheFilePath).catch(() => {});
                await fs.unlink(metaFilePath).catch(() => {});
                
                this.logger.debug(`Кэш очищен для URL: ${url}`);
            } else {
                // Удаляем весь кэш
                const files = await fs.readdir(this.cacheDir);
                for (const file of files) {
                    await fs.unlink(path.join(this.cacheDir, file)).catch(() => {});
                }
                
                this.logger.debug('Весь кэш очищен');
            }
        } catch (error) {
            this.logger.error(`Ошибка при очистке кэша: ${error.message}`);
        }
    }
    
    /**
     * Получает статистику запросов и кеширования
     * @returns {Object} Статистика
     */
    getRequestStats() {
        return {
            cacheEnabled: this.cacheEnabled,
            cacheTTL: this.cacheTTL / 1000, // Конвертируем в секунды для вывода
            baseUrl: this.httpConfig.baseUrl,
            timeout: this.httpConfig.timeout
        };
    }
}

export default MQL5Fetcher;